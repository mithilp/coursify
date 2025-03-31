import { BookCopy } from "lucide-react";
import Link from "next/link";

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-10">
        <BookCopy className="h-12 w-12 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Course Gallery</h1>
        <p className="text-xl text-muted-foreground">
          Explore courses created by the Coursify community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/course/workplace-narcissism"
          className="border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="font-bold text-xl mb-2">
            Understanding Workplace Narcissism
          </h2>
          <p className="text-muted-foreground mb-4">
            Learn to identify and manage narcissistic behaviors in professional
            settings
          </p>
          <div className="text-sm text-muted-foreground">
            3 units • 10 chapters
          </div>
        </Link>

        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="font-bold text-xl mb-2">Introduction to Python</h2>
          <p className="text-muted-foreground mb-4">
            Learn Python programming from scratch
          </p>
          <div className="text-sm text-muted-foreground">
            5 units • Created by Demo User
          </div>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="font-bold text-xl mb-2">Calculus 101</h2>
          <p className="text-muted-foreground mb-4">
            Master the fundamentals of calculus
          </p>
          <div className="text-sm text-muted-foreground">
            4 units • Created by Demo User
          </div>
        </div>
      </div>
    </div>
  );
}
