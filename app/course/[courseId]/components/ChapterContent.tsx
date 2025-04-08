"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, BookOpen } from "lucide-react";
import { CourseDB, UnitDB, ChapterDB } from "@/app/lib/schemas";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper function to clean text
function cleanText(text: string): string {
  // Remove markdown syntax
  let cleaned = text
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .replace(/`/g, '') // Remove code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/>/g, '') // Remove blockquotes
    .replace(/-/g, '') // Remove list markers
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  return cleaned;
}

interface ChapterContentProps {
  course: CourseDB;
  currentUnit: UnitDB;
  currentChapter?: ChapterDB;
}

export default function ChapterContent({
  course,
  currentUnit,
  currentChapter,
}: ChapterContentProps) {
  // Get the current unit index
  const unitIndex = course.units.findIndex(
    (unit) => unit.id === currentUnit.id
  );
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const unitDropdownRef = useRef<HTMLDivElement>(null);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        unitDropdownRef.current &&
        !unitDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUnitDropdownOpen(false);
      }
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCourseDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If no chapter is selected, show unit view
  if (!currentChapter) {
    return (
      <div>
        {/* Breadcrumb - hide on small screens */}
        <nav className="hidden md:flex items-center text-sm text-muted-foreground mb-6">
          <div className="relative" ref={courseDropdownRef}>
            <button
              className="flex items-center hover:text-foreground focus:outline-none"
              onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
            >
              {course.courseTopic}
              <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
            </button>

            {isCourseDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-md z-10">
                {course.units.map((unit, idx) => (
                  <Link
                    key={unit.id}
                    href={`/course/${course.id}?unit=${unit.id}`}
                    className={`
                      block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground
                      ${
                        currentUnit.id === unit.id
                          ? "bg-accent/50 font-medium"
                          : ""
                      }
                    `}
                    onClick={() => setIsCourseDropdownOpen(false)}
                  >
                    Unit {idx + 1}: {unit.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">
            Unit {unitIndex + 1}: {currentUnit.title}
          </span>
        </nav>

        {/* Unit Title and Description */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Unit {unitIndex + 1}: {currentUnit.title}
          </h1>
          {currentUnit.description && (
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              {currentUnit.description}
            </p>
          )}
        </div>

        {/* Chapter List */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Chapters in this Unit
          </h2>
          <div className="grid gap-3 md:gap-4 md:grid-cols-2">
            {currentUnit.chapters.map((chapter, chapterIndex) => (
              <Link
                key={chapter.id}
                href={`/course/${course.id}?unit=${currentUnit.id}&chapter=${chapter.id}`}
                className="border border-border rounded-md p-3 md:p-4 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-7 w-7 md:h-8 md:w-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                    {chapterIndex + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm md:text-base mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                      {chapter.summary ? cleanText(chapter.summary).substring(0, 100) + "..." : "No description available"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chapter view
  return (
    <div>
      {/* Breadcrumb - hidden on mobile */}
      <nav className="hidden md:flex items-center text-sm text-muted-foreground mb-6 flex-wrap">
        {/* Course dropdown in breadcrumb */}
        <div className="relative" ref={courseDropdownRef}>
          <button
            className="flex items-center hover:text-foreground focus:outline-none"
            onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
          >
            {course.courseTopic}
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </button>

          {isCourseDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-md z-10">
              {course.units.map((unit, idx) => (
                <Link
                  key={unit.id}
                  href={`/course/${course.id}?unit=${unit.id}`}
                  className={`
                    block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground
                    ${
                      currentUnit.id === unit.id
                        ? "bg-accent/50 font-medium"
                        : ""
                    }
                  `}
                  onClick={() => setIsCourseDropdownOpen(false)}
                >
                  Unit {idx + 1}: {unit.title}
                </Link>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 mx-2" />

        {/* Unit dropdown in breadcrumb */}
        <div className="relative" ref={unitDropdownRef}>
          <button
            className="flex items-center hover:text-foreground focus:outline-none"
            onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
          >
            Unit {unitIndex + 1}: {currentUnit.title}
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </button>

          {isUnitDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-md z-10">
              {currentUnit.chapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  href={`/course/${course.id}?unit=${currentUnit.id}&chapter=${chapter.id}`}
                  className={`
                    block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground
                    ${
                      currentChapter.id === chapter.id
                        ? "bg-accent/50 font-medium"
                        : ""
                    }
                  `}
                  onClick={() => setIsUnitDropdownOpen(false)}
                >
                  Chapter {index + 1}: {chapter.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-medium">
          {currentChapter.title}
        </span>
      </nav>

      {/* Chapter Title */}
      <div className="mb-4 md:mb-8">
        <div className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">
          UNIT {unitIndex + 1} · CHAPTER{" "}
          {currentUnit.chapters.findIndex(
            (chapter) => chapter.id === currentChapter.id
          ) + 1}
        </div>
        <h1 className="text-xl md:text-3xl font-bold">
          {currentChapter.title}
        </h1>
      </div>

      {/* Video Embed */}
      {currentChapter.videoId && (
        <div className="mb-8">
          <div className="aspect-video w-full max-w-4xl mx-auto">
            <iframe
              src={`https://www.youtube.com/embed/${currentChapter.videoId}`}
              title={currentChapter.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Chapter Content */}
      <div className="prose prose-slate dark:prose-invert max-w-4xl mx-auto">
        {currentChapter.summary ? (
          <div className="space-y-6">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mb-3 mt-6">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{children}</code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4">{children}</blockquote>
                ),
              }}
            >
              {currentChapter.summary}
            </ReactMarkdown>
          </div>
        ) : null}
      </div>
    </div>
  );
}
