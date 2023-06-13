import { NextResponse } from "next/server";
import { db } from "@/utils/config";
import { getDoc, doc } from "@firebase/firestore";

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const courseId = searchParams.get("id");

	let data = {};
	const document = await getDoc(doc(db, "courses", courseId));

	if (document.exists()) {
		data = document.data();
		return NextResponse.json({ ...data });
	} else {
		return NextResponse.error({
			message: "Course not found",
		});
	}
}
