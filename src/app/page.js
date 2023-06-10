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

export default function Home() {
	const [units, setUnits] = useState(["", "", ""]);
	const [title, setTitle] = useState("");

	const submit = useCallback(
		(e) => {
			e.preventDefault();
			fetch("/api", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title: title, units: units }),
			});
		},
		[title, units]
	);

	return (
		<form onSubmit={submit}>
			<Stack px={20} pt={20} justify="center" spacing={10} w="100%">
				<Heading as="h1" size="4xl" textAlign={"center"}>
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
				<Button type="submit">Submit</Button>
			</Stack>
		</form>
	);
}
