import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import { getAttemptResult } from "../../services/reviewServce";
import { API_BASE_URL } from "../../constants/api";
function PracticeResultPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    try {
      const response = await getAttemptResult(attemptId);

      setAttempt(response.attempt);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const getScoreColor = (score) => {
    if (score >= 90) {
      return "bg-green-100 text-green-700";
    }
    if (score >= 70) {
      return "bg-blue-100 text-blue-700";
    }
    if (score >= 50) {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-red-100 text-red-700";
  };
  return (
    <DashboardLayout>
      <PageHeader
        title="Practice Result"
        description="Review mentor feedback"
      />

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-8">
          <div
            className="
    bg-white
    rounded-3xl
    shadow-sm
    p-8
  "
          >
            <div
              className="
      flex
      flex-col
      md:flex-row
      justify-between
      gap-6
    "
            >
              <div>
                <h2
                  className="
          text-2xl
          font-bold
        "
                >
                  {attempt?.Lesson?.title}
                </h2>

                <p className="text-gray-500 mt-2">
                  Attempt #{attempt?.attempt_number}
                </p>
              </div>

              <div>
                <span
                  className={`
          px-4
          py-2
          rounded-xl
          font-semibold
          ${getScoreColor(attempt?.overall_score || 0)}
        `}
                >
                  {attempt?.overall_score || 0}%
                </span>
              </div>
            </div>
          </div>
          <div
            className="
    bg-white
    rounded-3xl
    shadow-sm
    p-8
  "
          >
            <h3
              className="
      text-xl
      font-bold
      mb-4
    "
            >
              Mentor Feedback
            </h3>

            <p
              className="
      text-gray-700
      leading-8
      whitespace-pre-wrap
    "
            >
              {attempt?.overall_feedback || "Awaiting mentor review"}
            </p>
          </div>
          <h2
            className="
    text-2xl
    font-bold
  "
          >
            Sentence Reviews
          </h2>
          {attempt?.PracticeSessions?.map((session, index) => (
            <div
              key={session.id}
              className="
    bg-white
    rounded-3xl
    shadow-sm
    p-8
  "
            >
              <div
                className="
    flex
    justify-between
    items-center
    mb-6
  "
              >
                <h3
                  className="
      text-lg
      font-bold
    "
                >
                  Sentence {index + 1}
                </h3>

                <span
                  className={`
      px-3
      py-1
      rounded-xl
      text-sm
      font-semibold
      ${getScoreColor(session.score || 0)}
    `}
                >
                  {session.score || 0}%
                </span>
              </div>
              <p
                className="
    text-lg
    leading-8
    mb-6
  "
              >
                {session?.LessonSentence?.sentence_text}
              </p>
              <audio key="{session.id}" controls className="w-full mb-6">
                <source src={`${API_BASE_URL}/${session.recording_path}`} />
              </audio>
              <div
                className="
    bg-gray-50
    rounded-2xl
    p-4
  "
              >
                <h4
                  className="
      font-semibold
      mb-2
    "
                >
                  Mentor Feedback
                </h4>

                <p
                  className="
      text-gray-700
      leading-7
    "
                >
                  {session.feedback || "Awaiting feedback"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default PracticeResultPage;
