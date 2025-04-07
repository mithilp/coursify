import { notFound } from "next/navigation";
import CourseCard from "../../components/CourseCard";

// Types
type CourseCreator = {
  userId: string;
  name: string;
};

type Course = {
  id: string;
  title: string;
  shortDescription?: string;
  createdBy: CourseCreator;
  units: any[];
  views?: number;
};

// Dummy data - in a real app, this would come from an API
const dummyUser = {
  userId: "sarah-johnson",
  name: "Dr. Sarah Johnson",
  bio: "Clinical psychologist specializing in workplace dynamics and personality disorders. Author of several books on workplace psychology.",
  courses: [
    {
      id: "workplace-narcissism",
      title: "Understanding Workplace Narcissism",
      shortDescription:
        "Learn to identify and manage narcissistic behaviors in professional settings",
      createdBy: {
        userId: "sarah-johnson",
        name: "Dr. Sarah Johnson",
      },
      units: [],
      views: 342,
    },
    {
      id: "toxic-workplace",
      title: "Managing Toxic Workplace Environments",
      shortDescription:
        "Strategies for identifying and addressing toxic workplace dynamics",
      createdBy: {
        userId: "sarah-johnson",
        name: "Dr. Sarah Johnson",
      },
      units: [],
      views: 215,
    },
  ],
};

interface UserProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  // In a real app, we would fetch this data from an API
  const user = dummyUser;

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* User Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <p className="text-muted-foreground">{user.bio}</p>
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Courses Created</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {user.courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                shortDescription={course.shortDescription}
                createdBy={course.createdBy}
                units={course.units}
                views={course.views}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
