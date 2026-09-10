import { Trophy } from "lucide-react";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";

// ---------------------------------------------------------------------
// Course Completed Screen — shared "champion" view shown once the FINAL
// stream item (content or assessment, either kind) is completed. Shared
// between AssessmentPlayerPage (final item was an assessment) and
// PracticeCompletePage (final item was a content block) rather than two
// hand-rolled copies, same rationale as ReportCard being extracted out
// of AssessmentPlayerPage.
//
// stats: the getResumeItem "completed" stats object —
//   { totalContents, completedContents, totalAssessments,
//     assessmentsTaken, overallAverageScore }
// overallAverageScore may be null (no scorable outcome yet) — rendered
// as "—" rather than "null%"/"0%".
// ---------------------------------------------------------------------
function StatCard({ label, value }) {
  return (
    <div className="border rounded-2xl p-4 text-center">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function CourseCompletedScreen({ stats, onBackToLessons, onReviewCourse }) {
  const overallAverageScore =
    stats?.overallAverageScore !== null && stats?.overallAverageScore !== undefined
      ? `${stats.overallAverageScore}%`
      : "—";

  return (
    <div className="max-w-3xl mx-auto text-center py-6">
      <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
        <Trophy size={40} />
      </div>

      <h1 className="text-4xl font-bold mt-6">Course Complete!</h1>
      <p className="text-gray-500 mt-3">
        Every content block and assessment in this course is done. Great work.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        <StatCard
          label="Contents Completed"
          value={`${stats?.completedContents ?? 0} / ${stats?.totalContents ?? 0}`}
        />
        <StatCard
          label="Assessments Taken"
          value={`${stats?.assessmentsTaken ?? 0} / ${stats?.totalAssessments ?? 0}`}
        />
        <StatCard label="Overall Average Score" value={overallAverageScore} />
      </div>

      <div className="flex justify-center gap-4 mt-10">
        <SecondaryButton onClick={onBackToLessons}>Back to Lessons</SecondaryButton>
        <PrimaryButton onClick={onReviewCourse}>Review Course</PrimaryButton>
      </div>
    </div>
  );
}

export default CourseCompletedScreen;
