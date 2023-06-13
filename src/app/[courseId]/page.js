import { useParams } from "next/navigation";

export default async function Page() {
	const params = useParams();
	const data = await getData(params);
	return <div>Course Name: {data.title}</div>;
}

async function getData(params) {
	const response = await fetch("/api/course?id=" + params.courseId);
	const data = await response.json();
	return data;
}
