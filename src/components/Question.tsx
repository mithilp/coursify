import {
	Box,
	Radio,
	RadioGroup,
	Stack,
	StackDivider,
	Text,
} from "@chakra-ui/react";
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
					<Stack spacing={1} divider={<StackDivider />}>
						{question.answers
							? question.answers.map((answer: any, i: number) => (
									<Radio
										size="sm"
										name={`question${i}`}
										key={i}
										colorScheme="blue"
									>
										{answer.choice}
									</Radio>
							  ))
							: question.choices.map((choices: any, i: number) => (
									<Radio
										size="sm"
										name={`question${i}`}
										key={i}
										colorScheme="blue"
									>
										{choices}
									</Radio>
							  ))}
					</Stack>
				</RadioGroup>
			</Stack>
		</Box>
	);
}
