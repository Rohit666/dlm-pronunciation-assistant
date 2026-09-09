import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import { getPracticeAttempt } from "../../services/practiceAttemptService";
import { ROUTES } from "../../constants/routes";

// Self-paced (Requirement 1.1): completion no longer waits on mentor
// review. `attempt.status === "submitted"` means the computed
// overall_score already cleared the pass threshold and CEFR progress
// already advanced server-side — mentor review, if any, arrives later
// as optional formative feedback and is never what unblocks this
// screen.
const PASS_THRESHOLD = 70;

function PracticeCompletePage() {
  const navigate = useNavigate();
  const { lessonId, attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  useEffect(() => {
    loadAttempt();
  }, []);
  const loadAttempt = async () => {
    try {
      const response = await getPracticeAttempt(attemptId);

      setAttempt(response.attempt);
    } catch (error) {
      console.error(error);
    }
  };

  const passed = attempt?.status === "submitted";
  const score =
    attempt?.overall_score !== null && attempt?.overall_score !== undefined
      ? Number(attempt.overall_score)
      : null;

  return (
    <DashboardLayout>
      <div
        className="
          max-w-3xl
          mx-auto
          mt-10
        "
      >
        <div
          className="
            bg-white
            rounded-3xl
            shadow-sm
            p-12
            text-center
          "
        >
          <div className="text-7xl">{passed ? "🎉" : "💪"}</div>

          <h1
            className="
              text-4xl
              font-bold
              mt-6
            "
          >
            {passed ? "Lesson Complete!" : "Almost There"}
          </h1>

          <p
            className="
              text-gray-500
              mt-3
            "
          >
            {passed
              ? "Great work! Your progress has been saved automatically."
              : `Score below ${PASS_THRESHOLD}% — keep practicing this lesson to unlock the next level.`}
          </p>

          <div
            className="
              mt-10
              space-y-3
            "
          >
            <div>
              <strong>Lesson:</strong> {attempt?.Lesson?.title}
            </div>

            <div>
              <strong>Attempt:</strong> #{attempt?.attempt_number}
            </div>

            {score !== null && (
              <div>
                <strong>Overall Score:</strong> {score}%
              </div>
            )}

            <div>
              <strong>Status:</strong>{" "}
              {passed ? "Submitted — CEFR progress updated" : "In Progress"}
            </div>
          </div>

          <div
            className="
              flex
              justify-center
              gap-4
              mt-10
            "
          >
            <SecondaryButton onClick={() => navigate(ROUTES.MENTEE_LESSONS)}>
              Back To Lessons
            </SecondaryButton>

            <PrimaryButton
              onClick={() => navigate(`${ROUTES.MENTEE_PRACTICE}/${lessonId}`)}
            >
              Practice Again
            </PrimaryButton>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
export default PracticeCompletePage;
