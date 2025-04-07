// This is a Server Component
import { redirect } from "next/navigation";
import { getCourse } from "../actions";
import { CourseConfirmation } from "./CourseConfirmation";

interface PageParams {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseConfirmPage({ params }: PageParams) {
  const courseId = (await params).courseId;

  // If courseId is "new", redirect to home to create a course
  if (courseId === "new") {
    redirect("/");
  }

  // Get course data from Firebase
  const result = await getCourse(courseId);

  // If course not found, redirect to home
  if (!result.success || !result.course) {
    redirect("/");
  }

  return <CourseConfirmation course={result.course} />;
}
