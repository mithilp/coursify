import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Globe } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
  courseId: string;
}

export async function CourseCard({ courseId }: CourseCardProps) {
  const courseRef = doc(db, "courses", courseId);
  const courseDoc = await getDoc(courseRef);
  
  if (!courseDoc.exists()) {
    return null;
  }

  const course = courseDoc.data();
  
  return (
    <Link href={`/course/${courseId}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative">
            <img
              src={course.thumbnail || "/placeholder-course.jpg"}
              alt={course.courseTopic}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="absolute top-2 right-2">
              {course.isPublic ? (
                <Globe className="w-5 h-5 text-blue-500" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold mb-2">
            {course.courseTopic}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {course.units?.length || 0} Units • {course.units?.reduce((acc: number, unit: any) => acc + (unit.chapters?.length || 0), 0) || 0} Chapters
          </p>
        </CardContent>
      </Card>
    </Link>
  );
} 