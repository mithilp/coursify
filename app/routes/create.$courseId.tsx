import {
	Alert,
	AlertIcon,
	Box,
	Button,
	Divider,
	Heading,
	Stack,
	Text,
	Step,
	StepIcon,
	StepIndicator,
	StepNumber,
	StepSeparator,
	StepStatus,
	StepTitle,
	Stepper,
	useSteps,
	IconButton,
	Icon,
} from "@chakra-ui/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { doc, updateDoc } from "firebase/firestore";
import mixpanel from "mixpanel-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	FaCheck,
	FaChevronRight,
	FaEnvelope,
	FaChevronLeft,
	FaBars,
} from "react-icons/fa6";
import CreateCourseChapter from "~/components/CreateCourseChapter";
import { db } from "~/utils/firebase";
import {
	getCourse,
	getTranscript,
	promptGemini,
	searchYouTube,
} from "~/models/course.server";

export const loader = async ({ params }: LoaderArgs) => {
	const data = await getCourse(params.courseId as string);
	if (data.error) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	} else {
		return json({
			params: params,
			data: await getCourse(params.courseId as string),
		});
	}
};

export const action = async ({ request }: ActionArgs) => {
	try {
		const formData = await request.formData();
		const final_data = formData.get("final_data") as string;
		if (final_data == "true") {
			const courseInfo = JSON.parse(formData.get("courseInfo") as string);
			const courseId = formData.get("courseId") as string;
			const imageResponseRaw = await fetch(
				`https://api.unsplash.com/search/photos?per_page=1&query=${courseInfo.title}&client_id=${process.env.UNSPLASH_API}`
			);
			const imageResponse = await imageResponseRaw.json();
			courseInfo.image = imageResponse.results[0].urls.small_s3;
			await updateDoc(doc(db, "courses", courseId), courseInfo);
			return redirect(`/course/${courseId}/0/0`);
		} else {
			let chapter_title = formData.get("chapter_title") as string;
			let youtube_search_query = formData.get("youtube_search_query") as string;
			const videoId = await searchYouTube(youtube_search_query);
			const transcript = await getTranscript(videoId);

			let combinedPrompt; // Variable to hold the prompt for the AI (Gemini)

			// Check if the transcript was successfully provided
			if (transcript.success) {
				// If transcript is available, ask for both a summary and a quiz based on the transcript
				combinedPrompt = `
    Please perform the following two tasks based on the provided transcript:
    1. Summarize the transcript in 250 words or less. Do not mention sponsors or anything unrelated to the main topic. Do not introduce the summary with phrases like "This is a summary."
    2. Generate at least 3 general educational quiz questions based on the transcript. The questions should cover the entire content and not focus on specific details. The output should be an array of questions, with each question containing a question string, 4 answer choices in an array, and the index of the correct answer.

    Here is the transcript: ${transcript}

    Return your answer in the following JSON format:
    {
      "chapter_title": "${chapter_title}",
      "summary": "<summary>",
      "quiz": [
        {
          "question": "<question>",
          "choices": ["choice1", "choice2", "choice3", "choice4"],
          "answer": <index>
        },
        ...
      ]
    }`;
			} else {
				// If transcript is not available, ask for a summary and quiz based on the chapter title alone
				combinedPrompt = `
    Please perform the following two tasks:
    1. Summarize the topic "${chapter_title}" in 250 words or less.
    2. Generate at least 3 general educational quiz questions related to the topic. The output should be an array of questions, with each question containing a question string, 4 answer choices in an array, and the index of the correct answer.

    Return your answer in the following JSON format:
    {
      "chapter_title": "${chapter_title}",
      "summary": "<summary>",
      "quiz": [
        {
          "question": "<question>",
          "choices": ["choice1", "choice2", "choice3", "choice4"],
          "answer": <index>
        },
        ...
      ]
    }`;
			}

			// Send the combined prompt to Gemini to get both the summary and quiz
			const combinedResponse = await promptGemini(combinedPrompt);
			console.log(chapter_title, " combinedResponse\n", combinedResponse);

			// Parse the response from Gemini to extract the summary and quiz
			const parsedResponse = JSON.parse(combinedResponse);
			const summary = parsedResponse.summary; // Extract the summary
			const quiz = parsedResponse.quiz; // Extract the quiz

			// Log the summary and quiz to the console for debugging
			console.log(chapter_title, " summary\n", summary);
			console.log(chapter_title, " quiz\n", quiz);

			// Return an object containing the success flag and chapter information (title, video ID, summary, and quiz)
			return {
				success: true,
				chapterInfo: {
					title: chapter_title, // The chapter title
					video: videoId, // Video ID related to the chapter (if applicable)
					summary: summary, // Summary generated from the transcript or chapter title
					quiz: quiz, // Quiz generated from the transcript or chapter title
				},
			};
		}
	} catch (error) {
		console.error(error);
		return {
			success: false,
		};
	}
};

