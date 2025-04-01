"use client";

import { BookCopy } from "lucide-react";
import CourseCard from "../components/CourseCard";

// Types
type CourseCreator = {
  userId: string;
  name: string;
};

type Course = {
  id: string;
  title: string;
  createdBy: CourseCreator;
  units: any[];
  shortDescription?: string;
  views?: number;
};

// Dummy data - in a real app, this would come from an API
const courses: Course[] = [
  {
    id: "workplace-narcissism",
    title: "Understanding Workplace Narcissism",
    shortDescription:
      "Learn to identify and manage narcissistic behaviors in professional settings",
    createdBy: {
      userId: "sarah-johnson",
      name: "Dr. Sarah Johnson",
    },
    units: [],
    views: 342,
  },
  {
    id: "python-intro",
    title: "Introduction to Python",
    shortDescription: "Learn Python programming from scratch",
    createdBy: {
      userId: "demo-user",
      name: "Demo User",
    },
    units: [],
    views: 189,
  },
  {
    id: "calculus-101",
    title: "Calculus 101",
    shortDescription: "Master the fundamentals of calculus",
    createdBy: {
      userId: "demo-user",
      name: "Demo User",
    },
    units: [],
    views: 127,
  },
];

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-10">
        <BookCopy className="h-12 w-12 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Course Gallery</h1>
        <p className="text-xl text-muted-foreground">
          Explore courses created by the Coursify community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            shortDescription={course.shortDescription}
            createdBy={course.createdBy}
            units={course.units}
            views={course.views}
          />
        ))}
      </div>
    </div>
  );
}
