// Average retries needed per lesson to reach mastery (SRS 4.5
// "Attempt-to-Mastery Delta", aggregated per lesson for the mentor
// view). Single-hue sequential magnitude encoding, one series, thin
// bars, direct numeric label — no legend needed for one series.
function AttemptTrajectoryMetrics({ metrics }) {
  if (!metrics || metrics.length === 0) return null;

  const maxAttempts = Math.max(...metrics.map((m) => m.avgAttemptsToMastery));

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-1">
        Average Attempts to Mastery
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Retries needed per lesson to cross the 80% mastery threshold
      </p>

      <div className="space-y-4">
        {metrics.map((lesson) => (
          <div key={lesson.lessonId}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700 truncate pr-4">
                {lesson.title}
              </span>
              <span className="text-sm font-bold text-indigo-700 shrink-0">
                {lesson.avgAttemptsToMastery.toFixed(1)} attempts
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-700 ease-out"
                style={{
                  width: `${(lesson.avgAttemptsToMastery / maxAttempts) * 100}%`,
                }}
                role="progressbar"
                aria-valuenow={lesson.avgAttemptsToMastery}
                aria-valuemin={0}
                aria-valuemax={maxAttempts}
                aria-label={`${lesson.title} average attempts to mastery`}
              />
            </div>

            <p className="text-xs text-gray-400 mt-1">
              {lesson.studentsAtMastery} at mastery · {lesson.studentsInProgress} in progress
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttemptTrajectoryMetrics;
