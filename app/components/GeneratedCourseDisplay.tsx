import { GeneratedCourse } from "@/app/lib/schemas";

interface GeneratedCourseDisplayProps {
  course: GeneratedCourse;
}

export default function GeneratedCourseDisplay({
  course,
}: GeneratedCourseDisplayProps) {
  if (!course) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">
        Generated Course: {course.courseTopic}
      </h2>
      <div className="space-y-6">
        {course.units.map((unit) => (
          <div key={unit.id} className="border rounded-md p-4">
            <h3 className="text-md font-medium mb-2">{unit.title}</h3>
            {unit.chapters && unit.chapters.length > 0 ? (
              <div className="space-y-3">
                {unit.chapters.map((chapter, idx) => (
                  <div key={idx} className="pl-5">
                    <h4 className="font-medium">{chapter.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {chapter.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No chapters generated.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
