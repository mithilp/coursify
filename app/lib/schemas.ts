import { z } from "zod";

// ---------------------
// AI MODEL SCHEMAS
// ---------------------

// Define the schema for course chapters (for AI model)
export const chapterSchema = z.object({
  id: z.string(),
  title: z.string().describe("Chapter title"),
  description: z
    .string()
    .optional()
    .describe("Brief description of what this chapter covers"),
  content: z.string().optional().describe("Full content of the chapter"),
  status: z.enum(["idle", "loading", "success", "error"]).optional(),
});

// Define the schema for course units (for AI model)
export const unitSchema = z.object({
  id: z.string(),
  title: z.string().describe("Unit title"),
  chapters: z
    .array(chapterSchema)
    .describe("Chapters within this unit (3-5 chapters)"),
});

// Define the schema for the entire course (for AI model)
export const courseSchema = z.object({
  courseTopic: z.string().describe("The main topic of the course"),
  units: z.array(unitSchema).describe("Units within the course"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

// ---------------------
// DATABASE TYPES
// ---------------------

// Quiz types
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

// Database chapter type with additional fields
export interface ChapterDB {
  id: string;
  title: string;
  description?: string;
  content?: string;
  loading?: boolean;
  views?: number;
  status?: "idle" | "loading" | "success" | "error";
  videoId?: string; // YouTube video ID
  quiz?: Quiz; // Quiz data
  error?: string; // Error message if generation failed
}

// Database unit type
export interface UnitDB {
  id: string;
  title: string;
  description?: string;
  chapters: ChapterDB[];
}

// Database course type with additional fields
export interface CourseDB {
  id: string;
  courseTopic: string;
  description?: string;
  units: UnitDB[];
  createdAt: string;
  updatedAt: string;
  loading?: boolean;
}

// ---------------------
// EXPORTED TYPES
// ---------------------

// Type for the course data input
export type CourseUnitInput = {
  id: string;
  title: string;
};

// Type for the generated course (from AI model)
export type GeneratedCourse = z.infer<typeof courseSchema>;

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  content?: string;
  status?: "idle" | "loading" | "success" | "error";
  videoId?: string;
  quiz?: Quiz;
}
