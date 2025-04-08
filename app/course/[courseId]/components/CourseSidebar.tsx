"use client";

import Link from "next/link";
import { Book, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CourseDB } from "@/app/lib/schemas";

interface CourseSidebarProps {
  course: CourseDB;
  selectedUnitId?: string;
  selectedChapterId?: string;
  onNavigate?: () => void; // Callback for mobile navigation
}

export default function CourseSidebar({
  course,
  selectedUnitId,
  selectedChapterId,
  onNavigate,
}: CourseSidebarProps) {
  // Keep track of expanded units
  const [expandedUnits, setExpandedUnits] = useState<{
    [key: string]: boolean;
  }>(() => {
    // Initialize with the current unit expanded
    const expanded: { [key: string]: boolean } = {};
    course.units.forEach((unit) => {
      expanded[unit.id] = unit.id === selectedUnitId;
    });
    return expanded;
  });

  // Toggle a unit's expanded state
  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  // Handle navigation and mobile closing
  const handleNavigation = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className="bg-muted/20 border-r border-border h-[calc(100vh-64px)] overflow-y-auto">
      <div className="p-4">
        <h1 className="font-bold text-xl mb-6">{course.courseTopic}</h1>

        <nav className="space-y-1">
          {course.units.map((unit, unitIndex) => (
            <div key={unit.id} className="mb-4">
              <button
                onClick={() => toggleUnit(unit.id)}
                className="flex items-center justify-between w-full text-left p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <div>
                  <div className="mr-2 text-sm font-medium text-muted-foreground">
                    UNIT {unitIndex + 1}
                  </div>
                  <div className="font-medium">{unit.title}</div>
                </div>
                {expandedUnits[unit.id] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedUnits[unit.id] && (
                <div className="mt-1 space-y-1">
                  <Link
                    href={`/course/${course.id}?unit=${unit.id}`}
                    className={`
                      block py-2 px-3 text-sm rounded-md mb-2 font-medium
                      ${
                        selectedUnitId === unit.id && !selectedChapterId
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                      }
                    `}
                    onClick={handleNavigation}
                  >
                    Unit {unitIndex + 1} Overview
                  </Link>

                  {unit.chapters.map((chapter, chapterIndex) => (
                    <Link
                      key={chapter.id}
                      href={`/course/${course.id}?unit=${unit.id}&chapter=${chapter.id}`}
                      className={`
                        block py-2 px-3 text-sm rounded-md
                        ${
                          selectedChapterId === chapter.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }
                      `}
                      onClick={handleNavigation}
                    >
                      {chapter.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
