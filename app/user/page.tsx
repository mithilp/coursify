import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserCourses } from "../actions/courseActions";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CourseCard } from "./components/CourseCard";

export default async function ProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const { courses } = await getUserCourses(userId);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((courseId: string) => (
          <CourseCard key={courseId} courseId={courseId} />
        ))}
      </div>
    </div>
  );
} 