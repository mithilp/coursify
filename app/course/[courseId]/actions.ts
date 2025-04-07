"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/app/utils/firebase";
import { doc, getDoc, collection, setDoc, updateDoc } from "firebase/firestore";
import { GeneratedCourse, CourseDB, Quiz, QuizQuestion } from "@/app/lib/schemas";

// ... existing code ...

// Generate AI chat response
export async function generateChatResponse(
  courseId: string,
  unitId: string,
  chapterId: string,
  userMessage: string
) {
  try {
    // Get course data to provide context
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error("Course not found");
    }

    const courseData = courseSnap.data() as GeneratedCourse;
    const unit = courseData.units.find((u) => u.id === unitId);
    const chapter = unit?.chapters.find((c) => c.id === chapterId);

    if (!unit || !chapter) {
      throw new Error("Chapter not found");
    }

    // Create a prompt that includes course context
    console.log("Chapter Content:", chapter.content);
    const prompt = `You are an AI tutor helping a student understand the content of a course chapter.
    
Course Topic: ${courseData.courseTopic}
Unit: ${unit.title}
Chapter: ${chapter.title}
Chapter Content: ${chapter.content || "No content available yet"}

Student Question: ${userMessage}

Please provide a helpful, educational response that:
1. Directly addresses the student's question
2. Uses the chapter content as context
3. Provides clear explanations and examples
4. Encourages further learning.

Keep your response concise and to the point. Should be a few sentences at most.

Response:`;

    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    return { success: true, response: text };
  } catch (error) {
    console.error("Error generating chat response:", error);
    return { success: false, error: (error as Error).message };
  }
} 