import { YoutubeTranscript } from "youtube-transcript";
import { db } from "../utils/firebase";
import {
	getDoc,
	addDoc,
	doc,
	collection,
	getDocs,
	query,
	where,
	setDoc,
} from "@firebase/firestore";
import { m } from "framer-motion";

export type Course = {
	title: string;
	units: {
		title: string;
		chapters: {
			title: string;
		}[];
	}[];
};

export async function getAllCourses() {
	const coursesRef = await collection(db, "courses");
	const queryRef = query(
		coursesRef,
		where("completed", "==", true),
		where("public", "==", true)
	);
	const coursesSnapshot = await getDocs(queryRef);
	const coursesData = await coursesSnapshot.docs.map((doc) => {
		return { data: doc.data(), id: doc.id };
	});
	return coursesData;
}

export async function getCourse(id: string): Promise<any> {
	let data: Course = {
		title: "",
		units: [],
	};
	const document = await getDoc(doc(db, "courses", id));

	if (document.exists()) {
		data = document.data() as Course;
		return data;
	} else {
		return {
			error: "Course not found",
		};
	}
}

export async function promptGemini(prompt: string) {
	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						role: "user",
						parts: [
							{
								text: prompt,
							},

						],
					},
				],

				generationConfig: {
					temperature: 1,
					topK: 64,
					topP: 0.95,
					maxOutputTokens: 8192,
					responseMimeType: "application/json",
				},
			}),
		}
	);
	const jsonResponse = await response.json();

	console.log(prompt, "\n", jsonResponse);

	return jsonResponse.candidates[0].content.parts[0].text;
}

export async function geminiChatCompletion(prompt: string, previousMessages: Array<{ content: string, from: "user" | "bot" }>) {

	const contents = previousMessages.map((message) => {
		return {
			role: message.from == "user" ? "user" : "model",
			parts: [
				{
					text: message.content,
				},

			],
		}
	})
	contents.push({

		role: "user",
		parts: [
			{
				text: prompt,
			},

		],

	})


	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: contents,

				generationConfig: {
					temperature: 1,
					topK: 64,
					topP: 0.95,
					maxOutputTokens: 8192,
					responseMimeType: "application/json",
				},
			}),
		}
	);
	const jsonResponse = await response.json();

	return jsonResponse.candidates[0].content.parts[0].text;
}

// returns id of video given search query
export async function searchYouTube(searchQuery: string) {
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

// returns transcript of video given video id
export async function getTranscript(videoId: string) {
	try {
		let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
			lang: "en",
			country: "EN",
		});
		let transcript = "";
		for (let i = 0; i < transcript_arr.length; i++) {
			transcript += transcript_arr[i].text + " ";
		}
		return { transcript: transcript.replaceAll("\n", " "), success: true };
	} catch (e) {
		return { transcript: "error", success: false };
	}
}

export async function createChapters(title: string, unitsArray: string[]) {
	let unitsString = "";
	for (let i = 1; i <= unitsArray.length; i++) {
		unitsString += `Unit ${i}: ${unitsArray[i - 1]}\n`;
	}
	const prompt = `${unitsString}
	It is your job to create a course about ${title}. The user has requested to create chapters for each of the above units. Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educational video for each chapter. Each query should give an educational informative course in youtube.
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
	try {
		console.log("starting to create chapters");
		const geminiResponse = await promptGemini(prompt);
		console.log("created chapters");
		console.log(geminiResponse);

		const units = await JSON.parse(geminiResponse);
		console.log("created chapters");
		const docRef = await addDoc(collection(db, "courses"), {
			title: title,
			units: units,
			completed: false,
			public: false,
		});
		console.log("added to firebase", docRef.id);
		return {
			courseId: await docRef.id,
		};
	} catch (error) {
		console.log("FAILED: Error Info getting course info");
		console.log("error:\n", error, "\n\n");
		return {
			message: error as string,
		};
	}
}

export async function queryChat(
	prompt: string,
	context: string,
	examples: any[],
	messages: any[]
) {
	messages.push({
		content: prompt,
	});
	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${process.env.GEMINI_API}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: {
					context: context,
					messages: messages,
					examples: examples,
				},
				temperature: 0.25,
				top_k: 40,
				top_p: 0.95,
				candidate_count: 1,
			}),
		}
	);

	const json = await response.json();
	console.log("QUERYCHAT");
	console.log(json);
	examples.push({
		input: {
			content: prompt,
		},
		output: {
			content: json.candidates[0].content,
		},
	});

	return [examples, messages];
}

export async function chatBot(
	prompt: string,
	chapTitle: string,
	chapSummary: string,
	previousMessages: Array<{ content: string, from: "user" | "bot" }>,
	courseId: string,
	unitId: number
) {
	const course = await getCourse(courseId);

	prompt =
		"answer in simple english. THE FOLLOWING IS THE PROMPT: " +
		prompt +
		"\nONE TO TWO SENTENCE ANSWER USING THE FOLLOWING CONTEXT USING PLAIN AND SIMPLE ENGLISH. The title of the course is: " +
		course.title +
		". The course has the following unit titles and chapters: " +
		course.units[unitId].title +
		" with the current chapter on " +
		chapTitle +
		" and a summary of " +
		chapSummary;

	const response = await geminiChatCompletion(
		prompt,
		previousMessages
	);

	return JSON.parse(response).answer;
}
