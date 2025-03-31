"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { courseSchema, CourseUnitInput, GeneratedCourse } from "../lib/schemas";
import { db } from "../utils/firebase";
import { collection, addDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

/**
 * Server action to generate course content with AI
 */
export async function generateCourse(
  courseTopic: string,
  courseUnits: CourseUnitInput[]
) {
  try {
    // Filter out empty units
    const validUnits = courseUnits.filter((unit) => unit.title.trim() !== "");

    if (validUnits.length === 0) {
      throw new Error("At least one unit is required");
    }

    // Prepare units for the prompt
    const unitsString = validUnits
      .map((unit, index) => `Unit ${index + 1}: ${unit.title}`)
      .join("\n");

    // Using Zod schema with generateObject
    const { object } = await generateObject<GeneratedCourse>({
      model: google("gemini-2.0-flash-001", { structuredOutputs: true }),
      prompt: `Create a course on "${courseTopic}" with the following units:\n${unitsString}\n\nFor each unit, generate 3-5 chapters with brief descriptions. The course should be educational and well-structured.`,
      schema: courseSchema,
    });

    // Merge the original unit IDs with the generated content
    const unitsWithIds = object.units.map((generatedUnit, index) => {
      const originalUnit = validUnits[index] || { id: `generated-${index}` };
      return {
        ...generatedUnit,
        id: originalUnit.id,
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
    const coursesCollection = collection(db, "courses");
    const docRef = await addDoc(coursesCollection, {
      ...courseData,
      createdAt: new Date().toISOString(),
    });

    // Revalidate the create page
    revalidatePath("/create/[courseId]");

    return { success: true, courseId: docRef.id };
  } catch (error) {
    console.error("Error saving course to Firebase:", error);
    return { success: false, error: (error as Error).message };
  }
}
