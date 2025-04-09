"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { courseSchema, CourseUnitInput, GeneratedCourse } from "../lib/schemas";
import { db } from "../utils/firebase";
import {
  collection,
  addDoc,
  getDoc,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

interface ProfileCourses {
  courses: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Server action to generate course content with AI
 */
export async function generateChapters(
  courseTopic: string,
  courseUnits: CourseUnitInput[]
) {
  try {
    // Filter out empty units
    const validUnits = courseUnits.filter((unit) => unit.title.trim() !== "");

    // Prepare prompt based on whether units are provided
    let prompt = "";

    if (validUnits.length > 0) {
      // Prepare units for the prompt
      const unitsString = validUnits
        .map((unit, index) => `Unit ${index + 1}: ${unit.title}`)
        .join("\n");

      prompt = `Create a course on "${courseTopic}" with the following units:\n${unitsString}\n\nFor each unit, generate 3-5 chapters with brief descriptions. Also provide a short one-sentence course description that summarizes the course. The course should be educational and well-structured.`;
    } else {
      // No units provided, let the AI generate the structure
      prompt = `Create a comprehensive course on "${courseTopic}". Generate 4-5 unites units and 3-5 chapters per unit with brief descriptions. Also provide a short one-sentence course description that summarizes the course. The course should be educational and well-structured.`;
    }

    // Using Zod schema with generateObject
    const { object } = await generateObject<GeneratedCourse>({
      model: google("gemini-2.0-flash-001", { structuredOutputs: true }),
      prompt,
      schema: courseSchema,
    });

    // If original units were provided, merge the original unit IDs with the generated content
    const unitsWithIds = object.units.map((generatedUnit, index) => {
      // For provided units, keep their original IDs
      if (validUnits[index]) {
        return {
          ...generatedUnit,
          id: validUnits[index].id,
        };
      }
      // For AI-generated units, create new IDs
      return {
        ...generatedUnit,
        id: `generated-${index}`,
      };
    });

    const courseData = {
      ...object,
      units: unitsWithIds,
      createdAt: new Date().toISOString(),
    };

    return courseData;
  } catch (error) {
    console.error("Error generating course:", error);
    throw error;
  }
}

/**
 * Save course data to Firebase and return the ID
 */
export async function saveCourseToFirebase(courseData: GeneratedCourse) {
  try {
    console.debug("cheCKING");
    const { userId } = await auth();
    console.debug("User ID from auth:", userId);

    const coursesCollection = collection(db, "courses");
    const docRef = await addDoc(coursesCollection, {
      ...courseData,
      createdAt: new Date().toISOString(),
      userId: userId,
    });

    if (userId) {
      const profileRef = doc(db, "profileCourses", userId);

      // Check if document exists
      const profileDoc = await getDoc(profileRef);
      if (profileDoc.exists()) {
        // Document exists, update the courses array
        const currentCourses = profileDoc.data().courses || [];
        await updateDoc(profileRef, {
          courses: [...currentCourses, docRef.id],
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Document doesn't exist, create it with the course
        await setDoc(profileRef, {
          courses: [docRef.id],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Revalidate the create page
    revalidatePath("/create/[courseId]");

    return { success: true, courseId: docRef.id };
  } catch (error) {
    console.error("Error saving course to Firebase:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Add course to user's enrolled courses
export async function enrollInCourse(userId: string, courseId: string) {
  try {
    const profileRef = doc(db, "profileCourses", userId);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      // Document exists, update the courses array
      const currentCourses = profileDoc.data().courses || [];
      if (!currentCourses.includes(courseId)) {
        await updateDoc(profileRef, {
          courses: [...currentCourses, courseId],
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      // Document doesn't exist, create it with the course
      await setDoc(profileRef, {
        courses: [courseId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Get user's enrolled courses
export async function getUserCourses(userId: string) {
  try {
    const profileRef = doc(db, "profileCourses", userId);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      return { success: true, courses: profileDoc.data().courses || [] };
    } else {
      return { success: true, courses: [] };
    }
  } catch (error) {
    console.error("Error getting user courses:", error);
    return { success: false, error: (error as Error).message };
  }
}
