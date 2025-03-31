"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseSidebar from "./CourseSidebar";
import InteractionsSidebar from "./InteractionsSidebar";
import ChapterContent from "./ChapterContent";

// Types for our dummy data
type Chapter = {
  id: string;
  title: string;
  videoUrl: string;
  summary: string;
};

type Unit = {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
};

type Course = {
  id: string;
  title: string;
  units: Unit[];
};

// Dummy data for our course
const dummyCourse: Course = {
  id: "workplace-narcissism",
  title: "Understanding Workplace Narcissism",
  units: [
    {
      id: "unit-1",
      title: "What is Narcissism?",
      description:
        "This unit introduces the concept of narcissism, covering its clinical definition, symptoms, diagnosis, and the spectrum of narcissistic traits. You'll learn to distinguish between healthy self-esteem and pathological narcissism, understand the key diagnostic criteria for Narcissistic Personality Disorder, and recognize different expressions of narcissistic behavior.",
      chapters: [
        {
          id: "defining-narcissism",
          title: "Defining Narcissism",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "Narcissism, in its clinical sense as Narcissistic Personality Disorder (NPD), is a personality disorder characterized by a pervasive pattern of grandiosity, a need for admiration, and a lack of empathy. Individuals with NPD exhibit an inflated sense of self-importance, believing they are superior to others and deserving of special treatment. They often exaggerate their achievements and talents, and expect to be recognized as superior without commensurate achievements. This grandiosity masks a fragile self-esteem, easily threatened by criticism or perceived slights. They may exploit others to achieve their own ends, lacking genuine empathy for their feelings. The diagnosis of NPD involves a comprehensive assessment by a mental health professional, considering various behavioral patterns and their impact on the individual's life and relationships. Important distinctions exist between normal narcissism (self-esteem) and the clinically diagnosed NPD, which represents a significant impairment in social and occupational functioning. Treatment options include psychotherapy, focusing on addressing underlying insecurities and maladaptive behaviors.",
        },
        {
          id: "symptoms-diagnosis",
          title: "Symptoms and Diagnosis of Narcissism",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "This chapter covers the key symptoms and diagnostic criteria for Narcissistic Personality Disorder. We explore the nine official diagnostic criteria from the DSM-5, including grandiose sense of self-importance, preoccupation with fantasies of success, belief in being 'special,' excessive admiration needs, sense of entitlement, interpersonal exploitation, lack of empathy, envy of others, and arrogant behaviors. The chapter explains how mental health professionals distinguish NPD from other conditions and personality traits, the challenges in diagnosis, and the importance of comprehensive psychological assessment.",
        },
        {
          id: "levels-narcissism",
          title: "Different Levels of Narcissism",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "This chapter explains the spectrum of narcissistic traits from healthy self-esteem to pathological narcissism. We examine the continuum of narcissistic expression, from normal self-confidence necessary for healthy functioning, through subclinical narcissistic traits, to full Narcissistic Personality Disorder. The chapter differentiates between grandiose and vulnerable narcissism, discusses cultural influences on narcissistic expression, and explains how narcissistic traits can fluctuate based on life circumstances and environmental factors.",
        },
      ],
    },
    {
      id: "unit-2",
      title: "The Impact of Narcissistic Behavior",
      description:
        "This unit examines how narcissistic behavior affects relationships, workplace dynamics, and the psychological wellbeing of those who interact with narcissistic individuals. You'll learn about the impact on personal and professional relationships, specific manifestations in workplace settings, and the psychological effects of prolonged exposure to narcissistic behaviors.",
      chapters: [
        {
          id: "impact-relationships",
          title: "Impact on Relationships",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "This chapter explores how narcissistic behavior affects personal and professional relationships. We examine typical relationship patterns involving narcissistic individuals, including initial idealization followed by devaluation, the cycle of narcissistic abuse, and the challenges in maintaining healthy boundaries. The chapter discusses specific effects on romantic partners, family members, friends, and colleagues, and identifies common emotional responses from those in relationship with narcissistic individuals.",
        },
        {
          id: "narcissism-workplace",
          title: "Narcissism in the Workplace",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "This chapter examines how narcissistic traits manifest in workplace settings and their effect on teams. We analyze typical behaviors of narcissistic colleagues, managers, and employees, including credit-taking, blame-shifting, competitive undermining, and resistance to feedback. The chapter discusses the impact on team cohesion, organizational culture, productivity, and employee wellbeing, as well as the particular challenges of managing, working with, or working for individuals with strong narcissistic traits.",
        },
        {
          id: "psychological-effects",
          title: "Psychological Effects of Narcissistic Abuse",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "This chapter details the psychological impact of being subjected to narcissistic abuse over time. We examine common emotional and psychological effects, including anxiety, depression, diminished self-esteem, confusion and self-doubt, hypervigilance, and symptoms of trauma. The chapter explains concepts like gaslighting, trauma bonding, and cognitive dissonance in the context of narcissistic relationships, and discusses the cumulative impact of narcissistic abuse on an individual's identity, worldview, and mental health.",
        },
      ],
    },
    {
      id: "unit-3",
      title: "Strategies for Managing Narcissistic Behaviors",
      description:
        "This unit provides practical approaches for dealing with narcissistic individuals in various contexts. You'll learn techniques for establishing and maintaining boundaries, effective communication strategies, methods to protect yourself from manipulation, and when and how to seek professional support when dealing with narcissistic behaviors.",
      chapters: [
        {
          id: "setting-boundaries",
          title: "Setting Boundaries",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "This chapter provides practical techniques for establishing and maintaining healthy boundaries with narcissistic individuals. We explore the importance of boundary-setting, common boundary violations by narcissistic individuals, and specific strategies for defining, communicating, and enforcing personal limits. The chapter offers techniques for managing emotional responses during boundary violations, language templates for assertive communication, and methods for maintaining consistency in boundary enforcement.",
        },
        {
          id: "communication-techniques",
          title: "Effective Communication Techniques",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "This chapter covers specific communication strategies to use when dealing with narcissistic behaviors. We examine techniques like the 'gray rock' method, strategic disengagement, managed emotional responses, and objective language patterns. The chapter provides guidance on framing conversations to minimize defensive reactions, using validation strategically, focusing on problem-solving rather than blame, and maintaining clarity and documentation in professional contexts.",
        },
        {
          id: "protecting-from-manipulation",
          title: "Protecting Yourself from Manipulation",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "This chapter offers methods to recognize and protect against common manipulation tactics. We identify typical manipulation strategies used by narcissistic individuals, including gaslighting, emotional blackmail, triangulation, and guilt induction. The chapter provides techniques for maintaining reality-testing, building a support network of objective observers, documenting interactions when necessary, and recognizing emotional triggers that increase vulnerability to manipulation.",
        },
        {
          id: "seeking-help",
          title: "Seeking Professional Help",
          videoUrl: "https://www.youtube.com/embed/wKXSK5jVPu0",
          summary:
            "This chapter discusses when and how to seek professional support when dealing with narcissistic individuals. We examine indicators that professional help may be needed, types of helpful therapeutic approaches for those affected by narcissistic relationships, considerations when selecting a therapist familiar with narcissistic abuse, and additional resources like support groups, books, and online communities. The chapter also offers guidance on self-care practices that complement professional support.",
        },
      ],
    },
  ],
};

