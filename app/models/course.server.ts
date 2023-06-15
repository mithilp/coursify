import { YoutubeTranscript } from "youtube-transcript";
import { db } from "../../src/utils/firebase";
import { getDoc, addDoc, doc, collection } from "@firebase/firestore";

export type Course = {
	title: string;
	units: {
		title: string;
		chapters: {
			title: string;
		}[];
	}[];
};

export async function getCourse(id: string): Promise<any> {
	console.log("id: ", id);
	let data = {};
	const document = await getDoc(doc(db, "courses", id));

	if (document.exists()) {
		data = document.data();
		return data;
	} else {
		return {
			error: "Course not found",
		};
	}
}

async function promptPalm(prompt: string) {
	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${process.env.PALM_API}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: {
					text: prompt,
				},
				temperature: 0.9,
				top_k: 40,
				top_p: 0.95,
				candidate_count: 1,
				max_output_tokens: 2048,
				stop_sequences: [],
				safety_settings: [
					{ category: "HARM_CATEGORY_DEROGATORY", threshold: 3 },
					{ category: "HARM_CATEGORY_TOXICITY", threshold: 3 },
					{ category: "HARM_CATEGORY_VIOLENCE", threshold: 3 },
					{ category: "HARM_CATEGORY_SEXUAL", threshold: 3 },
					{ category: "HARM_CATEGORY_MEDICAL", threshold: 3 },
					{ category: "HARM_CATEGORY_DANGEROUS", threshold: 3 },
				],
			}),
		}
	);
	console.log("PaLM api status: ", response.status);
	const json = await response.json();
	return json.candidates[0].output;
}

async function searchYouTube(searchQuery: string) {
	const response = await fetch(
		`https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&part=snippet&maxResults=1`,
		{
			method: "GET",
		}
	);
	const json = await response.json();
	if (json.items[0] == undefined) {
		console.log("search yt");
	}
	return json.items[0].id.videoId;
}

async function getTranscript(videoId: string) {
	try {
		let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
			lang: "en",
			country: "EN",
		});
		let transcript = "";
		for (let i = 0; i < transcript_arr.length; i++) {
			transcript += transcript_arr[i].text + "";
		}
		return transcript.replaceAll("\n", " ");
	} catch (e) {
		const response = await fetch(
			`https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API}&id=${videoId}&videoDuration=medium&videoEmbeddable=true&type=video&part=snippet&maxResults=1`,
			{
				method: "GET",
			}
		);
		const json = await response.json();
		return json.items[0].snippet.title;
	}
}

function createObj(
	title: string,
	video_id: string,
	video_summary: string,
	quiz: Object[]
) {
	return {
		title: title,
		video_id: video_id,
		video_summary: video_summary,
		quiz: quiz,
	};
}

