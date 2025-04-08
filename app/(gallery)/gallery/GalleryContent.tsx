"use client";

import { BookCopy, BookOpen, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseDB } from "@/app/lib/schemas";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface GalleryContentProps {
  courses: CourseDB[] | null;
  error: string | null;
  success: boolean;
}

export default function GalleryContent({ courses, error, success }: GalleryContentProps) {
  if (!success || !courses) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-10">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
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
                <div className="flex items-center justify-between text-xs text-muted-foreground pb-4">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
                  </div>
                  {course.viewCount && (
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {course.viewCount.total} view{course.viewCount.total !== 1 && 's'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 