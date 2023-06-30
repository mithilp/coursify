import { Image, Text, Stack, Box, Divider, Link } from "@chakra-ui/react"
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import { getAllCourses } from "~/models/course.server";

function stringifyUnits(units: any) {
  let str = units[0].title;
  for (let i = 1; i < units.length; i++) {
    str += ", " + units[i].title
  };
  return str;
}

type couseViewProps = {
  courseView: any;
  courseId: string;
};

export default function Gallery({ courseView, courseId }: couseViewProps) {
  return (
    <Box
      maxW={"30%"}
      minW={"30%"}
      borderWidth='1px'
      borderRadius='lg'
      display={"flex"}
      flexDirection={"column"}>
      <Link href={`/course/${courseId}`} textDecoration={"none"}>
        <Stack direction={"column"} align="center" p={3}>
          <Image src={courseView.image} alt='Course Pic' height={"50%"} width={"90%"}/>
          <Text>{courseView.title.toUpperCase()}</Text>
          <Divider borderColor='gray.400' width={"90%"}/>
          <Text align="center">Units: {stringifyUnits(courseView.units)}</Text>
        </Stack>
      </Link>
    </Box>
  )
}