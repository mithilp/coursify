import Unit from "../../src/components/Unit";
import {
	Box,
	Heading,
	Input,
	Stack,
	Text,
	Button,
	Divider,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
} from "@chakra-ui/react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";

import { FaPlus, FaTrash } from "react-icons/fa";
import { ActionArgs, json, redirect } from "@vercel/remix";
import { createCourse } from "~/models/course.server";

export const config = { runtime: "edge" };

export async function action({ request }: ActionArgs) {
	try {
		const formData = await request.formData();
		const response = await createCourse({
			title: formData.get("title") as string,
			units: formData.getAll("unit") as string[],
		});
		console.log(response);
		return redirect("/course/" + response.courseId + "/0/0");
	} catch (error: unknown) {
		console.error(error);
		return json(
			{ message: "Sorry, we couldn't create the project" },
			{
				status: 500,
			}
		);
	}
}

export default function Home() {
	const [units, setUnits] = useState(["", "", ""]);
	const [title, setTitle] = useState("");

	const navigation = useNavigation();
	const actionData = useActionData<typeof action>();

	return (
		<Form method="post" action="/?index">
			<Stack px={20} pt={20} justify="center" spacing={10} w="100%">
				<Heading as="h1" fontWeight={"black"} size="4xl" textAlign={"center"}>
					Coursify
				</Heading>
				<Stack spacing={4}>
					<Stack direction={["column", "row"]} spacing={4} align="center">
						<Text minW={125} fontSize="xl">
							Title:
						</Text>
						<Input
							disabled={navigation.state === "submitting"}
							name="title"
							isRequired
							size="lg"
							placeholder="History of WWII"
							onChange={(e) => setTitle(e.target.value)}
							value={title}
						/>
					</Stack>
					{units.map((unit, index) => (
						<Unit
							key={index}
							index={index}
							disabled={navigation.state === "submitting"}
							onChange={(e) => {
								const newUnits = [...units];
								newUnits[index] = e;
								setUnits(newUnits);
							}}
						/>
					))}
				</Stack>

				<Stack direction={"row"} align="center" spacing={4}>
					<Divider orientation="horizontal" />
					<Box>
						<Button
							leftIcon={<FaPlus />}
							onClick={() =>
								setUnits((units) => {
									const newUnits = [...units];
									newUnits.push("");
									return newUnits;
								})
							}
						>
							Add Unit
						</Button>
					</Box>
					<Box>
						<Button
							leftIcon={<FaTrash />}
							onClick={() => {
								const newUnits = [...units];
								newUnits.pop();
								setUnits(newUnits);
							}}
						>
							Delete Unit
						</Button>
					</Box>
					<Divider orientation="horizontal" />
				</Stack>

				<Stack spacing={4}>
					<Button
						colorScheme="blue"
						isLoading={navigation.state === "submitting"}
						loadingText={"Creating Your Course..."}
						type="submit"
					>
						Submit
					</Button>

					{actionData?.message && (
						<Alert status="error">
							<AlertIcon />
							<AlertTitle>Something went wrong!</AlertTitle>
							<AlertDescription>Error: {actionData.message}</AlertDescription>
						</Alert>
					)}
				</Stack>
			</Stack>
		</Form>
	);
}
