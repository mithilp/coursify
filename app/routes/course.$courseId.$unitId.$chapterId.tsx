"use client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { getCourse } from "~/models/course.server";
import {
	Alert,
	AlertIcon,
	AspectRatio,
	Box,
	Button,
	Divider,
	Heading,
	Icon,
	LinkBox,
	LinkOverlay,
	Spacer,
	Stack,
	Text,
	HStack,
	Textarea,
	Avatar,
	Input,
} from "@chakra-ui/react";
import Question from "../../src/components/Question";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import CourseSidebar from "src/components/CourseSidebar";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
// import { chat } from "../globalChatVariable";
import { chatBot } from "../models/course.server";
import type { ActionArgs } from "@remix-run/node"; // or cloudflare/deno
import { db } from "../../src/utils/firebase";
import { getDoc, doc, collection, getDocs, setDoc } from "@firebase/firestore";

export const loader = async ({ params }: LoaderArgs) => {
	const data = await getCourse(params.courseId as string);

	if (data.error) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	} else {
		let chat = (await getDoc(doc(db, "chat", "MfmN5BhbPpaLzBuNjV9l"))) || "";
		// useEffect(() => {
		// 	chat = JSON.parse(localStorage.getItem("chat") || "{}");
		// });
		return json({
			params: params,
			data: await getCourse(params.courseId as string),
			chat: chat.data(),
		});
		// return {
		// 	params: params,
		// 	data: await getCourse(params.courseId as string),
		// 	chat: chat,
		// };
	}
};

export async function action({ request }: ActionArgs) {
	const formData = await request.formData();
	const formObject = Object.fromEntries(formData);
	let prompt = formObject.message.toString();
	let courseId = formObject.courseId.toString();
	let chapterId = formObject.chapterId.toString();
	let unitId = formObject.unitId.toString();
	let past_chat = JSON.parse(formObject.chat.toString());
	console.log("courseID", courseId);
	const response = await chatBot(
		prompt,
		courseId,
		unitId,
		chapterId,
		past_chat
	);
	// localStorage.setItem("chat", JSON.stringify(response));
	useEffect(() => {
		localStorage.setItem("chat", JSON.stringify(response));
	});
	// let chat_examples = await getDoc(doc(db, "chat", "MfmN5BhbPpaLzBuNjV9l"));
	return response;
}

