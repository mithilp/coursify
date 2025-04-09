"use client"

import { BookOpen, Clock, Globe, Lock, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/app/utils/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CourseCardProps {
  course: {
    id: string;
    courseTopic: string;
    description?: string;
    units?: any[];
    createdAt: string;
    isPublic: boolean;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const [isPublic, setIsPublic] = useState(course.isPublic);
  const router = useRouter();

  const handlePrivacyChange = async (checked: boolean) => {
    try {
      const courseRef = doc(db, "courses", course.id);
      await updateDoc(courseRef, {
        isPublic: checked,
        updatedAt: new Date().toISOString()
      });
      setIsPublic(checked);
      router.refresh();
    } catch (error) {
      console.error("Error updating course privacy:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        console.log("Deleting course:", course.id);
        const courseRef = doc(db, "courses", course.id);
        console.log("Deleting course:", courseRef);
        await deleteDoc(courseRef);
        router.refresh();
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl pt-4">{course.courseTopic}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {course.units?.length || 0} units • {course.units?.reduce((acc: number, unit: any) => acc + (unit.chapters?.length || 0), 0) || 0} chapters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {course.description || "No description available"}
        </p>
        <div className="flex items-center text-xs text-muted-foreground pb-2">
          <Clock className="h-3 w-3 mr-1" />
          {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
        </div>
      </CardContent>
      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPublic ? (
            <>
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Public</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Private</span>
            </>
          )}
          <Switch 
            checked={isPublic} 
            onCheckedChange={handlePrivacyChange}
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
} 