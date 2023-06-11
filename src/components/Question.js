"use client";

import { Box, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

export default function Question({ question }) {
	const [value, setValue] = useState();

	return (
		<Box bg="whiteAlpha.300" borderRadius={"3xl"} p={4}>
			<Stack>
				<Text fontWeight={"bold"}>{question.question}</Text>
				{question.answers.map((answer, i) => (
					<Stack direction={"row"}>
						<input
							onChange={(e) => console.log(e)}
							type="radio"
							id={i}
							name="fav_language"
							value={answer.choice}
						/>
						<label htmlFor={i}>{answer.choice}</label>
					</Stack>
				))}
			</Stack>
		</Box>
	);
}
