import { db } from "../../utils/config";
import { doc, getDoc } from "firebase/firestore";

export default async function Page({ params }) {
	const data = await getData(params);
	return <div>Course Name: {data.title}</div>;
}

async function getData(params) {
	let data = {};

	const document = await getDoc(doc(db, "courses", params.courseId));

	if (document.exists()) {
		data = document.data();
	} else {
		console.log("No such document!");
	}

	return data;
}
