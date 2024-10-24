import {
	ChakraProvider,
	Box,
	Text,
	Flex,
	Link,
	HStack,
	Button,
	Heading,
	AlertDescription,
	AlertIcon,
	Center,
	AlertTitle,
	Alert,
} from "@chakra-ui/react";
import type {
	LinksFunction,
	LoaderFunction,
	MetaFunction,
} from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
	useNavigation,
} from "@remix-run/react";
import theme from "./utils/theme";
import { Link as RemixLink } from "@remix-run/react";
import NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css";
import { useEffect } from "react";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import {
	ClerkApp,
	V2_ClerkErrorBoundary,
	ClerkCatchBoundary,
	UserButton,
	useUser,
} from "@clerk/remix";

export const meta: MetaFunction = () => ({
	charset: "utf-8",
});

export let links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: nProgressStyles }];
};

export const loader: LoaderFunction = (args) => {
	return rootAuthLoader(
		args,
		({ request }) => {
			const { userId } = request.auth;
			console.log("hello")
			console.log(userId);
			return { yourData: "here" };
		},
		{ loadUser: true }
	);
};

function Document({
	children,
	title = "Coursify | AI-Generated Courses",
}: {
	children: React.ReactNode;
	title?: string;
}) {
	return (
		<html lang="en">
			<head>
				<Meta />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<script
					async
					src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6458965765037147"
					crossOrigin="anonymous"
				></script>
				<title>{title}</title>
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

const App = () => {
	const transition = useNavigation();

	useEffect(() => {
		if (transition.state !== "idle") {
			NProgress.start();
		} else {
			NProgress.done();
		}
	}, [transition.state]);

	const { isSignedIn, isLoaded, user } = useUser();
	const userId = user?.id.substring(5, user.id.length);
	// console.log("TEXT 1");
	// console.log(user.id);
	return (
		<Document>
			<ChakraProvider theme={theme}>
				<Box h="100vh" overflow={"scroll"}>
					<Flex
						as="header"
						align="center"
						justify="space-between"
						bg="gray.800"
						px={4}
						h="90px"
						position="sticky"
						top={0}
						zIndex={10}
						boxShadow={"xl"}
					>
						<Text
							display={{ lg: "flex", base: "none" }}
							as={RemixLink}
							to="/"
							fontSize="2xl"
							fontWeight="black"
							color="white"
						>
							Coursify
						</Text>
						<HStack spacing={{ base: 1, md: 4 }}>
							<Link as={RemixLink} to="/" mx={2} color="white">
								Create New Course
							</Link>
							<Link as={RemixLink} to="/gallery" mx={2} color="white">
								Gallery
							</Link>
							<Link as={RemixLink} to="/contact" mx={2} color="white">
								Contact
							</Link>
							{isSignedIn ? (
								<Link as={RemixLink} to={`/profile/${userId}`}>Profile</Link>
							) : (<></>)}
							{isSignedIn ? (
								<UserButton />
							) : (
								<>
									<Link as={RemixLink} to="/login" mx={2} color="white">
										Login
									</Link>
									<Button as={RemixLink} to="/signup" mx={2} colorScheme="blue">
										Signup
									</Button>
								</>
							)}
						</HStack>
					</Flex>
					<Box h="calc(100vh - 90px)">
						<Outlet />
					</Box>
				</Box>
			</ChakraProvider>
		</Document>
	);
};

export default ClerkApp(App);

export const CatchBoundary = ClerkCatchBoundary();

const ErrorBoundaryCustom = ({ error }: { error: Error }) => {
	console.log("root ErrorBoundary");
	console.error(error);

	return (
		<Document title="Error!">
			<ChakraProvider theme={theme}>
				<Box h="100vh" overflow={"scroll"}>
					<Flex
						as="header"
						align="center"
						justify="space-between"
						bg="gray.800"
						px={4}
						h="90px"
						position="sticky"
						top={0}
						zIndex="sticky"
						boxShadow={"xl"}
					>
						<Text
							display={{ lg: "flex", base: "none" }}
							as={RemixLink}
							to="/"
							fontSize="2xl"
							fontWeight="black"
							color="white"
						>
							Coursify
						</Text>
						<HStack spacing={{ base: 1, md: 4 }}>
							<Link as={RemixLink} to="/" mx={2} color="white">
								Create New Course
							</Link>
							<Link as={RemixLink} to="/gallery" mx={2} color="white">
								Gallery
							</Link>
							<Link as={RemixLink} to="/contact" mx={2} color="white">
								Contact
							</Link>
							<Link as={RemixLink} to="/login" mx={2} color="white">
								Login
							</Link>
							<Button as={RemixLink} to="/signup" mx={2} colorScheme="blue">
								Signup
							</Button>
						</HStack>
					</Flex>

					<Center h="calc(100vh - 90px)">
						<Alert
							borderRadius={"lg"}
							maxW={"sm"}
							status="error"
							variant="subtle"
							flexDirection="column"
							alignItems="center"
							justifyContent="center"
							textAlign="center"
						>
							<AlertIcon boxSize="40px" mr={0} />
							<AlertTitle mt={4} mb={1} fontSize="xl">
								Uh oh! An error occurred!
							</AlertTitle>
							<AlertDescription maxWidth="sm">
								<Text fontWeight={"bold"}>Please reload and try again.</Text> If
								that doesn't work, check back later.
							</AlertDescription>
						</Alert>
					</Center>
				</Box>
			</ChakraProvider>
		</Document>
	);
};

// @ts-ignore
export const ErrorBoundary = V2_ClerkErrorBoundary(ErrorBoundaryCustom);
