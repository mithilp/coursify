// Server Component
import { CourseClientPage } from "./components/CourseClientPage";
import { db } from "@/app/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import { CourseDB } from "@/app/lib/schemas";
import ViewTracker from "./components/ViewTracker";
import { auth } from "@clerk/nextjs/server";

interface CoursePageProps {
  params: {
    courseId: string;
  };
  searchParams: {
    unit?: string;
    chapter?: string;
  };
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const { courseId } = params;
  const { unit: unitParam, chapter: chapterParam } = searchParams;
  const { userId } = await auth();

  // Fetch course data from Firebase
  const courseRef = doc(db, "courses", courseId);
  const courseDoc = await getDoc(courseRef);

  if (!courseDoc.exists()) {
    return notFound();
  }

  const courseData = { id: courseId, ...courseDoc.data() } as CourseDB;

  // Check if user has access to the course
  const hasAccess = courseData.isPublic || (userId && courseData.userId === userId);
  
  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to view this course. This course is private and can only be accessed by its creator.
          </p>
          <a 
            href="/" 
            className="text-primary hover:underline"
          >
            Return to Home
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
