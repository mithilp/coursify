"use client";

import { Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

export default function Unit({ index, onChange }) {
	const [value, setValue] = useState("");

	return (
		<Stack direction={["column", "row"]} align="center" spacing={4}>
			<Text minW={125} fontSize="xl">
				Unit {index + 1}:
			</Text>
			<Input
				isRequired
				size="lg"
				placeholder={
					index == 0
						? "Axis Powers"
						: index == 1
						? "Allied Powers"
						: index == 2
						? "Major Battles"
						: "Unit Title"
				}
				value={value}
				onChange={(e) => {
					setValue(e.target.value);
					onChange(e.target.value);
				}}
			/>
		</Stack>
	);
}
