import { NextResponse } from "next/server";
import "dotenv/config";

export async function GET() {
	console.log(process.env.PALM_API);
	const data = {
		title: "ww2",
		units: ["battles", "alliances"],
	};

	return NextResponse.json({
		message: "Hello World",
	});
}
