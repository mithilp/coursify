"use server";

import { cookies } from "next/headers";
import { db } from "@/app/utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { CourseDB, ViewCount } from "@/app/lib/schemas";
import { revalidatePath } from "next/cache";

// Generate a unique ID for the visitor if they don't have one
async function getOrCreateVisitorId() {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get("visitor_id");
  
  if (visitorId) {
    return visitorId.value;
  }
  
  // Create a new visitor ID
  const newVisitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  // Set the cookie
  cookieStore.set({
    name: "visitor_id",
    value: newVisitorId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
  
  return newVisitorId;
}

/**
 * Increment view count for a course
 * - Increments total view count
 * - Tracks unique visitors
 * - Updates last viewed timestamp
 */
export async function incrementCourseViewCount(courseId: string) {
  try {
    // Get visitor ID
    const visitorId = await getOrCreateVisitorId();
    
    // Get course data
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: "Course not found" };
    }
    
    const courseData = courseSnap.data() as CourseDB;
    
    // Get current view count or initialize if it doesn't exist
    const currentViewCount: ViewCount = courseData.viewCount || {
      total: 0,
      uniqueUsers: [],
      lastViewed: new Date().toISOString(),
    };
    
    // Check if this is a unique visitor
    const isNewVisitor = !currentViewCount.uniqueUsers.includes(visitorId);
    
    // Update view count
    const updatedViewCount: ViewCount = {
      total: currentViewCount.total + 1,
      uniqueUsers: isNewVisitor 
        ? [...currentViewCount.uniqueUsers, visitorId]
        : currentViewCount.uniqueUsers,
      lastViewed: new Date().toISOString(),
    };
    
    // Update the document
    await updateDoc(courseRef, {
      viewCount: updatedViewCount,
    });
    
    // Revalidate the course page
    revalidatePath(`/course/${courseId}`);
    
    return { 
      success: true, 
      viewCount: updatedViewCount.total,
      uniqueViews: updatedViewCount.uniqueUsers.length,
    };
  } catch (error) {
    console.error("Error updating view count:", error);
    return { success: false, error: (error as Error).message };
  }
} 