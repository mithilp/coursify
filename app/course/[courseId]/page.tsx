// Server Component
import { CourseClientPage } from "./components/CourseClientPage";

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

  return (
    <CourseClientPage
      courseId={courseId}
      unitParam={unitParam}
      chapterParam={chapterParam}
    />
  );
}
