"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/app/utils/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { CourseDB } from "@/app/lib/schemas";

// Function to publish the course - marking it as completed and published
export async function publishCourse(courseId: string) {
  try {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      loading: false,
      published: true,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/course/${courseId}`);
    revalidatePath(`/create/${courseId}/confirm`);
    return { success: true };
  } catch (error) {
    console.error("Error publishing course:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Function to save the course as a draft but mark it as completed
export async function saveCourseAsDraft(courseId: string) {
  try {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      loading: false,
      published: false,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/course/${courseId}`);
    revalidatePath(`/create/${courseId}/confirm`);
    return { success: true };
  } catch (error) {
    console.error("Error saving course draft:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Function to get course loading status
export async function getCourseLoadingStatus(courseId: string) {
  try {
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (courseSnap.exists()) {
      const data = courseSnap.data();
      return {
        success: true,
        loading: !!data.loading,
      };
    } else {
      return { success: false, error: "Course not found" };
    }
  } catch (error) {
    console.error("Error getting course loading status:", error);
    return { success: false, error: (error as Error).message };
  }
}
