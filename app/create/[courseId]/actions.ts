"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/app/utils/firebase";
import { doc, getDoc, collection, setDoc, updateDoc } from "firebase/firestore";
import { GeneratedCourse, CourseDB, Quiz, QuizQuestion } from "@/app/lib/schemas";
import { fetchYouTubeApi, youtubeApiKeyManager } from "@/app/utils/youtube-api";
import { auth } from "@clerk/nextjs/server";
// Get course data from Firebase
export async function getCourse(courseId: string) {
  try {
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (courseSnap.exists()) {
      return {
        success: true,
        course: { id: courseId, ...courseSnap.data() } as CourseDB,
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
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error("Course not found");
    }

    const currentData = courseSnap.data() as GeneratedCourse;

    // If updating units, ensure proper structure
    if (courseData.units) {
      const updatedUnits = courseData.units.map((newUnit) => {
        const existingUnit = currentData.units.find((u) => u.id === newUnit.id);
        
        // For each unit, ensure it has the required structure
        const unit = {
          id: newUnit.id,
          title: newUnit.title,
          chapters: newUnit.chapters.map((newChapter) => {
            // For each chapter, ensure it has the required structure
            return {
              id: newChapter.id,
              title: newChapter.title,
              status: newChapter.status || "idle"
            };
          })
        };

        return unit;
      });

      // Update the document with the properly structured data
      await updateDoc(courseRef, {
        units: updatedUnits,
        updatedAt: new Date().toISOString(),
      });

      revalidatePath(`/create/${courseId}`);
      revalidatePath(`/create/${courseId}/confirm`);
      return { success: true };
    }

    // If not updating units, just update other fields
    await updateDoc(courseRef, {
      ...courseData,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/create/${courseId}`);
    revalidatePath(`/create/${courseId}/confirm`);
    return { success: true };
  } catch (error) {
    console.error("Error updating course:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
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
  try {
    console.debug(
      `Starting course generation for courseId: ${courseId} at ${new Date().toISOString()}`
    );

    // Get current course data
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error("Course not found");
    }

    const courseData = courseSnap.data() as GeneratedCourse;

    // Set the course to loading state
    await updateDoc(courseRef, {
      loading: true,
      updatedAt: new Date().toISOString(),
    });

    // Process each chapter individually and track results
    const chapterResults: ChapterResult[] = [];
    const chapterPromises = [];

    for (const unit of courseData.units) {
      for (const chapter of unit.chapters) {
        // Set chapter to loading state
        const updatedUnits = courseData.units.map((u) => {
          if (u.id === unit.id) {
            const updatedChapters = u.chapters.map((c) => {
              if (c.id === chapter.id) {
                return { ...c, loading: true, error: null };
              }
              return c;
            });
            return { ...u, chapters: updatedChapters };
          }
          return u;
        });

        await updateDoc(courseRef, {
          units: updatedUnits,
          updatedAt: new Date().toISOString(),
        });

        // Process each chapter with a separate promise
        const chapterPromise = processChapter(courseId, unit.id, chapter.id)
          .then((result) => {
            chapterResults.push(result);
            return result;
          });
        chapterPromises.push(chapterPromise);
      }
    }

    // Wait for all chapters to complete
    await Promise.all(chapterPromises);

    // Get the final course state after all updates
    const finalCourseSnap = await getDoc(courseRef);
    if (!finalCourseSnap.exists()) {
      throw new Error("Course not found after generation");
    }

    const finalCourseData = finalCourseSnap.data() as GeneratedCourse;

    // Update the course with the final state and mark as complete
    await updateDoc(courseRef, {
      ...finalCourseData,
      loading: false,
      updatedAt: new Date().toISOString(),
    });

    console.debug(
      `All chapters generated for courseId: ${courseId} at ${new Date().toISOString()}`
    );

    revalidatePath(`/create/${courseId}`);
    revalidatePath(`/create/${courseId}/confirm`);

    return {
      success: true,
      chapterResults,
    };
  } catch (error) {
    console.error("Error generating course:", error);
    return {
      success: false,
      error: (error as Error).message,
      chapterResults: [] as ChapterResult[],
    };
  }
}

async function searchYouTubeVideo(query: string): Promise<string | null> {
  try {
    // Clean and prepare the search query
    const cleanQuery = query
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim()
      .split(' ')
      .filter(word => word.length > 2) // Remove short words
      .join(' ');

    console.debug(`[YouTubeAPI] Searching YouTube for: "${cleanQuery}"`);
    console.debug(`[YouTubeAPI] API Key status: ${JSON.stringify(youtubeApiKeyManager.getKeyStatuses())}`);

    // Use our enhanced API fetch utility
    const data = await fetchYouTubeApi<any>(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        cleanQuery
      )}&type=video&maxResults=5&videoDuration=any&videoEmbeddable=true&relevanceLanguage=en`
    );

    // Check if we got a response
    if (!data) {
      console.error('[YouTubeAPI] Failed to get YouTube search results - all API keys may be exhausted');
      return null;
    }

    console.debug(`[YouTubeAPI] Search results count: ${data.items?.length || 0}`);

    if (data.items && data.items.length > 0) {
      // Try to find the most relevant video
      const video = data.items.find((item: any) => {
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        const queryWords = cleanQuery.toLowerCase().split(' ');
        
        // Check if title or description contains most of the query words
        const matchingWords = queryWords.filter(word => 
          title.includes(word) || description.includes(word)
        );
        
        return matchingWords.length >= Math.ceil(queryWords.length * 0.5); // At least 50% match
      }) || data.items[0]; // Fallback to first result if no good match

      console.debug(`[YouTubeAPI] Selected video: ${video.snippet.title} (ID: ${video.id.videoId})`);
      return video.id.videoId;
    }

    console.warn('[YouTubeAPI] No videos found for query:', cleanQuery);
    return null;
  } catch (error) {
    console.error("[YouTubeAPI] Error searching YouTube:", error);
    return null;
  }
}

export async function getYoutubeTranscript(videoId: string) {
  try {
    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });
    const transcript = transcriptArr
      .map((entry) => entry.text)
      .join(" ")
      .replaceAll("\n", " ");
    return { transcript, success: true };
  } catch (e) {
    console.error("Error fetching transcript:", e);
    return { transcript: "", success: false };
  }
}

