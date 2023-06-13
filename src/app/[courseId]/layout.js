"use client";

import { Box, Heading, Link, Stack, StackDivider } from "@chakra-ui/react";
import { Link as NextLink } from "next/link";

import { useParams } from "next/navigation";

export default async function CourseLayout({ children }) {
	const params = useParams();
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
					<Box key={i}>
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
								<Link
									key={index}
									as={NextLink}
									href={`/${params.courseId}/${i}/${index}`}
								>
									{chapter.title}
								</Link>
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
	const response = await fetch("/api/course?id=" + params.courseId);
	const data = await response.json();
	return data;
}