const PostSlug: React.FC = () => {
	const { params, data, chat } = useLoaderData<typeof loader>();
	const chapterInfo = data.units[params.unitId].chapters[params.chapterId];
	const [check, setCheck] = useState(false);

	return (
		<Stack direction={"row"} h="100%">
			<CourseSidebar data={data} params={params} />
			<Box overflowY={"scroll"} p={8} w="100%">
				<Stack w="100%" h="100%">
					<Stack direction={{ base: "column", md: "row" }} spacing={8}>
						<Stack w="100%">
							<Stack spacing={0}>
								<Box
									color="whiteAlpha.600"
									fontWeight="semibold"
									letterSpacing="wide"
									fontSize="xs"
									textTransform="uppercase"
								>
									Unit {+params.unitId + 1} &bull; Chapter{" "}
									{+params.chapterId + 1}
								</Box>
								<Heading> {chapterInfo.title}</Heading>
							</Stack>

							<AspectRatio
								overflow="clip"
								borderRadius="md"
								w="100%"
								maxH="sm"
								ratio={16 / 9}
							>
								<iframe
									title="chapter video"
									src={`https://www.youtube.com/embed/${
										chapterInfo.video ? chapterInfo.video : chapterInfo.video_id
									}`}
									allowFullScreen
								/>
							</AspectRatio>

							<Heading size="lg">Video Summary</Heading>
							<Text>
								{chapterInfo.summary
									? chapterInfo.summary
									: chapterInfo.video_summary}
							</Text>
						</Stack>

						<Stack w={{ base: "100%", md: "xl" }}>
							<HStack>
								<Button
									size="md"
									onClick={() => {
										setCheck(true);
									}}
								>
									Knowledge Check
								</Button>
								<Spacer />
								<Button
									size="md"
									onClick={() => {
										setCheck(false);
									}}
								>
									ChatBot
								</Button>
							</HStack>
							{check && <KnowledgeCheck chapterInfo={chapterInfo} />}
							{!check && (
								<ChatBox
									data={{
										id: params.courseId,
										chat: chat,
										chapter: params.chapterId,
										unit: params.unitId,
									}}
								/>
							)}
						</Stack>
					</Stack>
					<Spacer />
					<Divider />
					<Stack direction="row" pb={8}>
						{data.units[params.unitId].chapters[+params.chapterId - 1] ? (
							<LinkBox>
								<Stack direction={"row"} align="center">
									<Icon as={FaChevronLeft} />
									<Stack justify="start" spacing={0}>
										<Text textAlign="left">Previous</Text>
										<Heading size="md" textAlign="left">
											<LinkOverlay
												as={Link}
												to={`/course/${params.courseId}/${params.unitId}/${
													+params.chapterId - 1
												}`}
											>
												{
													data.units[params.unitId].chapters[
														+params.chapterId - 1
													].title
												}
											</LinkOverlay>
										</Heading>
									</Stack>
								</Stack>
							</LinkBox>
						) : params.unitId > 0 ? (
							<LinkBox>
								<Stack direction={"row"} align="center">
									<Icon as={FaChevronLeft} />
									<Stack justify="start" spacing={0}>
										<Text textAlign="left">Previous</Text>
										<Heading size="md" textAlign="left">
											<LinkOverlay
												as={Link}
												to={`/course/${params.courseId}/${+params.unitId - 1}/${
													data.units[+params.unitId - 1].chapters.length - 1
												}`}
											>
												{
													data.units[+params.unitId - 1].chapters[
														data.units[+params.unitId - 1].chapters.length - 1
													].title
												}
											</LinkOverlay>
										</Heading>
									</Stack>
								</Stack>
							</LinkBox>
						) : (
							""
						)}
						<Spacer />
						{data.units[params.unitId].chapters.length ==
						+params.chapterId + 1 ? (
							data.units.length == +params.unitId + 1 ? (
								""
							) : (
								<LinkBox>
									<Stack direction={"row"} align="center">
										<Stack justify="end" spacing={0}>
											<Text textAlign="right">Next</Text>
											<Heading size="md" textAlign="right">
												<LinkOverlay
													as={Link}
													to={`/course/${params.courseId}/${
														+params.unitId + 1
													}/0`}
												>
													{data.units[+params.unitId + 1].chapters[0].title}
												</LinkOverlay>
											</Heading>
										</Stack>
										<Icon as={FaChevronRight} />
									</Stack>
								</LinkBox>
							)
						) : (
							<LinkBox>
								<Stack direction={"row"} align="center">
									<Stack justify="end" spacing={0}>
										<Text textAlign="right">Next</Text>
										<Heading size="md" textAlign="right">
											<LinkOverlay
												as={Link}
												to={`/course/${params.courseId}/${params.unitId}/${
													+params.chapterId + 1
												}`}
											>
												{
													data.units[params.unitId].chapters[
														+params.chapterId + 1
													].title
												}
											</LinkOverlay>
										</Heading>
									</Stack>
									<Icon as={FaChevronRight} />
								</Stack>
							</LinkBox>
						)}
					</Stack>
				</Stack>
			</Box>
		</Stack>
	);
};

