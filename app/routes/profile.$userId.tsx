import { Stack, HStack, Text } from "@chakra-ui/react";
import { getAllCourses } from "~/models/course.server";
import { useLoaderData } from "@remix-run/react";
import GalleryResult from "src/components/GalleryResult";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import Fuse from "fuse.js";

import { useUser } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";

export const loader = async (query: string) => {
	return await getAllCourses();
};

export default function PostSlug() {
	const { isSignedIn, isLoaded, user } = useUser();
	return <></>;
}
