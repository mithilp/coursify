"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/app/utils/firebase";
import { doc, getDoc, collection, setDoc, updateDoc } from "firebase/firestore";
import { GeneratedCourse } from "@/app/lib/schemas";

// Get course data from Firebase
export async function getCourse(courseId: string) {
  try {
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (courseSnap.exists()) {
      return {
        success: true,
        course: { id: courseId, ...courseSnap.data() } as GeneratedCourse & {
          id: string;
        },
      };
    } else {
      return { success: false, error: "Course not found" };
    }
  } catch (error) {
    console.error("Error getting course:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Update course data in Firebase
export async function updateCourse(
  courseId: string,
  courseData: Partial<GeneratedCourse>
) {
  try {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      ...courseData,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/create/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Generate content for a specific chapter
export async function generateChapterContent(
  courseId: string,
  unitId: string,
  unitTitle: string,
  chapterId: string,
  chapterTitle: string
) {
  try {
    const prompt = `Create educational content for a chapter titled "${chapterTitle}" which is part of a unit called "${unitTitle}".
    The content should be comprehensive, well-structured, and around 500-800 words.
    Include key points, explanations, and real-world examples where relevant.`;

    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    // Save to Firebase
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error("Course not found");
    }

    const courseData = courseSnap.data() as GeneratedCourse;

    // Find the unit and chapter to update
    const updatedUnits = courseData.units.map((unit) => {
      if (unit.id === unitId) {
        const updatedChapters = unit.chapters.map((chapter) => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              content: text,
            };
          }
          return chapter;
        });
        return {
          ...unit,
          chapters: updatedChapters,
        };
      }
      return unit;
    });

    // Update course in Firebase
    await updateDoc(courseRef, {
      units: updatedUnits,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/create/${courseId}`);
    return { success: true, content: text };
  } catch (error) {
    console.error("Error generating chapter content:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Types for generation results
interface ChapterResult {
  chapterId: string;
  success: boolean;
  error?: string;
}

// Generate full course content
export async function generateFullCourse(courseId: string) {
  // This would be used for bulk generation
  // For now, just return mock results
  revalidatePath(`/create/${courseId}`);
  return {
    success: true,
    chapterResults: [] as ChapterResult[],
  };
}

// Finish course generation
export async function finishCourseGeneration(courseId: string) {
  // This would mark the course as complete
  // For now, just redirect to course page
  revalidatePath(`/course/${courseId}`);
  redirect(`/course/${courseId}`);
}
