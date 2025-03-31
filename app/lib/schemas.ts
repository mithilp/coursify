import { z } from "zod";

// Define the schema for course chapters
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

// Define the schema for course units
export const unitSchema = z.object({
  id: z.string(),
  title: z.string().describe("Unit title"),
  chapters: z
    .array(chapterSchema)
    .describe("Chapters within this unit (3-5 chapters)"),
});

// Define the schema for the entire course
export const courseSchema = z.object({
  courseTopic: z.string().describe("The main topic of the course"),
  units: z.array(unitSchema).describe("Units within the course"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

// Type for the course data input
export type CourseUnitInput = {
  id: string;
  title: string;
};

// Type for the generated course
export type GeneratedCourse = z.infer<typeof courseSchema>;
