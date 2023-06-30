import {
	Stack,
	Box,
	Divider,
	Input,
	Button,
	HStack,
	Wrap,
	InputRightElement,
	InputGroup,
	InputLeftElement,
	Icon,
} from "@chakra-ui/react";
import { getAllCourses } from "~/models/course.server";
import { useLoaderData } from "@remix-run/react";
import { Form } from "@remix-run/react";
import GalleryResult from "src/components/GalleryResult";
import { FaSearch } from "react-icons/fa";

export const loader = async (query: string) => {
	return await getAllCourses();
};

export default function PostSlug() {
	const { coursesId, coursesData } = useLoaderData<typeof loader>();

	function handleSubmit() {
		console.log("helloo");
		return true;
	}

	return (
		<Stack spacing={8} py={8} px={4}>
			<Form onSubmit={handleSubmit}>
				<HStack spacing={2} px={4}>
					<InputGroup size="lg">
						<InputLeftElement>
							<Icon as={FaSearch} />
						</InputLeftElement>
						<Input
							pr="6rem"
							type="text"
							placeholder="Search by keyword, title, or units"
						/>
						<InputRightElement width="6rem">
							<Button mr={1} h="2rem" size="md" type="submit">
								Search
							</Button>
						</InputRightElement>
					</InputGroup>
				</HStack>
			</Form>
			<Divider
				borderColor="white.400"
				borderWidth={"1px"}
				borderRadius="0.5px"
				w="90%"
				alignSelf="center"
			/>
			<Wrap spacing={4} justify={"center"}>
				{coursesId.map((courseId: any, index: number) => (
					<GalleryResult
						courseView={coursesData[index]}
						courseId={courseId}
						key={index}
					/>
				))}
			</Wrap>
		</Stack>
	);
}