// Dummy quizzes for each chapter
const dummyQuizzes = {
  "defining-narcissism": {
    title: "Knowledge Check",
    questions: [
      {
        question:
          "Which of the following is NOT a core characteristic of Narcissistic Personality Disorder (NPD)?",
        options: [
          "A pervasive pattern of grandiosity",
          "A lack of empathy",
          "Excessive humility and self-deprecation",
          "A need for admiration",
        ],
        correctAnswer: 2,
      },
    ],
  },
  "symptoms-diagnosis": {
    title: "Knowledge Check",
    questions: [
      {
        question:
          "Individuals with NPD often demonstrate a fragile self-esteem. How is this typically manifested?",
        options: [
          "Openly expressing their insecurities",
          "Seeking constant validation from others",
          "Showing empathy for others' vulnerabilities",
          "Demonstrating humility and self-awareness",
        ],
        correctAnswer: 1,
      },
    ],
  },
  "levels-narcissism": {
    title: "Knowledge Check",
    questions: [
      {
        question:
          "What is the key difference between normal narcissism and NPD?",
        options: [
          "There is no significant difference; they are essentially the same.",
          "Normal narcissism involves seeking admiration, while NPD does not.",
          "NPD involves significant impairment in social and occupational functioning.",
          "Normal narcissism is healthier; NPD is always harmful.",
        ],
        correctAnswer: 2,
      },
    ],
  },
};

