"use client";

import {
  BookCopy,
  BookOpen,
  Clock,
  Eye,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseDB } from "@/app/lib/schemas";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GalleryContentProps {
  courses: CourseDB[] | null;
  error: string | null;
  success: boolean;
}

type SortOption = "newest" | "oldest";

// Define Fuse.js type interfaces
interface FuseResultMatch {
  indices: readonly [number, number][];
  key: string;
  refIndex: number;
  value: string;
}

interface FuseSearchResult {
  item: CourseDB;
  refIndex: number;
  score?: number;
  matches?: FuseResultMatch[];
}

export default function GalleryContent({
  courses,
  error,
  success,
}: GalleryContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<CourseDB[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [fuseSearchResults, setFuseSearchResults] = useState<
    FuseSearchResult[]
  >([]);

  useEffect(() => {
    if (courses) {
      if (searchQuery.trim() === "") {
        // When no search query, just sort the courses
        setFuseSearchResults([]);
        const sorted = [...courses].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOption === "newest" ? dateB - dateA : dateA - dateB;
        });
        setFilteredCourses(sorted);
      } else {
        // When searching, use Fuse.js with highlighting
        const fuseOptions = {
          keys: ["courseTopic", "description"],
          threshold: 0.4,
          includeScore: true,
          includeMatches: true,
        };

        const fuse = new Fuse(courses, fuseOptions);
        const results = fuse.search(searchQuery);

        // Store the Fuse results for highlighting - ensure it matches our interface
        setFuseSearchResults(results as unknown as FuseSearchResult[]);

        // Sort the search results by date
        const sorted = results
          .map((result) => result.item)
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOption === "newest" ? dateB - dateA : dateA - dateB;
          });

        setFilteredCourses(sorted);
      }
    }
  }, [searchQuery, courses, sortOption]);

  // Function to highlight matched text
  const getHighlightedText = (
    text: string,
    matches: readonly FuseResultMatch[]
  ) => {
    if (!text || !matches || matches.length === 0) return text;

    // Find matches for this specific text field
    const relevantMatches = matches.filter((match) => {
      // Check if the last key in the path matches our field
      const lastKey = match.key.split(".").pop();
      return lastKey === "courseTopic" || lastKey === "description";
    });

    if (relevantMatches.length === 0) return text;

    // Get indices from the first relevant match
    const match = relevantMatches[0];
    if (!match.indices || match.indices.length === 0) return text;

    let highlighted = "";
    let lastIndex = 0;

    // Sort indices to ensure proper order
    const sortedIndices = [...match.indices].sort((a, b) => a[0] - b[0]);

    sortedIndices.forEach(([start, end]) => {
      // Add text before match
      highlighted += text.substring(lastIndex, start);
      // Add highlighted match
      highlighted += `<mark class="bg-blue-200 dark:bg-blue-200 px-0.5 rounded">${text.substring(
        start,
        end + 1
      )}</mark>`;
      lastIndex = end + 1;
    });

    // Add remaining text after last match
    highlighted += text.substring(lastIndex);

    return highlighted;
  };

  if (!success || !courses) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-4">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-64 mb-6" />

          {/* Search and filter skeleton on the same row */}
          <div className="flex w-full max-w-4xl gap-4 justify-center items-center mb-6">
            <div className="flex-1 max-w-3xl">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="w-48">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-4">
        <BookCopy className="h-12 w-12 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Course Gallery</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Explore courses created by the Coursify community
        </p>

        {/* Search and filter on the same row */}
        <div className="flex w-full max-w-4xl gap-4 justify-center items-center mb-8">
          <div className="relative flex flex-col md:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <Select
              value={sortOption}
              onValueChange={(value: string) =>
                setSortOption(value as SortOption)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center">
                    <SortDesc className="mr-2 h-4 w-4" />
                    <span>Newest first</span>
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center">
                    <SortAsc className="mr-2 h-4 w-4" />
                    <span>Oldest first</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No courses found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            // Find the search result for this course to get highlight info
            const searchResult = fuseSearchResults.find(
              (result) => result.item.id === course.id
            );
            const matches = searchResult?.matches || [];

            return (
              <Link key={course.id} href={`/course/${course.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl pt-4">
                      {searchQuery.trim() !== "" ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: getHighlightedText(
                              course.courseTopic,
                              matches
                            ),
                          }}
                        />
                      ) : (
                        course.courseTopic
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {course.units.length} units •{" "}
                      {course.units.reduce(
                        (acc, unit) => acc + unit.chapters.length,
                        0
                      )}{" "}
                      chapters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {searchQuery.trim() !== "" && course.description ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: getHighlightedText(
                              course.description,
                              matches
                            ),
                          }}
                        />
                      ) : (
                        course.description || "No description available"
                      )}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pb-4">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(course.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                      {course.viewCount && (
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {course.viewCount.total} view
                          {course.viewCount.total !== 1 && "s"}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
