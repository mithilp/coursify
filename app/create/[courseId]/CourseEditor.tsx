"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  generateChapterContent,
  generateFullCourse,
  finishCourseGeneration,
  updateCourse,
} from "./actions";
import { CourseDB } from "@/app/lib/schemas";
import { Skeleton } from "@/components/ui/skeleton";

// Types for UI component usage
interface Chapter {
  id: string;
  title: string;
  description?: string;
  content?: string;
  status?: "idle" | "loading" | "success" | "error";
}

interface Unit {
  id: string;
  title: string;
  chapters: Chapter[];
}

interface CourseEditorProps {
  course: CourseDB;
}

// Example course data for editing (will be replaced with API fetch in a real app)
const exampleCourse: CourseDB = {
  id: "workplace-narcissism",
  courseTopic: "Understanding Workplace Narcissism",
  isPublic: true,
  loading: false,
  published: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  units: [
    {
      id: "unit-1",
      title: "What is Narcissism?",
      chapters: [
        {
          id: "chapter-1-1",
          title: "Defining Narcissism",
        },
        {
          id: "chapter-1-2",
          title: "Symptoms and Diagnosis of Narcissism",
        },
        {
          id: "chapter-1-3",
          title: "Different Levels of Narcissism",
        },
      ],
    },
    {
      id: "unit-2",
      title: "The Impact of Narcissistic Behavior",
      chapters: [
        {
          id: "chapter-2-1",
          title: "Impact on Relationships",
        },
        {
          id: "chapter-2-2",
          title: "Narcissism in the Workplace",
        },
        {
          id: "chapter-2-3",
          title: "Psychological Effects of Narcissistic Abuse",
        },
      ],
    },
  ],
};

