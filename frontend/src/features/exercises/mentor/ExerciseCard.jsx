import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

const QUESTION_TYPE_LABELS = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
  sentence_formation: "Sentence Formation",
  comprehension: "Comprehension",
  paragraph: "Paragraph Writing",
};
const ensureJson = (val, fallback = {}) => {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};

// Bug 3 fix: this used to render only `prompt` — the mentor could never
// actually see what was saved as the answer key, which read as "nothing
// was persisted" even though it was. This renders the full answer key
// per question_type from content_payload/grading_rubric (never stripped
// for mentor/admin — see exerciseController.getLessonExercises). Shared
// by both top-level questions and comprehension's nested sub-questions,
// since both carry the same {question_type, content_payload,
// grading_rubric, points} shape.
function AnswerKey({ question }) {
  const rubric = ensureJson(question.grading_rubric) || {};
  const payload = ensureJson(question.content_payload) || {};

  switch (question.question_type) {
    case "mcq":
    case "true_false": {
      const options = payload.options || [];
      return (
        <div className="space-y-1.5 mt-2">
          {options.map((option) => {
            const isCorrect =
              String(option.id) === String(rubric.correct_option_id);
            return (
              <div
                key={option.id}
                className={`flex items-center gap-2 text-sm rounded-lg px-3 py-1.5 ${
                  isCorrect
                    ? "bg-green-50 text-green-800 font-medium"
                    : "text-gray-600"
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}
                {option.label}
              </div>
            );
          })}
          {rubric.explanation && (
            <p className="text-xs text-gray-400 mt-1">
              Explanation: {rubric.explanation}
            </p>
          )}
        </div>
      );
    }
    case "fill_blank": {
      const answers = rubric.acceptable_answers || [];
      return (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-400 mb-1">
            Accepted answers
          </p>
          <div className="flex flex-wrap gap-1.5">
            {answers.length ? (
              answers.map((answer, i) => (
                <span
                  key={`${answer}-${i}`}
                  className="text-xs font-medium bg-green-50 text-green-800 px-2 py-1 rounded-lg"
                >
                  {answer}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">
                No accepted answers saved.
              </span>
            )}
          </div>
        </div>
      );
    }
    case "sentence_formation": {
      const tokensById = new Map(
        (payload.tokens || []).map((t) => [String(t.id), t.text]),
      );
      const expectedOrder = rubric.expected_order || [];
      const sentence = expectedOrder
        .map((id) => tokensById.get(String(id)) || "?")
        .join(" ");
      return (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-400 mb-1">
            Correct order
          </p>
          <p className="text-sm font-medium bg-green-50 text-green-800 px-3 py-2 rounded-lg inline-block">
            {sentence || "(no answer saved)"}
          </p>
        </div>
      );
    }
    case "paragraph": {
      const keywords = rubric.keywords || [];
      return (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          {keywords.length > 0 && (
            <p>Expected keywords: {keywords.join(", ")}</p>
          )}
          {rubric.min_word_count > 0 && (
            <p>Minimum word count: {rubric.min_word_count}</p>
          )}
        </div>
      );
    }
    default:
      return null;
  }
}

// Mentor-facing exercise summary card. "View" is an inline expand —
// shows each question's full prompt + answer key — rather than
// launching the mentee-facing AssessmentPlayerPage, which submits real
// attempts and has no read-only mode.
function ExerciseCard({ exercise, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const questions = exercise.questions || [];

  return (
    <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <ClipboardList size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              {exercise.title}
            </p>
            <p className="text-sm text-gray-500">
              {questions.length} question{questions.length === 1 ? "" : "s"} ·
              Pass at {exercise.passing_percentage}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 border px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 cursor-pointer text-sm"
          >
            {expanded ? "Hide" : "View"}
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(exercise)}
            className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center cursor-pointer"
            aria-label="Delete exercise"
          >
            <Trash2 size={15} className="text-red-600" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 p-5 space-y-4">
          {exercise.instructions && (
            <div
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.instructions }}
            />
          )}

          {questions.length === 0 && (
            <p className="text-sm text-gray-400">No questions added.</p>
          )}

          {questions.map((question, index) => {
            const isComprehension = question.question_type === "comprehension";
            const contentPayload = ensureJson(question.content_payload) || {};
            const subQuestions = contentPayload?.sub_questions || [];
            // Comprehension's real max is the sum of its sub-questions'
            // points (see getQuestionMaxPoints in
            // exerciseEvaluationService.js) — fall back to the stored
            // `points` column only for legacy rows authored before the
            // composite refactor (no sub_questions saved), so this never
            // silently shows 0.
            const totalPoints = isComprehension
              ? subQuestions.length
                ? subQuestions.reduce(
                    (sum, sub) => sum + (Number(sub.points) || 1),
                    0,
                  )
                : question.points
              : question.points;

            return (
              <div
                key={question.id}
                className="border border-gray-200 rounded-xl p-4 bg-white"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-lg">
                    Q{index + 1} ·{" "}
                    {QUESTION_TYPE_LABELS[question.question_type] ||
                      question.question_type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {totalPoints} point{totalPoints === 1 ? "" : "s"}
                  </span>
                </div>

                {isComprehension ? (
                  <div className="space-y-3">
                    {payloadHasPassage(question) ? (
                      <div className="border-l-4 border-indigo-300 bg-indigo-50/60 rounded-r-lg p-3">
                        <p className="text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wide">
                          Reading Passage
                        </p>
                        <div
                          className="text-sm text-gray-700 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: contentPayload.passage_html,
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No passage saved.</p>
                    )}

                    {subQuestions.length === 0 && (
                      <p className="text-xs text-amber-600">
                        No sub-questions saved — this looks like a legacy
                        comprehension question authored before the composite
                        format. Re-author it in the builder.
                      </p>
                    )}

                    <div className="space-y-2">
                      {subQuestions.map((sub, subIndex) => (
                        <div
                          key={sub.id}
                          className="border border-gray-100 rounded-lg p-3"
                        >
                          <p className="text-xs font-semibold text-gray-400 mb-1">
                            {subIndex + 1}.{" "}
                            {QUESTION_TYPE_LABELS[sub.question_type] ||
                              sub.question_type}{" "}
                            · {sub.points} point{sub.points === 1 ? "" : "s"}
                          </p>
                          <div
                            className="text-sm text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sub.prompt }}
                          />
                          <AnswerKey question={sub} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      className="text-sm text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: question.prompt }}
                    />
                    <AnswerKey question={question} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function payloadHasPassage(question) {
  return Boolean(ensureJson(question.content_payload)?.passage_html);
}

export default ExerciseCard;
