"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/app/utils/firebase";
import { doc, getDoc, collection, setDoc, updateDoc } from "firebase/firestore";
import { GeneratedCourse, CourseDB, Quiz, QuizQuestion } from "@/app/lib/schemas";

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

    // Process each chapter individually
    const chapterPromises = [];

    for (const unit of courseData.units) {
      for (const chapter of unit.chapters) {
        // Process each chapter with a separate promise
        const chapterPromise = processChapter(courseId, unit.id, chapter.id);
        chapterPromises.push(chapterPromise);
      }
    }

    // Let all chapters process independently
    Promise.all(chapterPromises).then(() => {
      // When all complete, update course loading state
      updateDoc(courseRef, {
        loading: false,
        updatedAt: new Date().toISOString(),
      });
      console.debug(
        `All chapters generated for courseId: ${courseId} at ${new Date().toISOString()}`
      );
    });

    revalidatePath(`/create/${courseId}`);
    revalidatePath(`/create/${courseId}/confirm`);

    return {
      success: true,
      chapterResults: [] as ChapterResult[],
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

    console.debug(`Searching YouTube for: "${cleanQuery}"`);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        cleanQuery
      )}&type=video&key=${process.env.YOUTUBE_API}&maxResults=5&videoDuration=any&videoEmbeddable=true&relevanceLanguage=en`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.debug(`YouTube search results count: ${data.items?.length || 0}`);

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

      console.debug(`Selected video: ${video.snippet.title}`);
      return video.id.videoId;
    }

    console.warn('No videos found for query:', cleanQuery);
    return null;
  } catch (error) {
    console.error("Error searching YouTube:", error);
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
              status: "loading",
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

    // Search for relevant YouTube video
    let videoId = await searchYouTubeVideo(chapter.title);
    if (!videoId) {
      // Instead of throwing an error, we'll try a more generic search
      console.warn(`No video found for "${chapter.title}", trying with course topic`);
      const courseTopic = courseData.courseTopic;
      videoId = await searchYouTubeVideo(`${courseTopic} ${chapter.title}`);
      
      if (!videoId) {
        console.error(`No video found for chapter "${chapter.title}" in course "${courseTopic}"`);
        // Update chapter status to error
        const errorUnits = courseData.units.map((unit) => {
          if (unit.id === unitId) {
            const updatedChapters = unit.chapters.map((chapter) => {
              if (chapter.id === chapterId) {
                return {
                  ...chapter,
                  status: "error",
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

        await updateDoc(courseRef, {
          units: errorUnits,
          updatedAt: new Date().toISOString(),
        });

        return { success: false, chapterId, error: "No suitable video found" };
      }
    }

    // Get transcript from YouTube video
    const { transcript, success: successTranscript } = await getYoutubeTranscript(videoId);
    if (!successTranscript) {
      // Update chapter status to error
      const errorUnits = courseData.units.map((unit) => {
        if (unit.id === unitId) {
          const updatedChapters = unit.chapters.map((chapter) => {
            if (chapter.id === chapterId) {
              return {
                ...chapter,
                status: "error",
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

      await updateDoc(courseRef, {
        units: errorUnits,
        updatedAt: new Date().toISOString(),
      });

      throw new Error("Failed to get video transcript");
    }

    // Generate quiz from transcript
    const quiz = await generateQuizFromTranscript(transcript, chapter.title);
    // Update the units with the content and set status to success
    const finalUnits = courseData.units.map((unit) => {
      if (unit.id === unitId) {
        const updatedChapters = unit.chapters.map((chapter) => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              videoId,
              quiz,
              status: "success",
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
    console.log("FINAL UNITS: ", finalUnits);

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
    
    // Update chapter status to error
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      const courseData = courseSnap.data() as GeneratedCourse;
      const errorUnits = courseData.units.map((unit) => {
        if (unit.id === unitId) {
          const updatedChapters = unit.chapters.map((chapter) => {
            if (chapter.id === chapterId) {
              return {
                ...chapter,
                status: "error",
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

      await updateDoc(courseRef, {
        units: errorUnits,
        updatedAt: new Date().toISOString(),
      });
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