function KnowledgeCheck(chapterInfo: any) {
	chapterInfo = chapterInfo.chapterInfo;

	const [answers, setAnswers] = useState(
		Array.from(chapterInfo.quiz, () => "")
	);

	const [alert, setAlert] = useState("");

	const [percentCorrect, setPercentCorrect] = useState(0);

	const submitQuiz = () => {
		const newAnswers = [...answers];
		answers.forEach((answer, index) => {
			newAnswers[index] =
				chapterInfo.quiz[index].answer.toString() === answer ||
				answer === "correct"
					? "correct"
					: "incorrect";
		});
		setAnswers(newAnswers);

		const percentCorrect =
			(Object.fromEntries([
				...newAnswers.reduce(
					(map, key) => map.set(key, (map.get(key) || 0) + 1),
					new Map()
				),
			])["correct"]
				? Object.fromEntries([
						...newAnswers.reduce(
							(map, key) => map.set(key, (map.get(key) || 0) + 1),
							new Map()
						),
				  ])["correct"]
				: 0) / newAnswers.length;

		setPercentCorrect(percentCorrect);

		setAlert(
			`${percentCorrect > 0.8 ? "Woohoo! " : ""}You got ${(
				percentCorrect * 100
			).toFixed(2)}% correct${percentCorrect > 0.8 ? "!" : ". Try again!"}`
		);
	};

	return (
		<Stack>
			{chapterInfo.quiz.map((question: any, index: number) => (
				<Question
					correct={answers[index] === "correct"}
					incorrect={answers[index] === "incorrect"}
					question={question}
					onChange={(newValue: string) => {
						const newAnswers = [...answers];
						newAnswers[index] = newValue;
						setAnswers(newAnswers);
					}}
					key={index}
				/>
			))}
			<Button onClick={submitQuiz}>Submit</Button>
			{alert.length > 0 ? (
				<Box>
					<Alert
						status={percentCorrect > 0.8 ? "success" : "error"}
						borderRadius={"md"}
					>
						<AlertIcon />
						<Text fontSize={{ base: "sm", md: "md" }}>{alert}</Text>
					</Alert>
				</Box>
			) : (
				""
			)}
		</Stack>
	);
}

function ChatBox(data: any) {
	let courseId = data.data.id;
	let chat = data.data.chat;
	let chapterId = data.data.chapter;
	let unitId = data.data.unit;
	if (!chat.examples || courseId != chat.courseId) {
		chat.examples = [];
	}

	let [value, setValue] = useState("");

	console.log("ENTEREDDDD");
	useEffect(() => {
		chat = localStorage.getItem("chat");
	});
	console.log("ABCDEF");
	console.log(chat);
	return (
		<Stack w="100%" h={"100%"}>
			<Box height={"500px"} overflow={"hidden"} overflowY={"scroll"}>
				{chat.examples.map((example: any) => (
					<Stack w="100%" h="100%">
						<HStack>
							<Spacer />
							<Box
								width={"280px"}
								backgroundColor={"blue.800"}
								borderRadius={"8px"}
							>
								<Text
									wordBreak={"break-word"}
									padding={"8px"}
									overflowY={"hidden"}
								>
									{example.input.content}
								</Text>
							</Box>
							<Stack>
								<Spacer />
								<Avatar
									name="user"
									size="xs"
									src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
								></Avatar>
							</Stack>
						</HStack>
						<HStack>
							<Avatar
								name="user"
								size="xs"
								src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
							></Avatar>

							<Stack>
								<Box
									width={"280px"}
									backgroundColor={"blue.800"}
									borderRadius={"8px"}
								>
									<Text
										wordBreak={"break-word"}
										padding={"8px"}
										overflowY={"hidden"}
									>
										{example.output.content}
									</Text>
									<Spacer />
								</Box>
							</Stack>
						</HStack>
					</Stack>
				))}
			</Box>
			<Spacer />
			<Form method="post">
				<Input type="hidden" value={courseId} name="courseId" />
				<Input type="hidden" value={chapterId} name="chapterId" />
				<Input type="hidden" value={unitId} name="unitId" />
				<Input type="hidden" value={chat.examples} name="chat" />
				<Textarea
					placeholder="Send Message"
					value={value}
					onChange={(e) => setValue(e.currentTarget.value)}
					name="message"
					onKeyDown={(e) => {
						if (e.code == "Enter") {
							e.preventDefault();
							setValue("");
							document.forms[0].submit();
						}
					}}
				/>
				<Box height={"2px"} />
			</Form>
		</Stack>
	);
}

export default PostSlug;
