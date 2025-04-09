import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/utils/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import GalleryContent from "./GalleryContent";

export default async function GalleryPage() {
  const { userId } = await auth();

  // Get all public courses
  const coursesRef = collection(db, "courses");
  const publicCoursesQuery = query(coursesRef, where("isPublic", "==", true));
  const publicCoursesSnapshot = await getDocs(publicCoursesQuery);
  const publicCourses = publicCoursesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Get user's private courses if logged in
  let privateCourses = [];
  if (userId) {
    const profileCoursesRef = doc(db, "profileCourses", userId);
    const profileCoursesDoc = await getDoc(profileCoursesRef);
    if (profileCoursesDoc.exists()) {
      const courseIds = profileCoursesDoc.data().courses || [];
      const privateCoursesPromises = courseIds.map(async (courseId: string) => {
        const courseRef = doc(db, "courses", courseId);
        const courseDoc = await getDoc(courseRef);
        if (courseDoc.exists() && !courseDoc.data().isPublic) {
          return {
            id: courseId,
            ...courseDoc.data()
          };
        }
        return null;
      });
      privateCourses = (await Promise.all(privateCoursesPromises)).filter(Boolean);
    }
  }

  // Combine public and private courses
  const allCourses = [...publicCourses, ...privateCourses];

  return (
    <GalleryContent 
      courses={allCourses} 
      error={null} 
      success={true} 
    />
  );
}