async function generateQuizFromTitles(unitTitle: string, chapterTitle: string): Promise<Quiz> {
  try {
    const prompt = `Create a quiz based on the following course content titles. The quiz should have 5 multiple-choice questions with 4 options each. Each question should test understanding of key concepts that would typically be covered in a chapter with these titles. The correct answer should be clearly indicated.

Unit Title: ${unitTitle}
Chapter Title: ${chapterTitle}

Format the response as a JSON object with the following structure:
{
  "title": "Knowledge Check",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0
    }
  ]
}`;

    let { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    // Extract just the JSON portion from the text
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    text = text.slice(jsonStart, jsonEnd);

    // Parse the JSON response
    const quizData = JSON.parse(text);
    return quizData as Quiz;
  } catch (error) {
    console.error("Error generating quiz from titles:", error);
    // Return a default quiz if generation fails
    return {
      title: "Knowledge Check",
      questions: [
        {
          question: "What is the main topic discussed in this chapter?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
        },
      ],
    };
  }
}

async function generateQuizFromTranscript(transcript: string, chapterTitle: string): Promise<Quiz> {
  try {
    const prompt = `Create a quiz based on the following video transcript. The quiz should have 5 multiple-choice questions with 4 options each. Each question should test understanding of key concepts from the transcript. The correct answer should be clearly indicated.

Transcript: ${transcript}

Chapter Title: ${chapterTitle}

Format the response as a JSON object with the following structure:
{
  "title": "Knowledge Check",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0
    }
  ]
}`;

    let { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    // Extract just the JSON portion from the text
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    text = text.slice(jsonStart, jsonEnd);

    // Parse the JSON response
    const quizData = JSON.parse(text);
    return quizData as Quiz;
  } catch (error) {
    console.error("Error generating quiz:", error);
    // Return a default quiz if generation fails
    return {
      title: "Knowledge Check",
      questions: [
        {
          question: "What is the main topic discussed in this chapter?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
        },
      ],
    };
  }
}

// Process a single chapter with a random delay
async function processChapter(
  courseId: string,
  unitId: string,
  chapterId: string
) {
  console.debug(
    `Starting generation for chapter: ${chapterId} at ${new Date().toISOString()}`
  );

  try {
    // Get course data
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
              loading: true,
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

    // Update course to set chapter to loading
    await updateDoc(courseRef, {
      units: updatedUnits,
      updatedAt: new Date().toISOString(),
    });

    // Find the chapter to process
    const chapter = courseData.units
      .find((unit) => unit.id === unitId)
      ?.chapters.find((chapter) => chapter.id === chapterId);

    if (!chapter) {
      throw new Error("Chapter not found");
    }

    // Find the unit
    const unit = courseData.units.find((unit) => unit.id === unitId);
    if (!unit) {
      throw new Error("Unit not found");
    }

    // Search for relevant YouTube video
    let videoId = await searchYouTubeVideo(chapter.title);
    
    if (!videoId) {
      // Instead of throwing an error, we'll try a more generic search
      console.warn(`[YouTubeAPI] No video found for "${chapter.title}", trying with course topic`);
      const courseTopic = courseData.courseTopic;
      videoId = await searchYouTubeVideo(`${courseTopic} ${chapter.title}`);
      
      if (!videoId) {
        console.error(`[YouTubeAPI] No video found for chapter "${chapter.title}" in course "${courseTopic}"`);
        
        // Update the chapter with the error
        const errorUnits = courseData.units.map((unit) => {
          if (unit.id === unitId) {
            const errorChapters = unit.chapters.map((chapter) => {
              if (chapter.id === chapterId) {
                return {
                  ...chapter,
                  loading: false,
                  error: "No suitable video found - YouTube API keys may be exhausted",
                  status: "error",
                };
              }
              return chapter;
            });
            return {
              ...unit,
              chapters: errorChapters,
            };
          }
          return unit;
        });
        
        // Update course in Firebase with error status
        await updateDoc(courseRef, {
          units: errorUnits,
          updatedAt: new Date().toISOString(),
        });
        
        return { success: false, chapterId, error: "No suitable video found - YouTube API keys may be exhausted" };
      }
    }

    // If we have a videoId, try to get more details about the video (title, etc)
    if (videoId) {
      console.debug(`[YouTubeAPI] Fetching details for video ID: ${videoId}`);
      
      // Use enhanced API utility for video details
      const videoDetails = await fetchYouTubeApi<any>(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}`
      );
      
      if (videoDetails?.items?.[0]) {
        const video = videoDetails.items[0];
        console.debug(`[YouTubeAPI] Video title: ${video.snippet.title}, Duration: ${video.contentDetails.duration}`);
      }
    }

    // Get transcript from YouTube video
    const { transcript, success: successTranscript } = await getYoutubeTranscript(videoId);
    
    let quiz: Quiz;
    let summary: string;

    if (!successTranscript || !transcript) {
      console.warn("[YouTubeAPI] No transcript available, generating quiz from titles");

      // Generate quiz from titles
      quiz = await generateQuizFromTitles(unit.title, chapter.title);
      
      // Generate summary from titles
      const summaryPrompt = `Create comprehensive lecture notes for a chapter titled "${chapter.title}" which is part of a unit called "${unit.title}" in a course about "${courseData.courseTopic}".
      The notes should be well-structured, educational, and around 500-800 words.
      Include key concepts, explanations, and examples where relevant.
      Format the notes in a clear, easy-to-read structure with bullet points and sections.`;
      
      const { text: summaryText } = await generateText({
        model: google("gemini-2.0-flash-001"),
        prompt: summaryPrompt,
      });
      summary = summaryText;
    } else {
      // Generate quiz from transcript
      quiz = await generateQuizFromTranscript(transcript, chapter.title);
      
      // Generate summary from transcript
      const summaryPrompt = `Create comprehensive lecture notes based on the following video transcript for a chapter titled "${chapter.title}" which is part of a unit called "${unit.title}" in a course about "${courseData.courseTopic}".
      
      Video Transcript:
      ${transcript}
      
      The notes should be well-structured, educational, and around 500-800 words.
      Include key concepts, explanations, and examples from the transcript.
      Format the notes in a clear, easy-to-read structure with bullet points and sections.`;
      
      const { text: summaryText } = await generateText({
        model: google("gemini-2.0-flash-001"),
        prompt: summaryPrompt,
      });
      summary = summaryText;
    }

    // Get the latest course data to ensure we're working with the most recent state
    const latestCourseSnap = await getDoc(courseRef);
    if (!latestCourseSnap.exists()) {
      throw new Error("Course not found");
    }
    const latestCourseData = latestCourseSnap.data() as GeneratedCourse;

    // Update the units with the content and set loading to false
    const finalUnits = latestCourseData.units.map((unit) => {
      if (unit.id === unitId) {
        const updatedChapters = unit.chapters.map((chapter) => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              videoId,
              quiz,
              summary,
              loading: false,
              status: "success",
              error: undefined,
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
      units: finalUnits,
      updatedAt: new Date().toISOString(),
    });

    console.debug(
      `Generation complete for chapter: ${chapterId} at ${new Date().toISOString()}`
    );
    return { success: true, chapterId };
  } catch (error) {
    console.error(`Error generating chapter ${chapterId}:`, error);
    
    try {
      // Update the chapter with the error
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (courseSnap.exists()) {
        const courseData = courseSnap.data() as GeneratedCourse;
        
        // Update the units with the error
        const errorUnits = courseData.units.map((unit) => {
          if (unit.id === unitId) {
            const errorChapters = unit.chapters.map((chapter) => {
              if (chapter.id === chapterId) {
                return {
                  ...chapter,
                  loading: false,
                  error: (error as Error).message,
                  status: "error",
                };
              }
              return chapter;
            });
            return {
              ...unit,
              chapters: errorChapters,
            };
          }
          return unit;
        });
        
        // Update course in Firebase with error status
        await updateDoc(courseRef, {
          units: errorUnits,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (updateError) {
      console.error(`Failed to update error status for chapter ${chapterId}:`, updateError);
    }
    
    return { success: false, chapterId, error: (error as Error).message };
  }
}

// Finish course generation
export async function finishCourseGeneration(courseId: string) {
  // This would mark the course as complete
  // For now, just redirect to course page
  revalidatePath(`/course/${courseId}`);
  redirect(`/course/${courseId}`);
}
