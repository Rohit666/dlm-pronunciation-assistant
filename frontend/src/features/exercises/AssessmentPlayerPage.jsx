import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Loader from "../../components/Loader";
import ConfirmModal from "../../components/ConfirmModal";
import PrimaryButton from "../../components/common/PrimaryButton";
import { ROUTES } from "../../constants/routes";
import { getExercise, submitExercise } from "../../services/exerciseService";
import {
  getCourseStream,
  getCourseResume,
  updateCourseProgress,
} from "../../services/courseStreamService";
import QUESTION_TYPES from "../../constants/exerciseQuestionTypes";
import ReportCard from "./ReportCard";
import CourseCompletedScreen from "./CourseCompletedScreen";

// ---------------------------------------------------------------------
// Full-width assessment player. Replaces ExercisePlayerModal (deprecated
// — kept in the repo for now but no longer wired up; see
// ExerciseListSection.jsx, which now navigates here instead of opening
// it) with a dedicated, distraction-free route: a question navigation
// palette, a split-screen layout for comprehension (sticky passage +
// its sub-questions), a submit confirmation step, and a full-page
// diagnostic report card on completion.
// ---------------------------------------------------------------------

function ChoiceInput({ options, value, onChange, name }) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.id}
          className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
            value === option.id ? "border-indigo-500 bg-indigo-50" : "hover:bg-gray-50"
          }`}
        >
          <input
            type="radio"
            name={name}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
            className="accent-indigo-600"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function FillBlankInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer..."
      className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}

function SentenceFormationInput({ question, value, onChange }) {
  const tokens = question.content_payload?.tokens || [];
  const order = Array.isArray(value) ? value : [];
  const tokenById = new Map(tokens.map((token) => [String(token.id), token.text]));
  const usedIds = new Set(order.map(String));

  return (
    <div>
      <div className="min-h-[3rem] border-2 border-dashed rounded-xl p-3 flex flex-wrap gap-2 mb-3 bg-gray-50">
        {order.length === 0 && (
          <span className="text-sm text-gray-400">Click words below to build the sentence...</span>
        )}
        {order.map((tokenId, index) => (
          <button
            key={`${tokenId}-${index}`}
            type="button"
            onClick={() => onChange(order.slice(0, index))}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium cursor-pointer"
            title="Click to remove this word and everything after it"
          >
            {tokenById.get(String(tokenId)) || "?"}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {tokens
          .filter((token) => !usedIds.has(String(token.id)))
          .map((token) => (
            <button
              key={token.id}
              type="button"
              onClick={() => onChange([...order, token.id])}
              className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-100 text-sm font-medium cursor-pointer"
            >
              {token.text}
            </button>
          ))}
      </div>
    </div>
  );
}

function OpenResponseInput({ value, onChange }) {
  return (
    <textarea
      rows={6}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write your response..."
      className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}

// One sub-question's input, inside the comprehension split view. Only
// mcq/true_false/fill_blank — the three types gradeSubQuestion supports.
function SubQuestionInput({ subQuestion, value, onChange }) {
  switch (subQuestion.question_type) {
    case QUESTION_TYPES.MCQ:
    case QUESTION_TYPES.TRUE_FALSE:
      return (
        <ChoiceInput
          options={subQuestion.content_payload?.options || []}
          value={value}
          onChange={onChange}
          name={`sub-${subQuestion.id}`}
        />
      );
    case QUESTION_TYPES.FILL_BLANK:
      return <FillBlankInput value={value} onChange={onChange} />;
    default:
      return null;
  }
}

// Split-screen comprehension view — sticky passage on the left, its
// sub-questions on the right.
function ComprehensionSplitView({ question, subAnswers, onSubAnswer }) {
  const subQuestions = question.content_payload?.sub_questions || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:sticky lg:top-6 lg:self-start bg-gray-50 rounded-2xl p-6 border max-h-[70vh] overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          Reading Passage
        </p>
        <div
          className="text-gray-700 leading-7 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: question.content_payload?.passage_html || "" }}
        />
      </div>

      <div className="space-y-5">
        {subQuestions.map((sub, index) => (
          <div key={sub.id} className="border rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-400 mb-2">
              Question {index + 1} of {subQuestions.length} · {sub.points} point
              {sub.points === 1 ? "" : "s"}
            </p>
            <div
              className="text-gray-800 font-medium mb-4"
              dangerouslySetInnerHTML={{ __html: sub.prompt }}
            />
            <SubQuestionInput
              subQuestion={sub}
              value={subAnswers[sub.id]}
              onChange={(value) => onSubAnswer(sub.id, value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionInput({ question, value, onChange }) {
  switch (question.question_type) {
    case QUESTION_TYPES.MCQ:
    case QUESTION_TYPES.TRUE_FALSE:
      return (
        <ChoiceInput
          options={question.content_payload?.options || []}
          value={value}
          onChange={onChange}
          name={`question-${question.id}`}
        />
      );
    case QUESTION_TYPES.FILL_BLANK:
      return <FillBlankInput value={value} onChange={onChange} />;
    case QUESTION_TYPES.SENTENCE_FORMATION:
      return <SentenceFormationInput question={question} value={value} onChange={onChange} />;
    case QUESTION_TYPES.PARAGRAPH:
      return <OpenResponseInput value={value} onChange={onChange} />;
    default:
      return null;
  }
}

function isAnswered(question, answer) {
  if (question.question_type === QUESTION_TYPES.COMPREHENSION) {
    const subQuestions = question.content_payload?.sub_questions || [];
    const subAnswers = (answer && answer.sub_answers) || {};
    return subQuestions.length > 0 && subQuestions.every((sub) => subAnswers[sub.id] != null && subAnswers[sub.id] !== "");
  }
  if (Array.isArray(answer)) return answer.length > 0;
  return answer !== undefined && answer !== null && answer !== "";
}

function AssessmentPlayerPage() {
  const { lessonId, exerciseId } = useParams();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [nextStreamItem, setNextStreamItem] = useState(null);
  // Set once the mentee finishes the FINAL stream item from inside this
  // player (this assessment had no next item) — swaps the ReportCard's
  // action row for the Course Completed screen below.
  const [courseFinished, setCourseFinished] = useState(false);
  const [courseStats, setCourseStats] = useState(null);
  const [finishingCourse, setFinishingCourse] = useState(false);

  useEffect(() => {
    // Deliverable #4: params.exerciseId changing (back-to-back exercises
    // in the same topic navigate here directly, this component never
    // unmounts) must fully flush the previous assessment's local state —
    // otherwise stale answers/currentIndex/result/report-card state from
    // Exercise 1 bleed into Exercise 2 for a frame, and a stale
    // nextStreamItem can point at the WRONG next step.
    setAnswers({});
    setCurrentIndex(0);
    setConfirmOpen(false);
    setSubmitting(false);
    setResult(null);
    setNextStreamItem(null);
    setCourseFinished(false);
    setCourseStats(null);

    (async () => {
      try {
        setLoading(true);
        const [exerciseData, stream] = await Promise.all([
          getExercise(exerciseId),
          getCourseStream(lessonId).catch(() => []),
        ]);
        setExercise(exerciseData);

        const position = (stream || []).findIndex(
          (entry) => entry.item_type === "assessment" && String(entry.id) === String(exerciseId),
        );
        if (position !== -1 && position < stream.length - 1) {
          setNextStreamItem(stream[position + 1]);
        }

        // Resume pointer — this course's "last opened" spot now points here.
        updateCourseProgress(lessonId, "assessment", exerciseId).catch(() => {});
      } catch (error) {
        console.error(error);
        toast.error("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, lessonId]);

  const questions = useMemo(() => exercise?.questions || [], [exercise]);
  const currentQuestion = questions[currentIndex];

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const setSubAnswer = (questionId, subId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        sub_answers: { ...(prev[questionId]?.sub_answers || {}), [subId]: value },
      },
    }));
  };

  const answeredCount = questions.filter((q) => isAnswered(q, answers[q.id])).length;

  const doSubmit = async () => {
    try {
      setSubmitting(true);
      setConfirmOpen(false);
      const payload = questions.map((question) => ({
        questionId: question.id,
        studentAnswer: answers[question.id] ?? null,
      }));
      const response = await submitExercise(exercise.id, payload);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit exercise");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
  };

  const goToNextStreamItem = () => {
    if (!nextStreamItem) {
      navigate(`${ROUTES.MENTEE_LESSONS}/${lessonId}`);
      return;
    }
    // Activity Provider Registry — the backend stream now carries a
    // `route` per step (activityRegistry[item_type].getRoute), so a
    // future activity type (toefl_ibt, ...) needs no change here. Falls
    // back to the item_type switch only for a stream response fetched
    // before this field existed (a stale cached response, not expected
    // in normal use).
    if (nextStreamItem.route) {
      navigate(nextStreamItem.route);
      return;
    }
    if (nextStreamItem.item_type === "assessment") {
      navigate(`${ROUTES.MENTEE_PRACTICE}/${lessonId}/assessment/${nextStreamItem.id}`);
    } else {
      // Content items are consumed one lesson-wide attempt at a time
      // (see the delivery notes on why per-sentence stream jumps aren't
      // wired yet) — send the mentee back to the lesson overview, where
      // Start/Resume Practice picks up the sentence flow.
      navigate(`${ROUTES.MENTEE_LESSONS}/${lessonId}`);
    }
  };

  // This assessment had no next stream item — re-resolve against the
  // server (rather than trusting the client-side "no next item" read
  // blindly) so the Course Completed stats are always the authoritative
  // getResumeItem numbers, and so a mentee who somehow still has an
  // incomplete step left (e.g. jumped here out of order) gets routed
  // back to it instead of a false completion screen.
  const handleFinishCourse = async () => {
    try {
      setFinishingCourse(true);
      const resume = await getCourseResume(lessonId);
      if (resume?.status === "completed") {
        setCourseStats(resume.stats || null);
        setCourseFinished(true);
      } else {
        toast.error("Another step is still incomplete — resuming there instead.");
        navigate(`${ROUTES.MENTEE_LESSONS}/${lessonId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load course completion status");
    } finally {
      setFinishingCourse(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader text="Loading assessment..." />
      </DashboardLayout>
    );
  }

  if (!exercise) {
    return (
      <DashboardLayout>
        <div className="text-center text-gray-400 py-20">Assessment not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`${ROUTES.MENTEE_LESSONS}/${lessonId}`)}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 border px-5 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Back to Lesson</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{exercise.title}</h1>
          {exercise.instructions && (
            <div
              className="text-sm text-gray-500 mt-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.instructions }}
            />
          )}

          {courseFinished ? (
            <div className="mt-8">
              <CourseCompletedScreen
                stats={courseStats}
                onBackToLessons={() => navigate(ROUTES.MENTEE_LESSONS)}
                onReviewCourse={() => navigate(`${ROUTES.MENTEE_LESSONS}/${lessonId}`)}
              />
            </div>
          ) : result ? (
            <div className="mt-8">
              <ReportCard
                attempt={result.attempt}
                answerSheet={result.answerSheet}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="px-6 py-3 border rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                    >
                      Retake Exercise
                    </button>
                    {nextStreamItem ? (
                      <PrimaryButton onClick={goToNextStreamItem}>
                        Next Activity
                        <ArrowRight size={16} className="inline ml-2" />
                      </PrimaryButton>
                    ) : (
                      <PrimaryButton onClick={handleFinishCourse} disabled={finishingCourse}>
                        {finishingCourse ? "Finishing..." : "Finish Course"}
                      </PrimaryButton>
                    )}
                  </>
                }
              />
            </div>
          ) : (
            <div className="mt-8">
              {/* Question navigation palette */}
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      index === currentIndex
                        ? "bg-indigo-600 text-white"
                        : isAnswered(question, answers[question.id])
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <span className="text-sm text-gray-400 ml-2">
                  {answeredCount} / {questions.length} answered
                </span>
              </div>

              {currentQuestion && (
                <div className="mb-8">
                  {currentQuestion.question_type === QUESTION_TYPES.COMPREHENSION ? (
                    <ComprehensionSplitView
                      question={currentQuestion}
                      subAnswers={answers[currentQuestion.id]?.sub_answers || {}}
                      onSubAnswer={(subId, value) => setSubAnswer(currentQuestion.id, subId, value)}
                    />
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-gray-400 mb-2">
                        Question {currentIndex + 1} · {currentQuestion.points} point
                        {currentQuestion.points === 1 ? "" : "s"}
                      </p>
                      <div
                        className="text-gray-800 font-medium mb-4 text-lg"
                        dangerouslySetInnerHTML={{ __html: currentQuestion.prompt }}
                      />
                      <QuestionInput
                        question={currentQuestion}
                        value={answers[currentQuestion.id]}
                        onChange={(value) => setAnswer(currentQuestion.id, value)}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  className="flex items-center gap-2 px-5 py-3 border rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <PrimaryButton
                    onClick={() => setConfirmOpen(true)}
                    disabled={submitting || questions.length === 0}
                  >
                    {submitting ? "Submitting..." : "Submit Assessment"}
                  </PrimaryButton>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Submit Assessment"
        message={
          answeredCount < questions.length
            ? `You've answered ${answeredCount} of ${questions.length} questions. Submit anyway?`
            : "You're about to submit this assessment. This creates a new attempt and cannot be undone."
        }
        onConfirm={doSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </DashboardLayout>
  );
}

export default AssessmentPlayerPage;
