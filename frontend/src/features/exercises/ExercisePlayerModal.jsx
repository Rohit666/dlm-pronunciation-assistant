import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { submitExercise } from "../../services/exerciseService";
import QUESTION_TYPES from "../../constants/exerciseQuestionTypes";

// ---------------------------------------------------------------------
// Per-type answer inputs. Each renders from `question.content_payload`
// and reports back through onChange(studentAnswer) — the exact shape
// backend/services/exerciseEvaluationService.js expects per type (see
// its header comment for the full contract).
// ---------------------------------------------------------------------

function ChoiceQuestion({ question, value, onChange }) {
  const options = question.content_payload?.options || [];
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
            name={`question-${question.id}`}
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

function FillBlankQuestion({ question, value, onChange }) {
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

// Click-to-order chips (spec: "drag-and-drop or click-to-order" — click-
// to-order chosen for simplicity/offline-robustness, no extra dnd
// wiring). Click an available token to append it to the built order;
// click a built-order chip to remove it and everything after it (keeps
// the array always contiguous, no gaps to reason about).
function SentenceFormationQuestion({ question, value, onChange }) {
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

function OpenResponseQuestion({ question, value, onChange }) {
  return (
    <div>
      {question.content_payload?.passage && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 leading-6">
          {question.content_payload.passage}
        </div>
      )}
      <textarea
        rows={5}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your response..."
        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function QuestionInput({ question, value, onChange }) {
  switch (question.question_type) {
    case QUESTION_TYPES.MCQ:
    case QUESTION_TYPES.TRUE_FALSE:
      return <ChoiceQuestion question={question} value={value} onChange={onChange} />;
    case QUESTION_TYPES.FILL_BLANK:
      return <FillBlankQuestion question={question} value={value} onChange={onChange} />;
    case QUESTION_TYPES.SENTENCE_FORMATION:
      return <SentenceFormationQuestion question={question} value={value} onChange={onChange} />;
    case QUESTION_TYPES.COMPREHENSION:
    case QUESTION_TYPES.PARAGRAPH:
      return <OpenResponseQuestion question={question} value={value} onChange={onChange} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------
// Answer sheet — post-submission review. `entry` is one item from the
// submit response's answerSheet (already carries gradingRubric/
// contentPayload since the attempt is graded, per exerciseController's
// "strip only pre-submission" rule).
// ---------------------------------------------------------------------

function answerSheetDisplay(entry) {
  if (entry.questionType === QUESTION_TYPES.SENTENCE_FORMATION) {
    const tokenById = new Map(
      (entry.contentPayload?.tokens || []).map((t) => [String(t.id), t.text]),
    );
    const words = (entry.studentAnswer || []).map((id) => tokenById.get(String(id)) || "?");
    return words.length ? words.join(" ") : "(no answer)";
  }
  if (Array.isArray(entry.studentAnswer)) return entry.studentAnswer.join(", ");
  if (entry.questionType === QUESTION_TYPES.MCQ || entry.questionType === QUESTION_TYPES.TRUE_FALSE) {
    const option = (entry.contentPayload?.options || []).find(
      (o) => String(o.id) === String(entry.studentAnswer),
    );
    return option ? option.label : entry.studentAnswer || "(no answer)";
  }
  return entry.studentAnswer || "(no answer)";
}

function AnswerSheetRow({ entry, index }) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        entry.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {entry.isCorrect ? (
          <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
        ) : (
          <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-500 mb-1">Question {index + 1}</p>
          <div
            className="text-gray-800 mb-2"
            dangerouslySetInnerHTML={{ __html: entry.prompt }}
          />
          <p className="text-sm text-gray-700">
            <span className="font-medium">Your answer: </span>
            {answerSheetDisplay(entry)}
          </p>
          {entry.feedback && (
            <p className="text-sm text-gray-500 mt-1">{entry.feedback}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {entry.scoreAwarded} / {entry.points} point{entry.points === 1 ? "" : "s"} awarded
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ result, onRetake, onClose }) {
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const { attempt, answerSheet } = result;

  return (
    <div>
      <div
        className={`rounded-2xl p-6 text-center mb-6 ${
          attempt.passed ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
        }`}
      >
        <p className={`text-4xl font-bold ${attempt.passed ? "text-green-700" : "text-amber-700"}`}>
          {attempt.percentage}%
        </p>
        <p className={`mt-2 font-semibold ${attempt.passed ? "text-green-700" : "text-amber-700"}`}>
          {attempt.passed ? "Passed" : "Not Passed Yet"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {attempt.totalScore} / {attempt.maxScore} points · Attempt #{attempt.attemptNumber} ·
          Passing score {attempt.passingPercentage}%
        </p>
      </div>

      <button
        type="button"
        onClick={() => setSheetExpanded((prev) => !prev)}
        className="flex items-center gap-2 font-semibold text-gray-700 mb-4 cursor-pointer"
      >
        {sheetExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        Answer Sheet
      </button>

      {sheetExpanded && (
        <div className="space-y-3 mb-6">
          {answerSheet.map((entry, index) => (
            <AnswerSheetRow key={entry.questionId} entry={entry} index={index} />
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 border rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
        >
          Retake Exercise
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Main player
// ---------------------------------------------------------------------

function ExercisePlayerModal({ exercise, onClose }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!exercise) return null;

  const questions = exercise.questions || [];

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{exercise.title}</h2>
            {exercise.instructions && (
              <p
                className="text-sm text-gray-500 mt-1"
                dangerouslySetInnerHTML={{ __html: exercise.instructions }}
              />
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {result ? (
            <ResultScreen result={result} onRetake={handleRetake} onClose={onClose} />
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-2xl p-5">
                  <p className="text-sm font-semibold text-gray-400 mb-2">
                    Question {index + 1} · {question.points} point
                    {question.points === 1 ? "" : "s"}
                  </p>
                  <div
                    className="text-gray-800 font-medium mb-4"
                    dangerouslySetInnerHTML={{ __html: question.prompt }}
                  />
                  <QuestionInput
                    question={question}
                    value={answers[question.id]}
                    onChange={(value) => setAnswer(question.id, value)}
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || questions.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Exercise"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExercisePlayerModal;