export async function createCourse(data: any): Promise<any> {
	console.log("got request\n", data);
	let units = "";
	for (let i = 1; i <= data.units.length; i++) {
		units += `Unit ${i}: ${data.units[i - 1]}\n`;
	}

	const prompt = `${units}
	It is your job to create a course about ${data.title}. The user has requested to create chapters for each of the above units. Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educational video for each chapter. Each query should give an educational informative course in youtube.
	Important: Give the response in an array of JSON like the example below with the title of each array index corresponding to the unit title:
	[
		{
			"title": "World War II Battles",
			"chapters": [
				{
					"youtube_search_query": "all about important battles in WW2",
					"chapter_title": "Important Battles"
				},
				{
					"youtube_search_query": "battle strategies in WW2",
					"chapter_title": "Battle Strategies"
				},
				{
					"youtube_search_query": "Battle of Stalingrad short explanation",
					"chapter_title": "Battle of Stalingrad"
				} etc...
			]
		},
		{
			"title": "World War II Alliances",
			"chapters": [
				{
					"youtube_search_query": "all about the allied powers in WW2",
					"chapter_title": "Allied Powers"
				},
				{
					"youtube_search_query": "all about the axis powers in WW2",
					"chapter_title": "Axis Powers"
				},
				{
					"youtube_search_query": "netural powers and their roles in WW2",
					"chapter_title": "Neutral Powers"
				} etc...
			]
		}
	]
	`;
	let courseInfo;
	let gotCourseInfo = false;
	let tried = 0;
	while (!gotCourseInfo) {
		if (tried < 5) {
			try {
				console.log("starting to get expanded course info");
				courseInfo = await promptPalm(prompt);
				const courseInfoFragments = courseInfo.split("[");
				let courseInfoString = "";
				for (const i in courseInfoFragments) {
					if (Number(i) === 0) {
					} else {
						if (Number(i) == courseInfoFragments.length - 1) {
							courseInfoString += "[";
							courseInfoString += courseInfoFragments[i].split("`")[0];
						} else {
							courseInfoString += "[";
							courseInfoString += courseInfoFragments[i];
						}
					}
				}
				courseInfo = JSON.parse(courseInfoString);
				gotCourseInfo = true;
				console.log("got course info");
			} catch (error) {
				console.log("FAILED: Error Info getting course info");
				console.log("prompt:\n", prompt);
				console.log("error:\n", error, "\n\n");
			}
			tried++;
		} else {
			throw new Error("failed to get course info 5 times");
		}
	}

	let newUnits = [];
	for (let i = 0; i < courseInfo.length; i++) {
		let newChapters = [];
		for (let j = 0; j < courseInfo[i].chapters.length; j++) {
			console.log(`starting chapter ${j} of unit ${i}`);
			let videoId = await searchYouTube(
				courseInfo[i].chapters[j].youtube_search_query
			);
			let transcript = await getTranscript(videoId);
			console.log(`got transcript for chapter ${j}`);
			let summaryPrompt = `summarize in 250 words or less and don't talk of the sponsors or anything unrelated to the main topic. also do not introduce what the summary is about:\n${transcript}`;

			let summary;
			let gotSummary = false;
			let tried = 0;
			while (!gotSummary) {
				if (tried < 5) {
					try {
						summary = await promptPalm(summaryPrompt);
						gotSummary = true;
						console.log("got summary");
					} catch (error) {
						console.log("FAILED: Error Info getting summary");
						console.log("prompt:\n", summaryPrompt);
						console.log("error:\n", error, "\n\n");
					}
					tried++;
				} else {
					throw new Error("tried getting summary too many times");
				}
			}
			let quizPrompt = `
				${transcript}
Above is a transcript of a video. Use the information in the transcript to create 2 multiple choice questions, each with 4 choices. Format the questions as a JavaScript array, like in the example below. Follow the format exactly, you can add onto it but follow the exact same format. MAKE SURE THE JSON IS FORMATTED WITH TABS AND NOT SPACES. MAKE SURE THE CODE CAN BE PARSED BY A JSON.parse() function and make sure to add the closing tags AND DON'T FORGET ANY COMMAS:
[{"question": "Who was the first president of the United States?",
"answers": [
{
"choice": "George Washington",
"correct": true
},
{
"choice": "Biden",
"correct": false
},
{
"choice": "trump",
"correct": false
},
{
"choice": "obama",
"correct": false
}
]
},
{
"question": "Who said the famous quote \"Every post is honorable in which a man can serve his country.\"?",
"courseInfos": [
{
"choice": "George Washington",
"correct": true
},
{
"choice": "Biden",
"correct": false
},
{
"choice": "trump",
"correct": false
},
{
"choice": "obama",
"correct": false
}
]
}
]`;
			let quizJSON;
			let gotQuiz = false;
			tried = 0;
			while (!gotQuiz) {
				if (tried < 5) {
					try {
						let quiz = await promptPalm(quizPrompt);
						console.log("got palm quiz response");
						const quizFragments = quiz.split("[");
						let quizString = "";
						for (const i in quizFragments) {
							if (Number(i) == 0) {
							} else {
								if (Number(i) == quizFragments.length - 1) {
									quizString += "[";
									quizString += quizFragments[i].split("`")[0];
								} else {
									quizString += "[";
									quizString += quizFragments[i];
								}
							}
						}
						console.log("about to parse quiz");
						quizJSON = JSON.parse(quizString);
						gotQuiz = true;
						console.log("parsed quiz");
					} catch (error) {
						console.log("FAILED: Error Info getting guiz");
						console.log("prompt:\n", quizPrompt);
						console.log("error:\n", error, "\n\n");
					}
					tried++;
				} else {
					throw new Error("tried getting quiz too many times");
				}
			}

			let chapterObj = createObj(
				courseInfo[i].chapters[j].chapter_title,
				videoId,
				summary,
				quizJSON
			);
			newChapters.push(chapterObj);
			console.log("created and added object");
		}

		newUnits.push({
			title: courseInfo[i].title,
			chapters: newChapters,
		});
		console.log("added unit: ", courseInfo[i].title);
	}
	let course = {
		title: data.title,
		units: newUnits,
	};
	console.log("data ready to add to firebase\n", typeof course);
	const docRef = await addDoc(collection(db, "courses"), course);
	console.log("added to firebase", docRef.id);
	return {
		courseId: docRef.id,
	};
}
