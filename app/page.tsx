import { auth } from "@clerk/nextjs/server";
import { BookOpen, PlusCircle } from "lucide-react";
import CourseCreator from "./components/CourseCreator";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex flex-col items-center text-center mb-10">
        <PlusCircle className="h-12 w-12 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Create New Course</h1>
        <p className="text-xl text-muted-foreground">
          Enter your course topic and units to get started
        </p>
      </div>

      <CourseCreator isSignedIn={isSignedIn} />
    </div>
  );
}
