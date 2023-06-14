import { Box, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

type QuestionProps = {
	question: any;
};

export default function Question({ question }: QuestionProps) {
	const [value, setValue] = useState("0");
	return (
		<Box bg="whiteAlpha.300" borderRadius={"3xl"} p={4}>
			<Stack>
				<Text fontWeight={"bold"}>{question.question}</Text>
				<RadioGroup onChange={setValue} value={value}>
					<Stack spacing={0}>
						{question.answers
							? question.answers.map((answer: any, i: number) => (
									<Radio
										size="md"
										name={`question${i}`}
										key={i}
										colorScheme="blue"
									>
										{answer.choice}
									</Radio>
							  ))
							: question.choices.map((answer: any, i: number) => (
									<Radio
										size="md"
										name={`question${i}`}
										key={i}
										colorScheme="blue"
									>
										{answer.choice}
									</Radio>
							  ))}
					</Stack>
				</RadioGroup>
			</Stack>
		</Box>
	);
}
