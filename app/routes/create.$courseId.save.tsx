import {
	Alert,
	AlertIcon,
	Box,
	Button,
	Divider,
	Heading,
	Stack,
	Text,
	Step,
	StepIcon,
	StepIndicator,
	StepNumber,
	StepSeparator,
	StepStatus,
	StepTitle,
	Stepper,
	useSteps,
	FormControl,
	FormLabel,
	Switch,
} from "@chakra-ui/react";
import { useUser } from "@clerk/remix";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
	useFetcher,
	useLoaderData,
	useNavigate,
	Link as RemixLink,
	Form,
} from "@remix-run/react";
import { doc, updateDoc } from "firebase/firestore";
import mixpanel from "mixpanel-browser";
import { useState } from "react";
import { FaCheck, FaChevronRight, FaChevronLeft } from "react-icons/fa6";
import { db } from "src/utils/firebase";
import { getCourse } from "~/models/course.server";

export const loader = async (args: LoaderArgs) => {
	const data = await getCourse(args.params.courseId as string);
	if (data.error) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	} else {
		return json({
			params: args.params,
			data: await getCourse(args.params.courseId as string),
			url: args.request.url,
		});
	}
};

export const action = async ({ request }: ActionArgs) => {
	try {
		const formData = await request.formData();
		const courseInfo = JSON.parse(formData.get("courseInfo") as string);
		const courseId = formData.get("courseId") as string;
		const imageResponseRaw = await fetch(
			`https://api.unsplash.com/search/photos?per_page=1&query=${courseInfo.title}&client_id=${process.env.UNSPLASH_API}`
		);
		const imageResponse = await imageResponseRaw.json();
		courseInfo.image = imageResponse.results[0].urls.small_s3;
		await updateDoc(doc(db, "courses", courseId), courseInfo);
		return redirect(`/course/${courseId}/0/0`);
	} catch (error) {
		console.error(error);
		return {
			success: false,
		};
	}
};

export default function SaveCourse() {
	const { isSignedIn, isLoaded, user } = useUser();

	const { params, data, url } = useLoaderData<typeof loader>();

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const navigate = useNavigate();

	const steps = [
		{ title: "First", description: "Enter Units" },
		{ title: "Second", description: "Generate Chapters" },
		{ title: "Third", description: "Save & Finish" },
	];

	const { activeStep } = useSteps({
		index: 2,
		count: steps.length,
	});

	const fetcher = useFetcher();

	const saveAndFinish = (e: any) => {
		setIsLoading(true);
		mixpanel.track("Save Course", {
			title: data.title,
		});
		const formattedData = {
			public: e.target[0].checked,
			completed: true,
			author: { id: user?.id, username: user?.username },
		};
		const formData = new FormData();
		formData.append("courseId", params.courseId);
		formData.append("courseInfo", JSON.stringify(formattedData));
		fetcher.submit(formData, { method: "post" });
	};

	return (
		<Stack
			as={Form}
			onSubmit={saveAndFinish}
			margin="auto"
			maxW="xl"
			p={8}
			h="calc(100vh - 90px)"
			spacing={4}
		>
			<Stepper size="sm" index={activeStep}>
				{steps.map((step, index) => (
					<Step key={index}>
						<Stack align={"center"}>
							<StepIndicator>
								<StepStatus
									complete={<StepIcon />}
									incomplete={<StepNumber />}
									active={<StepNumber />}
								/>
							</StepIndicator>

							<Box textAlign={"center"} flexShrink="0">
								<StepTitle>{step.description}</StepTitle>
							</Box>
						</Stack>

						<StepSeparator />
					</Step>
				))}
			</Stepper>

			<Divider />

			<Heading size="xl">Course Created</Heading>

			{isSignedIn ? (
				<Stack onSubmit={saveAndFinish}>
					<FormControl display="flex" alignItems="center">
						<FormLabel htmlFor="public" mb="0">
							Make course public?
						</FormLabel>
						<Switch id="public" />
					</FormControl>
					<Box>
						<Alert status="info" borderRadius={"lg"}>
							<AlertIcon />
							<Text fontSize={{ base: "sm", md: "md" }}>
								By making the course public, we reserve the right to take down
								the course at any time.
							</Text>
						</Alert>
					</Box>
				</Stack>
			) : (
				<Box>
					<Alert status="info" borderRadius={"lg"}>
						<AlertIcon />
						<Text fontSize={{ base: "sm", md: "md" }}>
							To finish creating this course, create an account or log in to
							your account.
						</Text>
					</Alert>
				</Box>
			)}

			<Stack direction={"row"} pb={8} align="center" spacing={4}>
				<Divider orientation="horizontal" />
				<Box>
					<Button
						leftIcon={<FaChevronLeft />}
						onClick={() => {
							navigate(-1);
						}}
					>
						Back
					</Button>
				</Box>
				<Box>
					{isSignedIn ? (
						<Button
							rightIcon={<FaCheck />}
							type="submit"
							colorScheme={"green"}
							isLoading={isLoading}
							loadingText={"Saving"}
						>
							{"Save & Finish"}
						</Button>
					) : (
						<Button
							as={RemixLink}
							to={"/signup?redirect_url=" + url}
							rightIcon={<FaChevronRight />}
							colorScheme={"blue"}
							loadingText={"Saving"}
						>
							Create Account
						</Button>
					)}
				</Box>
				<Divider orientation="horizontal" />
			</Stack>
		</Stack>
	);
}
