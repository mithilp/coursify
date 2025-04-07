import { getAllCourses } from "./actions";
import GalleryContent from "./GalleryContent";

export default async function GalleryPage() {
  const { success, courses, error } = await getAllCourses();

  return <GalleryContent courses={courses} error={error} success={success} />;
}
