"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, BookOpen } from "lucide-react";

// Types from the parent component
type Chapter = {
  id: string;
  title: string;
  videoUrl: string;
  summary: string;
};

type Unit = {
  id: string;
  title: string;
  description?: string;
  chapters: Chapter[];
};

type Course = {
  id: string;
  title: string;
  units: Unit[];
};

interface ChapterContentProps {
  course: Course;
  currentUnit: Unit;
  currentChapter?: Chapter;
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
              {course.title}
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
                      {chapter.summary.substring(0, 100)}...
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
            {course.title}
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
      <div className="aspect-video bg-black mb-6 md:mb-8 rounded-lg overflow-hidden">
        <iframe
          className="w-full h-full"
          src={currentChapter.videoUrl}
          title={currentChapter.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Chapter Summary */}
      <div className="mb-8 md:mb-10">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
          Video Summary
        </h2>
        <div className="prose max-w-none text-sm md:text-base">
          <p>{currentChapter.summary}</p>
        </div>
      </div>

      {/* Chapter Navigation */}
      <div className="flex justify-between mt-8 md:mt-12 pt-4 md:pt-6 border-t">
        {getPreviousChapter(course, currentUnit, currentChapter) ? (
          <Link
            href={getChapterUrl(
              course,
              ...getPreviousChapter(course, currentUnit, currentChapter)!
            )}
            className="flex items-center text-primary hover:underline text-sm md:text-base"
          >
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            <span className="hidden sm:inline">Previous Chapter</span>
            <span className="sm:hidden">Previous</span>
          </Link>
        ) : (
          <div></div>
        )}

        {getNextChapter(course, currentUnit, currentChapter) ? (
          <Link
            href={getChapterUrl(
              course,
              ...getNextChapter(course, currentUnit, currentChapter)!
            )}
            className="flex items-center text-primary hover:underline text-sm md:text-base"
          >
            <span className="hidden sm:inline">Next Chapter</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

// Helper function to get the URL for a chapter
function getChapterUrl(course: Course, unit: Unit, chapter: Chapter): string {
  return `/course/${course.id}?unit=${unit.id}&chapter=${chapter.id}`;
}

// Helper function to get the previous chapter
function getPreviousChapter(
  course: Course,
  currentUnit: Unit,
  currentChapter: Chapter
): [Unit, Chapter] | null {
  const currentUnitIndex = course.units.findIndex(
    (u) => u.id === currentUnit.id
  );
  const currentChapterIndex = currentUnit.chapters.findIndex(
    (c) => c.id === currentChapter.id
  );

  // If not the first chapter in the unit
  if (currentChapterIndex > 0) {
    return [currentUnit, currentUnit.chapters[currentChapterIndex - 1]];
  }

  // If first chapter in the unit but not the first unit
  if (currentUnitIndex > 0) {
    const previousUnit = course.units[currentUnitIndex - 1];
    const lastChapterInPreviousUnit =
      previousUnit.chapters[previousUnit.chapters.length - 1];
    return [previousUnit, lastChapterInPreviousUnit];
  }

  // First chapter in first unit
  return null;
}

// Helper function to get the next chapter
function getNextChapter(
  course: Course,
  currentUnit: Unit,
  currentChapter: Chapter
): [Unit, Chapter] | null {
  const currentUnitIndex = course.units.findIndex(
    (u) => u.id === currentUnit.id
  );
  const currentChapterIndex = currentUnit.chapters.findIndex(
    (c) => c.id === currentChapter.id
  );

  // If not the last chapter in the unit
  if (currentChapterIndex < currentUnit.chapters.length - 1) {
    return [currentUnit, currentUnit.chapters[currentChapterIndex + 1]];
  }

  // If last chapter in the unit but not the last unit
  if (currentUnitIndex < course.units.length - 1) {
    const nextUnit = course.units[currentUnitIndex + 1];
    const firstChapterInNextUnit = nextUnit.chapters[0];
    return [nextUnit, firstChapterInNextUnit];
  }

  // Last chapter in last unit
  return null;
}
