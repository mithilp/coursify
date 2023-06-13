"use client";

import Unit from "@/components/Unit";
import {
	Box,
	Heading,
	Input,
	Stack,
	Text,
	Button,
	Divider,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";

import { FaPlus, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Home() {
	const [units, setUnits] = useState(["", "", ""]);
	const [title, setTitle] = useState("");
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const submit = useCallback(
		async (e) => {
			e.preventDefault();
			console.log("submitting");
			setIsLoading(true);
			try {
				const res = await fetch("/api/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ title: title, units: units }),
				});
				const data = await res.json();
				router.push("/" + data.courseId + "/0/0");
				setIsLoading(false);
			} catch (error) {
				console.error(error);
				alert(error);
				setIsLoading(false);
			}
		},
		[title, units]
	);

	return (
		<form onSubmit={submit}>
			<Stack px={20} pt={20} justify="center" spacing={10} w="100%">
				<Heading as="h1" fontWeight={"black"} size="4xl" textAlign={"center"}>
					Coursify
				</Heading>
				<Stack direction={["column", "row"]} spacing={4} align="center">
					<Text minW={125} fontSize="xl">
						Title:
					</Text>
					<Input
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
						onChange={(e) => {
							const newUnits = [...units];
							newUnits[index] = e;
							setUnits(newUnits);
						}}
					/>
				))}
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
				<Button
					isLoading={isLoading}
					loadingText={"Creating Your Course..."}
					type="submit"
				>
					Submit
				</Button>
			</Stack>
		</form>
	);
}
