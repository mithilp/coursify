// Server Component
import { CourseClientPage } from "./components/CourseClientPage";
import { db } from "@/app/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: { courseId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const courseId = params.courseId;
  const unitParam = searchParams.unit as string | undefined;
  const chapterParam = searchParams.chapter as string | undefined;

  // Fetch course data from Firebase
  const courseRef = doc(db, "courses", courseId);
  const courseDoc = await getDoc(courseRef);

  if (!courseDoc.exists()) {
    return notFound();
  }

  const courseData = { id: courseId, ...courseDoc.data() };

  return (
    <CourseClientPage
      courseId={courseId}
      unitParam={unitParam}
      chapterParam={chapterParam}
      initialCourse={courseData}
    />
  );
}
