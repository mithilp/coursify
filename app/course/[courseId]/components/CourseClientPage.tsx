"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseSidebar from "./CourseSidebar";
import InteractionsSidebar from "./InteractionsSidebar";
import ChapterContent from "./ChapterContent";
import Link from "next/link";
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
  const [showSidebar, setShowSidebar] = useState(true);
  const [showQuiz, setShowQuiz] = useState(true);

  if (!initialCourse) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
        <Link href="/gallery">
          <Button>Back to Gallery</Button>
        </Link>
      </div>
    );
  }

  // Find the selected unit and chapter
  const selectedUnit = initialCourse.units.find((unit) => unit.id === unitParam) || initialCourse.units[0];
  const selectedChapter = chapterParam
    ? selectedUnit.chapters.find((chapter) => chapter.id === chapterParam)
    : undefined;

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleQuiz = () => setShowQuiz(!showQuiz);

  return (
    <div className="flex h-[calc(100vh-64px)] mt-16">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-20 left-4 z-30"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Course sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-20 w-64 bg-background border-r transition-transform duration-200 ease-in-out`}
      >
        <CourseSidebar
          course={initialCourse}
          selectedUnitId={unitParam}
          selectedChapterId={chapterParam}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="px-4 py-6 md:py-8 max-w-4xl mx-auto">
          <ChapterContent
            course={initialCourse}
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
          } md:translate-x-0 fixed md:static inset-y-0 right-0 z-20 w-80 bg-background border-l transition-transform duration-200 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between">
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
