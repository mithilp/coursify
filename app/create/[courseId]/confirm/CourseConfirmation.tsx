"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { publishCourse, saveCourseAsDraft } from "./actions";
import { CourseDB } from "@/app/lib/schemas";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { db } from "@/app/utils/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

interface CourseConfirmationProps {
  course: CourseDB;
}

export function CourseConfirmation({
  course: initialCourse,
}: CourseConfirmationProps) {
  const [course, setCourse] = useState<CourseDB>(initialCourse);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Initialize expanded units on load
  useEffect(() => {
    setExpandedUnits(initialCourse.units.map((unit) => unit.id));
  }, [initialCourse]);

  // Subscribe to course updates in Firestore
  useEffect(() => {
    const courseRef = doc(db, "courses", course.id);

    const unsubscribe = onSnapshot(courseRef, (doc) => {
      if (doc.exists()) {
        const courseData = { id: course.id, ...doc.data() } as CourseDB;
        setCourse((prev) => ({ ...prev, ...courseData }));
      }
    });

    return () => unsubscribe();
  }, [course.id]);

  // Handle accordion changes
  const handleAccordionChange = (value: string[]) => {
    setExpandedUnits(value);
  };

  // Publish or save the course
  const handleConfirmCourse = async () => {
    startTransition(async () => {
      try {
        // Update the course document with privacy status
        const courseRef = doc(db, "courses", course.id);
        await updateDoc(courseRef, {
          isPublic: course.isPublic,
          updatedAt: new Date().toISOString()
        });

        if (course.isPublic) {
          const result = await publishCourse(course.id);
          if (result.success) {
            router.push(`/course/${course.id}`);
          }
        } else {
          const result = await saveCourseAsDraft(course.id);
          if (result.success) {
            router.push(`/course/${course.id}`);
          }
        }
      } catch (error) {
        console.error("Error updating course privacy:", error);
      }
    });
  };

  // Render the chapter status indicator
  const renderChapterStatus = (
    chapter: CourseDB["units"][0]["chapters"][0]
  ) => {
    if (chapter.loading) {
      return (
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 rounded-full mr-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      );
    } else if (chapter.error) {
      return (
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
          <span className="text-xs text-red-500">Error: {chapter.error}</span>
        </div>
      );
    } else if (chapter.content && chapter.videoId && chapter.quiz) {
      return (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          <span className="text-xs text-green-500">Complete</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
          <span className="text-xs text-red-500">Missing content</span>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto px-3 py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Course Confirmation</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left column: Units and chapters */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Course Structure</h2>
          </div>

          <Accordion
            type="multiple"
            value={expandedUnits}
            onValueChange={handleAccordionChange}
            className="space-y-3"
          >
            {course.units.map((unit, unitIndex) => (
              <AccordionItem
                key={unit.id}
                value={unit.id}
                className="border border-b-1! rounded-md overflow-hidden bg-card"
              >
                <div className="flex items-center justify-between">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline flex items-center">
                    <span className="font-medium text-lg">
                      Unit {unitIndex + 1}
                    </span>
                  </AccordionTrigger>
                </div>
                <AccordionContent className="px-3 pt-2 pb-3">
                  <div className="space-y-3">
                    <Input
                      value={unit.title}
                      readOnly
                      placeholder="Unit title"
                      className="w-full text-sm bg-muted/50"
                    />

                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-muted-foreground">
                          Chapters
                        </label>
                      </div>

                      {unit.chapters.map((chapter, chapterIndex) => (
                        <div
                          key={chapter.id}
                          className="flex items-center gap-2"
                        >
                          <span className="text-xs text-muted-foreground w-4">
                            {chapterIndex + 1}.
                          </span>
                          <div className="flex-1 flex items-center justify-between rounded-md border p-2 text-sm">
                            <span className="font-medium">{chapter.title}</span>
                            {renderChapterStatus(chapter)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Right column: Course info */}
        <div>
          <Card className="sticky top-34">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xl">Course Information</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Course Title
                </label>
                <Input
                  value={course.courseTopic}
                  readOnly
                  className="bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Privacy
                </label>
                <div className="flex space-x-3">
                  <div
                    className={`flex-1 border rounded-md p-2 flex items-center gap-2 ${
                      course.isPublic ? "bg-primary/10 border-primary/30" : ""
                    }`}
                  >
                    <Globe
                      size={16}
                      className={course.isPublic ? "text-primary" : ""}
                    />
                    <span className="text-sm">Public</span>
                  </div>
                  <div
                    className={`flex-1 border rounded-md p-2 flex items-center gap-2 ${
                      !course.isPublic ? "bg-primary/10 border-primary/30" : ""
                    }`}
                  >
                    <Lock
                      size={16}
                      className={!course.isPublic ? "text-primary" : ""}
                    />
                    <span className="text-sm">Just Me</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                disabled={course.loading}
                onClick={handleConfirmCourse}
              >
                {isPending || course.loading ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ) : (
                  <>
                    {course.isPublic ? "Confirm & Publish" : "Confirm & Save"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
