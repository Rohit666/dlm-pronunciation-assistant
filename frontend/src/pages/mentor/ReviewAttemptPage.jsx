import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import { API_BASE_URL } from "../../constants/api";
import {
  getReviewAttemptDetails,
  saveAttemptReview,
} from "../../services/reviewServce";

function ReviewAttemptPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sentenceReviews, setSentenceReviews] = useState({});
  const [overallScore, setOverallScore] = useState("");
  const [overallFeedback, setOverallFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAttempt();
  }, []);
  useEffect(() => {
    const scores = Object.values(sentenceReviews)
      .map((review) => parseFloat(review.score))
      .filter((score) => !isNaN(score));

    if (scores.length === 0) return;

    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    setOverallScore(average.toFixed(2));
  }, [sentenceReviews]);
  const loadAttempt = async () => {
    try {
      const response = await getReviewAttemptDetails(attemptId);
      setAttempt(response.attempt);
      const reviewMap = {};
      response.attempt.PracticeSessions.forEach((session) => {
        reviewMap[session.id] = {
          score: session.score || "",
          feedback: session.feedback || "",
        };
      });
      setSentenceReviews(reviewMap);
      setOverallScore(response.attempt.overall_score || "");
      setOverallFeedback(response.attempt.overall_feedback || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const updateSentenceReview = (sessionId, field, value) => {
    setSentenceReviews((prev) => ({
      ...prev,

      [sessionId]: {
        ...prev[sessionId],

        [field]: value,
      },
    }));
  };
  const saveReview = async () => {
    try {
      setSaving(true);

      const payload = {
        sentenceReviews: Object.entries(sentenceReviews).map(
          ([sessionId, review]) => ({
            sessionId,
            score: review.score,
            feedback: review.feedback,
          }),
        ),
        overallScore,
        overallFeedback,
      };
      await saveAttemptReview(attemptId, payload);
      //await api.put(`/mentor-reviews/attempt/${attemptId}`, payload);
      toast.success("Review saved successfully");

      loadAttempt();
    } catch (error) {
      console.error(error);

      toast.error("Failed to save review");
    } finally {
      setSaving(false);
    }
  };
  return (
    <DashboardLayout>
      <PageHeader
        title="Review Attempt"
        description="Review submitted lesson attempt"
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
            <h2
              className="
      text-2xl
      font-bold
      mb-6
    "
            >
              Attempt Summary
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold">Mentee</p>

                <p>{attempt?.Mentee?.User?.name}</p>

                <p className="text-gray-500">{attempt?.Mentee?.User?.email}</p>
              </div>

              <div>
                <p className="font-semibold">Lesson</p>

                <p>{attempt?.Lesson?.title}</p>
              </div>
            </div>
          </div>
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
              <h3
                className="
    text-xl
    font-bold
    mb-4
  "
              >
                Sentence {index + 1}
              </h3>
              <p
                className="
    text-lg
    mb-6
  "
              >
                {session?.LessonSentence?.sentence_text}
              </p>
              <audio controls className="w-full">
                <source src={`${API_BASE_URL}/${session.recording_path}`} />
              </audio>
              <div className="mt-6">
                <label
                  className="
      block
      font-medium
      mb-2
    "
                >
                  Score
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={sentenceReviews[session.id]?.score || ""}
                  onChange={(e) =>
                    updateSentenceReview(session.id, "score", e.target.value)
                  }
                  className="
      w-full
      border
      rounded-xl
      px-4
      py-3
    "
                />
              </div>
              <div className="mt-4">
                <label
                  className="
      block
      font-medium
      mb-2
    "
                >
                  Feedback
                </label>

                <textarea
                  rows="4"
                  value={sentenceReviews[session.id]?.feedback || ""}
                  onChange={(e) =>
                    updateSentenceReview(session.id, "feedback", e.target.value)
                  }
                  className="
      w-full
      border
      rounded-xl
      px-4
      py-3
    "
                />
              </div>
            </div>
          ))}
          <div
            className="
    bg-white
    rounded-3xl
    shadow-sm
    p-8
  "
          >
            <h2
              className="
      text-2xl
      font-bold
      mb-6
    "
            >
              Overall Assessment
            </h2>
            <div className="mb-6">
              <label
                className="
      block
      mb-2
      font-medium
    "
              >
                Overall Score
              </label>

              <input
                type="number"
                step="0.01"
                value={overallScore}
                onChange={(e) => setOverallScore(e.target.value)}
                className="
      w-full
      border
      rounded-xl
      px-4
      py-3
    "
              />
            </div>
            <div>
              <label
                className="
      block
      mb-2
      font-medium
    "
              >
                Overall Feedback
              </label>

              <textarea
                rows="6"
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                className="
      w-full
      border
      rounded-xl
      px-4
      py-3
    "
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={saveReview}
              disabled={saving}
              className="
      bg-indigo-600
      text-white
      px-8
      py-3
      rounded-xl
      hover:bg-indigo-700
    "
            >
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ReviewAttemptPage;
