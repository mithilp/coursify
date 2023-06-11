"use client";

import { Box, Heading, Link, Stack, StackDivider } from "@chakra-ui/react";
import { Link as NextLink } from "next/link";

import { db } from "../../utils/config";
import { doc, getDoc } from "firebase/firestore";

export default async function CourseLayout({ children, params }) {
	const data = await getData(params);

	return (
		<Stack direction={"row"} h="100vh">
			<Stack
				bg="whiteAlpha.300"
				minW={"2xs"}
				p={8}
				borderTopRightRadius={"3xl"}
				h="100vh"
				divider={<StackDivider />}
			>
				<Heading fontWeight={"black"} size="2xl">
					{data.title}
				</Heading>
				{data.units.map((unit, i) => (
					<Box>
						<Stack spacing={0}>
							<Box
								color="whiteAlpha.600"
								fontWeight="semibold"
								letterSpacing="wide"
								fontSize="xs"
								textTransform="uppercase"
							>
								Unit {i + 1}
							</Box>
							<Link
								as={NextLink}
								fontSize="xl"
								fontWeight={"bold"}
								href={`/${params.courseId}/${i}`}
							>
								{unit.title}
							</Link>
						</Stack>
						<Stack spacing={1}>
							{unit.chapters.map((chapter, index) => (
								<>
									<Link
										as={NextLink}
										href={`/${params.courseId}/${i}/${index}`}
									>
										{chapter.title}
									</Link>
								</>
							))}
						</Stack>
					</Box>
				))}
			</Stack>
			<Box overflowY={"scroll"} minH="100vh" p={8} w="100%">
				{children}
			</Box>
		</Stack>
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
