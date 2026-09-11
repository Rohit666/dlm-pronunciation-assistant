import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Loader from "../../components/Loader";
import { getCourseResume } from "../../services/courseStreamService";
import { ROUTES } from "../../constants/routes";
import CourseCompletedScreen from "../../features/exercises/CourseCompletedScreen";

// ---------------------------------------------------------------------
// Unified stream — this is now the FINAL-ACTIVITY landing spot ONLY,
// never an intermediate "Lesson Complete!" stop.
//
// PracticePlayerProvider.submitRecording already re-resolves against
// getResumeItem (via getCourseResume) the moment the mentee submits the
// last sentence of a content attempt, and routes straight to the next
// stream activity's own URL when one remains — this page is only ever
// reached when that resolution said `status: "completed"`, or as its
// own error fallback.
//
// So this page re-verifies the exact same way on mount rather than
// trusting it was routed here correctly: a stale bookmark, browser
// back/forward, or that error fallback could land a mentee here while
// the course genuinely still has steps left. In that case it forwards
// straight to `resume.item.route` (the same activityRegistry-resolved
// URL every other seam in this stream consumes) instead of showing any
// intermediate card — there is exactly one completion screen in this
// whole flow, and it lives here, gated purely on the stream's own
// `status: "completed"`, not on this one attempt's individual pass/fail
// (a content step counts as done per-sentence via `assessments.
// is_accepted`, independent of whether the whole attempt cleared the
// pass threshold — see courseStreamService.getResumeItem).
// ---------------------------------------------------------------------
function PracticeCompletePage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [stats, setStats] = useState(null);
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resume = await getCourseResume(lessonId);
        if (resume?.status === "completed") {
          setStats(resume.stats || null);
          setResolving(false);
          return;
        }
        if (resume?.item?.route) {
          navigate(resume.item.route, { replace: true });
          return;
        }
        // No resolvable target (e.g. an empty/deleted course) — the
        // lesson overview is the only safe place left to send them.
        navigate(`${ROUTES.MENTEE_LESSONS}/${lessonId}`, { replace: true });
      } catch (error) {
        console.error(error);
        navigate(`${ROUTES.MENTEE_LESSONS}/${lessonId}`, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (resolving) {
    return (
      <DashboardLayout>
        <Loader text="Checking your progress..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          <CourseCompletedScreen
            stats={stats}
            onBackToLessons={() => navigate(ROUTES.MENTEE_LESSONS)}
            onReviewCourse={() => navigate(`${ROUTES.MENTEE_PRACTICE}/${lessonId}`)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PracticeCompletePage;
