import { Button, Image, Text, Stack, Box, Divider, HStack, StackDivider, Heading, Link } from "@chakra-ui/react"
import Gallery from "src/components/Gallery"
import { getAllCourses, getCourse } from "~/models/course.server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader = async () => {
  return await getAllCourses();
}

export default function PostSlug() {
  // const { params, data, courses } = useLoaderData<typeof loader>();
  // const { coursesId, coursesData } = courses;
  const { coursesId, coursesData } = useLoaderData<typeof loader>();
  
  return (
    <Stack>
  {/* <Stack
      bg="whiteAlpha.300"
      minW={"2xs"}
      p={8}
      borderTopRightRadius={"3xl"}
      h="100vh"
      divider={<StackDivider />}>
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
              fontSize="xl"
              fontWeight={"bold"}
              href={`/course/${params.courseId}/${i}`}
            >
              {unit.title}
            </Link>
          </Stack>
          <Stack spacing={1}>
            {unit.chapters.map((chapter: any, index: number) => (
              <Link
                key={index}
                href={`/course/${params.courseId}/${i}/${index}`}
              >
                {chapter.title}
              </Link>
            ))}
          </Stack>
        </Box>
			))}
		</Stack> */}
    <Stack direction={"row"} maxW={"90%"} flexWrap={"wrap"} spacing={8} justify="right">
      {coursesId.map((courseId: any, index: number) => (
        <Gallery courseView={coursesData[index]} courseId={courseId} key={index} />
      ))}
    </Stack>
    </Stack>
    // <Gallery courseView={coursesData[0]} courseId={coursesId[0]} key={0} />
  )
}