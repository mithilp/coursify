// Server Component
import { CourseClientPage } from "./components/CourseClientPage";
import { db } from "@/app/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import { CourseDB } from "@/app/lib/schemas";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: { courseId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const courseId = (await params).courseId;
  const unitParam = (await searchParams).unit as string | undefined;
  const chapterParam = (await searchParams).chapter as string | undefined;

  // Fetch course data from Firebase
  const courseRef = doc(db, "courses", courseId);
  const courseDoc = await getDoc(courseRef);

  if (!courseDoc.exists()) {
    return notFound();
  }

  const courseData = { id: courseId, ...courseDoc.data() } as CourseDB;

  return (
    <CourseClientPage
      courseId={courseId}
      unitParam={unitParam}
      chapterParam={chapterParam}
      initialCourse={courseData}
    />
  );
}
