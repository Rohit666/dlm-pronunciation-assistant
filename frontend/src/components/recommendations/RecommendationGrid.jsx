import RecommendationCard from "./RecommendationCard";

function RecommendationGrid({
  revisionLessons = [],
  nextLessons = [],
  onOpenLesson,
}) {
  const hasRevisionLessons = revisionLessons.length > 0;

  const hasNextLessons = nextLessons.length > 0;

  if (!hasRevisionLessons && !hasNextLessons) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-4">⭐ Your Next Steps</h2>

        <p className="text-gray-500 leading-7">
          Great job! We don't have any personalized lesson recommendations right
          now. Continue practicing and exploring new lessons.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {hasRevisionLessons && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🔄 Revision Lessons
            </h2>

            <p className="text-gray-500 mt-2">
              Strengthen previously practiced pronunciation outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {revisionLessons.map((lesson) => (
              <RecommendationCard
                key={lesson.lessonId}
                lesson={lesson}
                type="revision"
                onContinue={() => onOpenLesson(lesson.lessonId)}
              />
            ))}
          </div>
        </div>
      )}

      {hasNextLessons && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🚀 Next Lessons
            </h2>

            <p className="text-gray-500 mt-2">
              Continue improving with lessons selected for your pronunciation
              profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {nextLessons.map((lesson) => (
              <RecommendationCard
                key={lesson.lessonId}
                lesson={lesson}
                type="next"
                onContinue={() => onOpenLesson(lesson.lessonId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecommendationGrid;
