"use client";

import { useEffect } from "react";
import { incrementCourseViewCount } from "@/app/actions/viewCountActions";

interface ViewTrackerProps {
  courseId: string;
}

export default function ViewTracker({ courseId }: ViewTrackerProps) {
  useEffect(() => {
    // Trigger the view count increment when component mounts
    incrementCourseViewCount(courseId);
  }, [courseId]);

  // This component doesn't render anything
  return null;
} 