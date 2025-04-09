import { notFound } from "next/navigation";
import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { BookCopy } from "lucide-react";
import { CourseCard } from "@/components/CourseCard";

interface UserProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = await params;

  // Fetch user's courses from profileCourses
  const profileCoursesRef = doc(db, "profileCourses", userId);
  const profileCoursesDoc = await getDoc(profileCoursesRef);
  
  if (!profileCoursesDoc.exists()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">No Courses Found</h1>
          <p className="text-muted-foreground">This user hasn't created any courses yet.</p>
        </div>
      </div>
    );
  }

  const courseIds = profileCoursesDoc.data().courses || [];

  // Fetch course details for each course
  const courses = await Promise.all(
    courseIds.map(async (courseId: string) => {
      const courseRef = doc(db, "courses", courseId);
      const courseDoc = await getDoc(courseRef);
      if (courseDoc.exists()) {
        return {
          id: courseId,
          ...courseDoc.data()
        };
      }
      return null;
    })
  );

  // Filter out any null courses (deleted or not found)
  const validCourses = courses.filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-10">
        <BookCopy className="h-12 w-12 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Your Courses</h1>
        <p className="text-xl text-muted-foreground">
          Manage and organize your courses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {validCourses.map((course: any) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
