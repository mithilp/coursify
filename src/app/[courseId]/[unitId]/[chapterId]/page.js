"use client";

import {
	AspectRatio,
	Box,
	Center,
	Divider,
	Heading,
	LinkBox,
	LinkOverlay,
	Spacer,
	Stack,
	Text,
} from "@chakra-ui/react";
import { db } from "../../../../utils/config";
import { doc, getDoc } from "firebase/firestore";

import { Link as NextLink } from "next/link";
import Question from "@/components/Question";

export default async function Page({ params }) {
	const data = await getData(params);
	const chapterInfo = data.units[params.unitId].chapters[params.chapterId];

	return (
		<Center w="100%" h="100%">
			<Stack w="100%" h="100%">
				<Stack direction="row" spacing={4}>
					<Stack w="100%">
						<Stack spacing={0}>
							<Box
								color="whiteAlpha.600"
								fontWeight="semibold"
								letterSpacing="wide"
								fontSize="xs"
								textTransform="uppercase"
							>
								Unit {params.unitId + 1} &bull; Chapter {params.chapterId + 1}
							</Box>
							<Heading> {chapterInfo.title}</Heading>
						</Stack>

						<AspectRatio
							overflow="clip"
							borderRadius="3xl"
							w="100%"
							maxH="sm"
							ratio={16 / 9}
						>
							<iframe
								title="chapter video"
								src={`https://www.youtube.com/embed/${chapterInfo.video_id}`}
								allowFullScreen
							/>
						</AspectRatio>
					</Stack>
					<Stack minW="xs">
						<Heading size="lg">Knowledge Check</Heading>
						{chapterInfo.quiz.map((question, index) => (
							<Question question={question} key={index} />
						))}
					</Stack>
				</Stack>
				<Heading size="lg">Video Summary</Heading>
				<Text>{chapterInfo.video_summary}</Text>
				<Spacer />
				<Divider />
				<Stack direction="row">
					{data.units[params.unitId].chapters[+params.chapterId - 1] ? (
						<LinkBox>
							<p>Previous</p>
							<h2>
								<LinkOverlay as={NextLink} href="#">
									{
										data.units[params.unitId].chapters[+params.chapterId - 1]
											.title
									}
								</LinkOverlay>
							</h2>
						</LinkBox>
					) : (
						""
					)}
					<Spacer />
					<LinkBox>
						<p>Next</p>
						<h2>
							<LinkOverlay as={NextLink} href="#">
								{
									data.units[params.unitId].chapters[+params.chapterId + 1]
										.title
								}
							</LinkOverlay>
						</h2>
					</LinkBox>
				</Stack>
			</Stack>
		</Center>
	);
}

async function getData(params) {
	let data = {};

	const document = await getDoc(doc(db, "courses", params.courseId));

	if (document.exists()) {
		data = document.data();
	} else {
		console.log("No such document!");
	}

	return data;
}
