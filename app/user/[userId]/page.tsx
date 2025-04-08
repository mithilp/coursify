import { notFound } from "next/navigation";
import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import CourseCard from "../../components/CourseCard";

// Types
type CourseCreator = {
  userId: string;
  name: string;
};

type Course = {
  id: string;
  title: string;
  shortDescription?: string;
  createdBy: CourseCreator;
  units: any[];
  views?: number;
};

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = params;

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Courses</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {validCourses.map((course: any) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.courseTopic}
              shortDescription={course.description}
              createdBy={{
                userId: userId,
                name: course.createdBy?.name || "Unknown"
              }}
              units={course.units || []}
              views={course.views || 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
