import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import { getPracticeAttempt } from "../../services/practiceAttemptService";
import { ROUTES } from "../../constants/routes";

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
          <div className="text-7xl">🎉</div>

          <h1
            className="
              text-4xl
              font-bold
              mt-6
            "
          >
            Practice Completed
          </h1>

          <p
            className="
              text-gray-500
              mt-3
            "
          >
            Great work!
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

            <div>
              <strong>Status:</strong> Pending Mentor Review
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
