"use client";

import { useState } from "react";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  generateChapters,
  saveCourseToFirebase,
} from "@/app/actions/courseActions";
import { CourseUnitInput } from "@/app/lib/schemas";
import { useRouter } from "next/navigation";

// Loading button that handles its own loading state
function SubmitButton({ isGenerating }: { isGenerating: boolean }) {
  return (
    <Button className="w-full" size="lg" type="submit" disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        "Let's Go!"
      )}
    </Button>
  );
}

interface CourseCreatorProps {
  isSignedIn: boolean;
}

export default function CourseCreator({ isSignedIn }: CourseCreatorProps) {
  const router = useRouter();
  const [courseTopic, setCourseTopic] = useState<string>("");
  const [courseUnits, setCourseUnits] = useState<CourseUnitInput[]>([
    { id: "1", title: "" },
    { id: "2", title: "" },
  ]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get placeholder text based on unit index
  const getPlaceholder = (index: number): string => {
    switch (index) {
      case 0:
        return "e.g., Axis Powers";
      case 1:
        return "e.g., Allied Powers";
      case 2:
        return "e.g., Major Battles";
      default:
        return "e.g., Unit Title";
    }
  };

  // Add a new course unit
  const addUnit = () => {
    const newUnit: CourseUnitInput = {
      id: `unit-${Date.now()}`,
      title: "",
    };
    setCourseUnits([...courseUnits, newUnit]);
  };

  // Remove a course unit
  const removeUnit = (id: string) => {
    setCourseUnits(courseUnits.filter((unit) => unit.id !== id));
  };

  // Handle unit title change
  const handleUnitChange = (id: string, value: string) => {
    setCourseUnits(
      courseUnits.map((unit) =>
        unit.id === id ? { ...unit, title: value } : unit
      )
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseTopic.trim()) {
      setError("Please enter a course topic.");
      return;
    }

    // Units are now optional - we don't validate that there must be at least one
    const validUnits = courseUnits.filter((unit) => unit.title.trim() !== "");

    setError(null);
    setIsGenerating(true);

    try {
      // Generate the course content
      const courseData = await generateChapters(courseTopic, courseUnits);

      // Save to Firebase
      const result = await saveCourseToFirebase(courseData);

      if (result.success) {
        // Redirect to the course editor page
        router.push(`/create/${result.courseId}`);
      } else {
        throw new Error(result.error || "Failed to save course");
      }
    } catch (err) {
      console.error("Error generating course:", err);
      setError(
        "An error occurred while generating your course. Please try again."
      );
      setIsGenerating(false);
    }
  };

  return (
    <Card className="py-4">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label
              htmlFor="course-topic"
              className="block text-sm font-medium mb-2"
            >
              What are you interested in learning?
            </label>
            <Input
              id="course-topic"
              placeholder="e.g., History of WWII"
              className="w-full"
              value={courseTopic}
              onChange={(e) => setCourseTopic(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Course Units <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={addUnit}
              >
                <PlusCircle className="h-4 w-4" /> Add Unit
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Adding units helps structure your course but is optional. If none are provided, we'll generate the structure for you.
            </p>

            <div className="space-y-3">
              {courseUnits.map((unit, index) => (
                <div key={unit.id} className="flex items-center gap-2">
                  <Input
                    placeholder={getPlaceholder(index)}
                    className="flex-1"
                    value={unit.title}
                    onChange={(e) => handleUnitChange(unit.id, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeUnit(unit.id)}
                    disabled={courseUnits.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}


            <SubmitButton isGenerating={isGenerating} />
        </form>
      </CardContent>
    </Card>
  );
}
