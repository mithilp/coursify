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
      console.log("Starting privacy update for course:", course.id);
      
      // Verify Firebase is initialized
      if (!db) {
        console.error("Firebase not initialized");
        return;
      }

      // Create document reference
      const courseRef = doc(db, "courses", course.id);
      console.log("Document reference created:", courseRef.path);

      // Try to get the document first
      try {
        const courseDoc = await getDoc(courseRef);
        console.log("Document exists:", courseDoc.exists());
        if (courseDoc.exists()) {
          console.log("Current document data:", courseDoc.data());
        }
      } catch (getError) {
        console.error("Error getting document:", getError);
      }

      // Try to update the document
      try {
        console.log("Attempting to update document with:", { isPublic: checked });
        await updateDoc(courseRef, {
          isPublic: checked,
          updatedAt: new Date().toISOString()
        });
        console.log("Update successful");
        setIsPublic(checked);
        router.refresh();
      } catch (updateError) {
        console.error("Error updating document:", updateError);
        if (updateError instanceof Error) {
          console.error("Update error details:", {
            message: updateError.message,
            name: updateError.name,
            stack: updateError.stack
          });
        }
      }
    } catch (error) {
      console.error("General error in privacy update:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        console.log("Starting delete operation for course:", course.id);
        
        // Verify Firebase is initialized
        if (!db) {
          console.error("Firebase not initialized");
          return;
        }

        // Create document reference
        const courseRef = doc(db, "courses", course.id);
        console.log("Document reference created:", courseRef.path);

        // Try to delete
        try {
          await deleteDoc(courseRef);
          console.log("Delete successful");
          router.refresh();
        } catch (deleteError) {
          console.error("Error deleting document:", deleteError);
          if (deleteError instanceof Error) {
            console.error("Delete error details:", {
              message: deleteError.message,
              name: deleteError.name,
              stack: deleteError.stack
            });
          }
        }
      } catch (error) {
        console.error("General error in delete operation:", error);
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
      {/* <div className="p-4 border-t flex items-center justify-between">
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
      </div> */}
    </Card>
  );
} 