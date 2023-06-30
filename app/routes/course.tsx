import { Stack, Box, Divider, Input } from "@chakra-ui/react"
import Gallery from "src/components/Gallery"
import { getAllCourses } from "~/models/course.server";
import { useLoaderData } from "@remix-run/react";
import { Form } from "@remix-run/react";

export const loader = async (query: string) => {
  return await getAllCourses();
}

export default function PostSlug() {
  // const { params, data, courses } = useLoaderData<typeof loader>();
  // const { coursesId, coursesData } = courses;
  const { coursesId, coursesData } = useLoaderData<typeof loader>();
  function handleChange() {
    console.log("hello");
    return true;
  }
  return (
    <Stack>
      <Box w={"100vh"} alignSelf={"center"}><Form onChange={() => { handleChange }}><Input type="text" placeholder="Mathematics" margin={"1.5vh"}/></Form></Box>
      <Divider alignSelf={"center"} borderColor='white.400' width={"90%"} borderWidth={"1px"} borderRadius={"0.5px"}/>
      <Stack direction={"row"} maxW={"90%"} flexWrap={"wrap"} spacing={8} alignSelf={"center"} justify={"center"}>
        {coursesId.map((courseId: any, index: number) => (
          <Gallery courseView={coursesData[index]} courseId={courseId} key={index} />
        ))}
      </Stack>
    </Stack>
    // <Gallery courseView={coursesData[0]} courseId={coursesId[0]} key={0} />
  )
}