interface CourseClientPageProps {
  courseId: string;
  unitParam?: string;
  chapterParam?: string;
}

export function CourseClientPage({
  courseId,
  unitParam,
  chapterParam,
}: CourseClientPageProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // In a real app, we would fetch this data from an API
  const course = dummyCourse;

  // If course not found, show 404
  if (!course) {
    notFound();
  }

  // Get the current unit and chapter from the provided params or use the first ones
  const currentUnitId = unitParam || course.units[0].id;
  const currentUnit =
    course.units.find((unit) => unit.id === currentUnitId) || course.units[0];

  const currentChapterId = chapterParam;
  const currentChapter = currentChapterId
    ? currentUnit.chapters.find((chapter) => chapter.id === currentChapterId)
    : undefined;

  // Toggle functions for mobile sidebars
  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleQuiz = () => setShowQuiz(!showQuiz);

  return (
    <div className="relative flex flex-col md:flex-row">
      {/* Mobile toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background border-b md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <span className="text-sm font-medium truncate mx-2">
          {currentChapter ? currentChapter.title : currentUnit.title}
        </span>
        {currentChapter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleQuiz}
            className="text-xs"
          >
            Quiz
          </Button>
        )}
      </div>

      {/* Left sidebar - hidden on mobile unless toggled */}
      <div
        className={`
          ${showSidebar ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 fixed inset-0 z-30 md:sticky md:top-16 md:z-0
          transition-transform duration-300 ease-in-out md:transition-none
          w-72 md:w-72 md:flex-shrink-0 bg-background md:bg-muted/20
          h-[calc(100vh-64px)]
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <span className="font-medium">Course Contents</span>
            <Button variant="ghost" size="sm" onClick={toggleSidebar}>
              Close
            </Button>
          </div>
          <div className="overflow-y-auto flex-1">
            <CourseSidebar
              course={course}
              currentUnitId={currentUnitId}
              currentChapterId={currentChapterId}
              onNavigate={() => setShowSidebar(false)}
            />
          </div>
        </div>
        {/* Backdrop for mobile */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-[-1] md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </div>

      {/* Main content area */}
      <main className="flex-1 w-full">
        <div className="px-4 py-6 md:py-8 max-w-4xl mx-auto">
          <ChapterContent
            course={course}
            currentUnit={currentUnit}
            currentChapter={currentChapter}
          />
        </div>
      </main>

      {/* Right sidebar with quiz - hidden on mobile unless toggled */}
      {currentChapter && (
        <div
          className={`
            ${showQuiz ? "translate-x-0" : "translate-x-full"} 
            md:translate-x-0 fixed inset-0 z-30 left-auto md:sticky md:top-16 md:z-0
            transition-transform duration-300 ease-in-out md:transition-none
            w-full max-w-md md:w-96 md:flex-shrink-0 bg-background md:bg-muted/20
            border-l border-border h-[calc(100vh-64px)]
          `}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b md:hidden">
              <span className="font-medium">Knowledge Check</span>
              <Button variant="ghost" size="sm" onClick={toggleQuiz}>
                Close
              </Button>
            </div>
            <div className="overflow-y-auto flex-1">
              <InteractionsSidebar
                quiz={
                  dummyQuizzes[currentChapterId as keyof typeof dummyQuizzes]
                }
              />
            </div>
          </div>
          {/* Backdrop for mobile */}
          {showQuiz && (
            <div
              className="fixed inset-0 bg-black/50 z-[-1] md:hidden"
              onClick={toggleQuiz}
            />
          )}
        </div>
      )}
    </div>
  );
}
