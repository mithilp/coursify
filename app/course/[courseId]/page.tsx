// Server Component
import { CourseClientPage } from "./components/CourseClientPage";
import { db } from "@/app/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import { CourseDB } from "@/app/lib/schemas";
import ViewTracker from "./components/ViewTracker";
import { auth } from "@clerk/nextjs/server";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const courseId = (await params).courseId;
  const unitParam = (await searchParams).unit as string | undefined;
  const chapterParam = (await searchParams).chapter as string | undefined;
  const { userId } = await auth();

  // Fetch course data from Firebase
  const courseRef = doc(db, "courses", courseId);
  const courseDoc = await getDoc(courseRef);

  if (!courseDoc.exists()) {
    return notFound();
  }

  const courseData = { id: courseId, ...courseDoc.data() } as CourseDB;

  // Check if user has access to the course
  if (!courseData.isPublic && courseData.userId !== userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You are not authorized to view this course.
          </p>
          <a 
            href="/gallery" 
            className="text-primary hover:underline"
          >
            Go to Gallery
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Client component to track views */}
      <ViewTracker courseId={courseId} />
      
      <CourseClientPage
        courseId={courseId}
        unitParam={unitParam}
        chapterParam={chapterParam}
        initialCourse={courseData}
      />
    </>
  );
}
