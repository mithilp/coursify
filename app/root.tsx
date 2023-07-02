import {
	ChakraProvider,
	Box,
	Heading,
	Text,
	Flex,
	Link,
	HStack,
	StackDivider,
} from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
} from "@remix-run/react";
import theme from "../src/utils/theme";

import { Link as RemixLink } from "@remix-run/react";

export const meta: MetaFunction = () => ({
	charset: "utf-8",
	viewport: "width=device-width,initial-scale=1",
});

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

export default function App() {
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
						zIndex="sticky"
						boxShadow={"xl"}
					>
						<Text
							as={RemixLink}
							to="/"
							fontSize="2xl"
							fontWeight="black"
							color="white"
						>
							Coursify
						</Text>
						<HStack spacing={4}>
							<Link as={RemixLink} to="/" mx={2} color="white">
								Create New Course
							</Link>
							<Link as={RemixLink} to="/gallery" mx={2} color="white">
								Course Gallery
							</Link>
						</HStack>
					</Flex>
					<Outlet />
				</Box>
			</ChakraProvider>
		</Document>
	);
}

// How ChakraProvider should be used on CatchBoundary
export function CatchBoundary() {
	const caught = useCatch();

	return (
		<Document title={`${caught.status} ${caught.statusText}`}>
			<ChakraProvider theme={theme}>
				<Box>
					<Heading as="h1" bg="purple.600">
						[CatchBoundary]: {caught.status} {caught.statusText}
					</Heading>
				</Box>
			</ChakraProvider>
		</Document>
	);
}

// How ChakraProvider should be used on ErrorBoundary
export function ErrorBoundary({ error }: { error: Error }) {
	return (
		<Document title="Error!">
			<ChakraProvider theme={theme}>
				<Box>
					<Heading as="h1" bg="blue.500">
						[ErrorBoundary]: There was an error: {error.message}
					</Heading>
				</Box>
			</ChakraProvider>
		</Document>
	);
}
