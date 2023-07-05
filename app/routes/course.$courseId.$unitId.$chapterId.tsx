import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getCourse } from "~/models/course.server";
import {
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
} from "@chakra-ui/react";
import Question from "../../src/components/Question";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import CourseSidebar from "src/components/CourseSidebar";

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

	const chapterInfo = data.units[params.unitId].chapters[params.chapterId];

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
							<Heading size="lg">Knowledge Check</Heading>
							{chapterInfo.quiz.map((question: any, index: number) => (
								<Question question={question} key={index} />
							))}
							<Button>Submit</Button>
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
}
