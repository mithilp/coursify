"use client";

import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseSidebar from "./CourseSidebar";
import InteractionsSidebar from "./InteractionsSidebar";
import ChapterContent from "./ChapterContent";
import Link from "next/link";
import { db } from "@/app/utils/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { CourseDB } from "@/app/lib/schemas";
import { Skeleton } from "@/components/ui/skeleton";

// Types for our dummy data
type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
};

type Quiz = {
  title: string;
  questions: Question[];
};

type Chapter = {
  id: string;
  title: string;
  videoUrl: string;
  summary: string;
  quiz: Quiz;
};

type Unit = {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
};

type CourseCreator = {
  userId: string;
  name: string;
};

type Course = {
  id: string;
  title: string;
  createdBy: CourseCreator;
  units: Unit[];
};

interface CourseClientPageProps {
  courseId: string;
  unitParam?: string;
  chapterParam?: string;
  initialCourse?: CourseDB;
}

export function CourseClientPage({
  courseId,
  unitParam,
  chapterParam,
  initialCourse,
}: CourseClientPageProps) {
  const [course, setCourse] = useState<CourseDB | null>(initialCourse || null);
  const [loading, setLoading] = useState(!initialCourse);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showQuiz, setShowQuiz] = useState(true);

  // Subscribe to course updates in Firestore
  useEffect(() => {
    const courseRef = doc(db, "courses", courseId);
    const unsubscribe = onSnapshot(courseRef, (doc) => {
      if (doc.exists()) {
        const courseData = { id: courseId, ...doc.data() } as CourseDB;
        setCourse(courseData);
      } else {
        setCourse(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!course) {
    return notFound();
  }

  // Find the selected unit and chapter
  const selectedUnit = course.units.find((unit) => unit.id === unitParam) || course.units[0];
  const selectedChapter = chapterParam
    ? selectedUnit.chapters.find((chapter) => chapter.id === chapterParam)
    : undefined;

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleQuiz = () => setShowQuiz(!showQuiz);

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Course sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform duration-200 ease-in-out`}
      >
        <CourseSidebar
          course={course}
          selectedUnitId={unitParam}
          selectedChapterId={chapterParam}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="px-4 py-6 md:py-8 max-w-4xl mx-auto">
          <ChapterContent
            course={course}
            currentUnit={selectedUnit}
            currentChapter={selectedChapter}
          />
        </div>
      </div>

      {/* Quiz sidebar */}
      {selectedChapter && selectedChapter.quiz && (
        <div
          className={`${
            showQuiz ? "translate-x-0" : "translate-x-full"
          } md:translate-x-0 fixed md:static inset-y-0 right-0 z-40 w-64 bg-background border-l transition-transform duration-200 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Knowledge Check</h2>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleQuiz}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <InteractionsSidebar quiz={selectedChapter.quiz} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
