"use client";

import { BookCopy, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseDB } from "@/app/lib/schemas";
import { formatDistanceToNow } from "date-fns";

interface GalleryContentProps {
  courses: CourseDB[] | null;
  error: string | null;
  success: boolean;
}

export default function GalleryContent({ courses, error, success }: GalleryContentProps) {
  if (!success || !courses) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gallery</h1>
        <p className="text-red-500">Error loading courses: {error}</p>
      </div>
    );
  }

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
          <Link key={course.id} href={`/course/${course.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl pt-4">{course.courseTopic}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {course.units.length} units • {course.units.reduce((acc, unit) => acc + unit.chapters.length, 0)} chapters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {course.description || "No description available"}
                </p>
                <div className="flex items-center text-xs text-muted-foreground pb-4">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 