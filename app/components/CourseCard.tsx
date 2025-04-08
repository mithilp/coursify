"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { Eye, BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";

// Define prop types
type CourseCreator = {
  userId: string;
  name: string;
};

export type CourseCardProps = {
  id: string;
  title: string;
  shortDescription?: string;
  createdBy: CourseCreator;
  units: any[]; // We could define a more specific type if needed
  views?: number;
  className?: string;
};

export default function CourseCard({
  id,
  title,
  shortDescription,
  createdBy,
  units,
  views = 0,
  className,
}: CourseCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow h-[200px] flex flex-col",
        className
      )}
    >
      <CardContent className="p-5 pb-0 flex-grow">
        <Link href={`/course/${id}`} className="block h-full">
          <h2 className="font-bold text-xl mb-2 line-clamp-2">{title}</h2>
          {shortDescription && (
            <p className="text-muted-foreground mb-4 text-sm line-clamp-3">
              {shortDescription}
            </p>
          )}
        </Link>
      </CardContent>
      <CardFooter className="bg-muted/40 px-5 py-3 text-sm text-muted-foreground flex justify-between items-center mt-auto">
        <div className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          <span>
            {units.length} unit{units.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{views}</span>
          </div>
          <span>•</span>
          <Link
            href={`/user/${createdBy.userId}`}
            className="hover:text-primary transition-colors"
          >
            {createdBy.name}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