export default function FinishCourse() {
	const { params, data } = useLoaderData<typeof loader>();

	const [isErrored, setIsErrored] = useState(false);
	const [isLoading, setIsLoading] = useState<string[]>([]);
	const [finalData, setFinalData] = useState<any[][]>([]);
	const [allDone, setAllDone] = useState(false);

	const elementsRefs: any = data.units.map((unit: any) =>
		unit.chapters.map(() => useRef())
	);

	useEffect(() => {
		if (finalData.length === 0) {
			setFinalData(
				data.units.map((unit: any) =>
					unit.chapters.map(() => {
						return {};
					})
				)
			);
		}
	}, [finalData]);

	const navigate = useNavigate();

	const generateChapterInfos = useCallback(() => {
		setIsErrored(false);
		data.units.forEach((unit: any, i: number) => {
			unit.chapters.forEach((chapter: any, j: number) => {
				elementsRefs[i][j].current.triggerLoad();
				setIsLoading((prev) => [...prev, `${i} ${j}`]);
			});
		});
	}, []);

	const steps = [
		{ title: "First", description: "Enter Units" },
		{ title: "Second", description: "Confirm Chapters" },
		{ title: "Third", description: "Save & Finish" },
	];

	const { activeStep, setActiveStep } = useSteps({
		index: 1,
		count: steps.length,
	});

	const onComplete = () => {
		setAllDone(true);
		setActiveStep(2);
	};

	const fetcher = useFetcher();

	const saveAndFinish = () => {
		mixpanel.track("Save Course", {
			title: data.title,
		});
		const newLoading = isLoading;
		newLoading.push("submitting");
		setIsLoading(newLoading);
		const formattedData = {
			title: data.title,
			public: true,
			completed: true,
			units: [
				...data.units.map((unit: any, i: number) => {
					return {
						title: unit.title,
						chapters: [
							...unit.chapters.map(
								(chapter: any, j: number) => finalData[i][j]
							),
						],
					};
				}),
			],
		};
		const formData = new FormData();
		formData.append("final_data", "true");
		formData.append("courseId", params.courseId);
		formData.append("courseInfo", JSON.stringify(formattedData));
		fetcher.submit(formData, { method: "post" });
	};

	return (
		<Stack margin="auto" maxW="xl" p={8} h="calc(100vh - 90px)" spacing={4}>
			<Stepper size="sm" index={activeStep}>
				{steps.map((step, index) => (
					<Step key={index}>
						<Stack align={"center"}>
							<StepIndicator>
								<StepStatus
									complete={<StepIcon />}
									incomplete={<StepNumber />}
									active={<StepNumber />}
								/>
							</StepIndicator>

							<Box textAlign={"center"} flexShrink="0">
								<StepTitle>{step.description}</StepTitle>
							</Box>
						</Stack>

						<StepSeparator />
					</Step>
				))}
			</Stepper>

			<Divider />

			<Stack spacing={0}>
				<Text
					color="whiteAlpha.600"
					fontWeight="semibold"
					letterSpacing="wide"
					fontSize="xs"
					textTransform="uppercase"
				>
					Course Name:
				</Text>
				<Heading size="xl">{data.title}</Heading>D
			</Stack>

			<Box>
				<Alert status="info" borderRadius={"lg"}>
					<AlertIcon />
					<Text fontSize={{ base: "sm", md: "md" }}>
						We generated chapters for each of your units. Look over them and
						then click the "Finish Course Generation" button to confirm and
						continue.
					</Text>
				</Alert>
			</Box>

			{data.units.map((unit: any, i: number) => (
				<Stack key={i}>
					<Stack spacing={0}>
						<Text
							color="whiteAlpha.600"
							fontWeight="semibold"
							letterSpacing="wide"
							fontSize="xs"
							textTransform="uppercase"
						>
							Unit {i + 1}:
						</Text>
						<Heading size="md">{unit.title}</Heading>
					</Stack>
					<Stack spacing={2}>
						{unit.chapters.map((chapter: any, j: number) => (
							<CreateCourseChapter
								key={`${i}${j}`}
								chapterTitle={chapter.chapter_title}
								chapterNumber={j}
								searchQuery={chapter.youtube_search_query}
								ref={elementsRefs[i][j]}
								onError={() => {
									setIsErrored(true);
									setIsLoading((prev) =>
										prev.splice(prev.indexOf(`${i} ${j}`), 1)
									);
								}}
								onComplete={(chapterInfo: any) => {
									const newLoading = isLoading;
									if (newLoading.indexOf(`${i} ${j}`) !== -1) {
										newLoading.splice(newLoading.indexOf(`${i} ${j}`), 1);
										setIsLoading(newLoading);
									}

									const updatedData = finalData;
									updatedData[i][j] = chapterInfo;
									setFinalData(updatedData);

									if (isLoading.length == 0 && !allDone) {
										onComplete();
									}
								}}
							/>
						))}
					</Stack>
				</Stack>
			))}
			{isErrored && (
				<Alert minH={100} status="error" borderRadius={"lg"}>
					<AlertIcon />
					<Text fontSize={{ base: "sm", md: "md" }}>
						An error occurred while creating one of your chapters. Click the
						"Contact Us" button to report the issue.
					</Text>
				</Alert>
			)}

			<Stack direction={"row"} pb={8} align="center" spacing={4}>
				<Divider orientation="horizontal" />
				<Box>
					<Button
						leftIcon={<FaChevronLeft />}
						onClick={() => {
							navigate(-1);
						}}
					>
						Back
					</Button>
				</Box>
				<Box>
					<Button
						rightIcon={
							isErrored ? (
								<FaEnvelope />
							) : allDone ? (
								<FaCheck />
							) : (
								<FaChevronRight />
							)
						}
						onClick={
							isErrored
								? () => navigate("/contact")
								: allDone
									? saveAndFinish
									: generateChapterInfos
						}
						colorScheme={isErrored ? "red" : allDone ? "green" : "blue"}
						isLoading={isLoading.length > 0}
						loadingText={allDone ? "Saving" : "Generating"}
					>
						{isErrored ? "Contact Us" : allDone ? "Save & Finish" : "Generate"}
					</Button>
				</Box>
				<Divider orientation="horizontal" />
			</Stack>
		</Stack>
	);
}
