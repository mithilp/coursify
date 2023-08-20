import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCourse } from "~/models/course.server";
import { Box, Stack } from "@chakra-ui/react";
import CourseSidebar from "src/components/CourseSidebar";
import { getAuth } from "@clerk/remix/ssr.server";

export const loader = async (args: LoaderArgs) => {
	const { userId } = await getAuth(args);

	const data = await getCourse(args.params.courseId as string);

	if (data.error) {
		throw new Response(null, {
			status: 404,
			statusText: "Course Not Found",
		});
	} else {
		if (!data.completed) {
			throw new Response(null, {
				status: 404,
				statusText: "Course Not Found",
			});
		}
		if (!data.public) {
			if (userId == null) {
				return redirect("/login?redirect_url=" + args.request.url);
			} else if (userId != data.author.id) {
				throw new Response(null, {
					status: 404,
					statusText: "Course Not Found",
				});
			}
		}
		return json({
			params: args.params,
			data: await getCourse(args.params.courseId as string),
		});
	}
};

export default function PostSlug() {
	const { params, data } = useLoaderData<typeof loader>();

	return (
		<Stack direction={"row"} h="100%">
			<CourseSidebar data={data} params={params} />

			<Box overflowY={"scroll"} p={8} w="100%">
				Course Name: {data.title}, Unit Name: {data.units[0].title}
			</Box>
		</Stack>
	);
}
