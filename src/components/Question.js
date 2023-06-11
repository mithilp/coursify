"use client";

import { Box, Stack, Text } from "@chakra-ui/react";

export default function Question({ question }) {
	return (
		<Box bg="whiteAlpha.300" borderRadius={"3xl"} p={4}>
			<Stack>
				<Text fontWeight={"bold"}>{question.question}</Text>
				{question.answers
					? question.answers.map((answer, i) => (
							<Stack key={i} direction={"row"}>
								<input
									onChange={(e) => console.log(e)}
									type="radio"
									id={i}
									name="fav_language"
									value={answer.choice}
								/>
								<label htmlFor={i}>{answer.choice}</label>
							</Stack>
					  ))
					: question.choices.map((answer, i) => (
							<Stack key={i} direction={"row"}>
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
