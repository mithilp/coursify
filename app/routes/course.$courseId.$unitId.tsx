import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import { getCourse } from "~/models/course.server";
import { Box, Heading, Link, Stack, StackDivider, Button } from "@chakra-ui/react";
import { AiFillAppstore } from 'react-icons/ai';

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

export default function PostSlug() {
	const { params, data } = useLoaderData<typeof loader>();

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
				<Link href={"/course"}>
					<Button size={"lg"} fontWeight={"black"}><AiFillAppstore />Gallery</Button>
				</Link>
				<Heading fontWeight={"black"} size="2xl">
					{data.title}
				</Heading>
				{data.units.map((unit: any, i: number) => (
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
								as={RemixLink}
								fontSize="xl"
								fontWeight={"bold"}
								to={`/course/${params.courseId}/${i}`}
							>
								{unit.title}
							</Link>
						</Stack>
						<Stack spacing={1}>
							{unit.chapters.map((chapter: any, index: number) => (
								<Link
									key={index}
									as={RemixLink}
									to={`/course/${params.courseId}/${i}/${index}`}
								>
									{chapter.title}
								</Link>
							))}
						</Stack>
					</Box>
				))}
			</Stack>
			<Box overflowY={"scroll"} minH="100vh" p={8} w="100%">
				Course Name: {data.title}, Unit Name: {data.units[0].title}
			</Box>
		</Stack>
	);
}
