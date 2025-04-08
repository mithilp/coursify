"use server";

import { db } from "@/app/utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { CourseDB } from "@/app/lib/schemas";

export async function getAllCourses() {
  try {
    const coursesRef = collection(db, "courses");
    const q = query(coursesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const courses: CourseDB[] = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() } as CourseDB);
    });

    return { success: true, courses };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { success: false, error: (error as Error).message };
  }
} 