export function CourseEditor({ course: initialCourse }: CourseEditorProps) {
  const [course, setCourse] = useState<CourseDB>(initialCourse);

  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Alert dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

  // Initialize expanded units on load
  useEffect(() => {
    setExpandedUnits(initialCourse.units.map((unit) => unit.id));
  }, [initialCourse]);

  // Update course title
  const updateCourseTitle = (title: string) => {
    setCourse((prev) => ({ ...prev, courseTopic: title }));
    // In a real app, you would debounce this and save to API
    startTransition(() => {
      updateCourse(course.id, { courseTopic: title });
    });
  };

  // Update course privacy
  const updateCoursePrivacy = (isPublic: boolean) => {
    setCourse((prev) => ({ ...prev, isPublic }));
    // Save to API
    startTransition(() => {
      updateCourse(course.id, { isPublic });
    });
  };

  // Update unit title
  const updateUnitTitle = (unitId: string, title: string) => {
    setCourse((prev) => ({
      ...prev,
      units: prev.units.map((unit) =>
        unit.id === unitId ? { ...unit, title } : unit
      ),
    }));
  };

  // Update chapter title
  const updateChapterTitle = (
    unitId: string,
    chapterId: string | undefined,
    title: string
  ) => {
    if (!chapterId) return;

    setCourse((prev) => ({
      ...prev,
      units: prev.units.map((unit) =>
        unit.id === unitId
          ? {
              ...unit,
              chapters: unit.chapters.map((chapter) =>
                chapter.id === chapterId ? { ...chapter, title } : chapter
              ),
            }
          : unit
      ),
    }));
  };

  // Add a new unit
  const addUnit = () => {
    const newUnitId = `unit-${course.units.length + 1}`;
    const newUnit: Unit = {
      id: newUnitId,
      title: "",
      chapters: [{ id: `${newUnitId}-chapter-1`, title: "" }],
    };

    setCourse((prev) => ({
      ...prev,
      units: [...prev.units, newUnit],
    }));

    // Auto-expand the new unit
    setExpandedUnits((prev) => [...prev, newUnitId]);
  };

  // Add a new chapter to a unit
  const addChapter = (unitId: string) => {
    const newChapter = {
      id: `${unitId}-chapter-${course.units.find((u) => u.id === unitId)?.chapters.length || 0 + 1}`,
      title: "",
    };

    setCourse((prev) => ({
      ...prev,
      units: prev.units.map((unit) =>
        unit.id === unitId
          ? {
              ...unit,
              chapters: [...unit.chapters, newChapter],
            }
          : unit
      ),
    }));
  };

  // Handle unit delete with modifier key check
  const handleUnitDelete = (e: React.MouseEvent, unitId: string) => {
    e.stopPropagation();

    // Check if Shift or Ctrl key is pressed
    if (e.shiftKey || e.ctrlKey) {
      // Skip confirmation and delete directly
      removeUnit(unitId);
    } else {
      // Show confirmation dialog
      setUnitToDelete(unitId);
      setDeleteDialogOpen(true);
    }
  };

  // Remove a unit
  const removeUnit = (unitId: string) => {
    setCourse((prev) => ({
      ...prev,
      units: prev.units.filter((unit) => unit.id !== unitId),
    }));

    // Remove unit from expanded state
    setExpandedUnits((prev) => prev.filter((id) => id !== unitId));
  };

  // Confirm unit deletion
  const confirmUnitDelete = () => {
    if (unitToDelete) {
      removeUnit(unitToDelete);
      setUnitToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  // Cancel unit deletion
  const cancelUnitDelete = () => {
    setUnitToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Remove a chapter
  const removeChapter = (unitId: string, chapterId: string | undefined) => {
    if (!chapterId) return;

    setCourse((prev) => ({
      ...prev,
      units: prev.units.map((unit) =>
        unit.id === unitId
          ? {
              ...unit,
              chapters: unit.chapters.filter(
                (chapter) => chapter.id !== chapterId
              ),
            }
          : unit
      ),
    }));
  };

  // Handle accordion value change
  const handleAccordionChange = (value: string[]) => {
    setExpandedUnits(value);
  };

  // Handle "Generate Course" button click
  const handleGenerateCourse = async () => {
    setIsGenerating(true);

    try {
      // First, save the current course structure to Firestore
      const saveResult = await updateCourse(course.id, {
        units: course.units.map(unit => ({
          id: unit.id,
          title: unit.title,
          chapters: unit.chapters.map(chapter => ({
            id: chapter.id,
            title: chapter.title,
            status: "idle" // Ensure each chapter has a status
          }))
        }))
      });

      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save course structure");
      }

      // Set all chapters to loading state
      setCourse((prev) => ({
        ...prev,
        units: prev.units.map((unit) => ({
          ...unit,
          chapters: unit.chapters.map((chapter) => ({
            ...chapter,
            status: "loading",
          })),
        })),
      }));

      // Start generation after saving
      const result = await generateFullCourse(course.id);
      
      if (result.success) {
        // Redirect to course page after successful generation
        window.location.href = `/course/${course.id}`;
      } else {
        throw new Error(result.error || "Failed to generate course");
      }
    } catch (error) {
      console.error("Error during course generation:", error);
      // Show error to user
      alert(error instanceof Error ? error.message : "An error occurred during course generation");
    } finally {
      setIsGenerating(false);
    }
  };

  // Find unit title by ID
  const getUnitTitle = (unitId: string) => {
    const unit = course.units.find((u) => u.id === unitId);
    return unit?.title || `Unit ${unitId}`;
  };

  return (
    <div className="container mx-auto px-3 py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">
        {course.id === "new" ? "Create New Course" : "Edit Course"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left side - Units & Chapters */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Units & Chapters</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center gap-1"
              onClick={addUnit}
              disabled={isGenerating}
            >
              <PlusCircle size={14} /> Add Unit
            </Button>
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
                  <div className="pr-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive/80"
                      onClick={(e) => handleUnitDelete(e, unit.id)}
                      disabled={course.units.length <= 1 || isGenerating}
                      title="Delete Unit (Hold Shift or Ctrl to skip confirmation)"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <AccordionContent className="px-3 pt-2 pb-3">
                  <div className="space-y-3">
                    <Input
                      value={unit.title}
                      onChange={(e) => updateUnitTitle(unit.id, e.target.value)}
                      placeholder="Enter unit title"
                      className="w-full text-sm"
                      disabled={isGenerating}
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
                          <Input
                            value={chapter.title}
                            onChange={(e) =>
                              updateChapterTitle(
                                unit.id,
                                chapter.id,
                                e.target.value
                              )
                            }
                            placeholder={`Chapter ${chapterIndex + 1} title`}
                            className="flex-1 text-sm h-8 py-1"
                            disabled={isGenerating}
                          />

                          {isGenerating && (
                            <div className="w-7 h-7 flex items-center justify-center">
                              {chapter.status === "loading" && (
                                <Skeleton className="h-4 w-4 rounded-full" />
                              )}
                              {chapter.status === "success" && (
                                <Check size={14} className="text-green-500" />
                              )}
                              {chapter.status === "error" && (
                                <AlertCircle
                                  size={14}
                                  className="text-destructive"
                                />
                              )}
                            </div>
                          )}

                          {!isGenerating && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive/80"
                              onClick={() => removeChapter(unit.id, chapter.id)}
                              disabled={
                                unit.chapters.length <= 1 || isGenerating
                              }
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-1 flex items-center gap-1 justify-center text-xs h-7"
                        onClick={() => addChapter(unit.id)}
                        disabled={isGenerating}
                      >
                        <PlusCircle size={14} /> Add Chapter
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Right side - Course Information */}
        <div>
          <Card className="sticky top-34">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-lg">Course Information</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div>
                <label
                  htmlFor="course-title"
                  className="block text-sm font-medium mb-1"
                >
                  Course Title
                </label>
                <Input
                  id="course-title"
                  value={course.courseTopic}
                  onChange={(e) => updateCourseTitle(e.target.value)}
                  placeholder="Enter course title"
                  className="w-full"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Privacy
                </label>
                <div className="flex space-x-3">
                  <div
                    className={`flex-1 border rounded-md p-2 cursor-pointer flex items-center gap-2 ${
                      course.isPublic
                        ? "bg-primary/10 border-primary/30"
                        : "hover:bg-muted"
                    } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !isGenerating && updateCoursePrivacy(true)}
                  >
                    <Globe
                      size={16}
                      className={course.isPublic ? "text-primary" : ""}
                    />
                    <span className="text-sm">Public</span>
                  </div>
                  <div
                    className={`flex-1 border rounded-md p-2 cursor-pointer flex items-center gap-2 ${
                      !course.isPublic
                        ? "bg-primary/10 border-primary/30"
                        : "hover:bg-muted"
                    } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !isGenerating && updateCoursePrivacy(false)}
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
                onClick={handleGenerateCourse}
                disabled={
                  !course.courseTopic.trim() || isGenerating || isPending
                }
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Generating Course...
                  </>
                ) : (
                  "Generate Course"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Unit Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              {unitToDelete ? getUnitTitle(unitToDelete) : "this unit"}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelUnitDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnitDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
