"use client";

import { useParams } from "next/navigation";

export default async function Page() {
	const params = useParams();
	const data = await getData(params);
	return <div>Unit Name: {data.units[params.unitId].title}</div>;
}

async function getData(params) {
	const response = await fetch("/api/course?id=" + params.courseId);
	const data = await response.json();
	return data;
}
