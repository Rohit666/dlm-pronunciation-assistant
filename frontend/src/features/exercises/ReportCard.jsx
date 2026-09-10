import { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import QUESTION_TYPES from "../../constants/exerciseQuestionTypes";

// ---------------------------------------------------------------------
// Shared Diagnostic Report Card — extracted out of AssessmentPlayerPage
// (Comprehensive Assessment History Hubs) so a mentee reviewing a past
// attempt and a mentor auditing a mentee's submission see the exact same
// rendering AssessmentPlayerPage shows right after a live submit, not a
// second hand-rolled copy that can drift out of sync. Takes the same
// {attempt, answerSheet} shape submitExerciseAttempt returns live, and
// exerciseEvaluationService.buildAttemptAnswerSheet reconstructs for a
// stored attempt — see that function's comment for what is frozen at
// submit time vs recomputed for a historical view.
// ---------------------------------------------------------------------

// Defensive normalizer — the real fix for JSON columns arriving as
// unparsed strings is the Sequelize getters on ExerciseQuestion/
// ExerciseAttemptAnswer (MariaDB's JSON type is LONGTEXT under the hood,
// so mysql2 never auto-parses it there). Belt-and-suspenders on top of
// that for contentPayload/gradingRubric/studentAnswer, wherever they
// enter this file.
export function safeParse(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// Resolves a raw stored answer (an option id, a token-id array, a
// comma-joined multi-blank string) into what a mentee would recognize
// as their own answer. Shared by the top-level answer sheet and
// comprehension's per-sub-question breakdown — same {questionType,
// contentPayload, studentAnswer} shape either way.
export function formatAnswerValue(questionType, contentPayload, rawValue) {
  const payload = safeParse(contentPayload, {}) || {};
  const value = safeParse(rawValue, rawValue);

  if (value === null || value === undefined || value === "") return "(no answer)";

  if (questionType === QUESTION_TYPES.MCQ || questionType === QUESTION_TYPES.TRUE_FALSE) {
    const option = (payload.options || []).find((o) => String(o.id) === String(value));
    return option ? option.label : String(value);
  }

  if (questionType === QUESTION_TYPES.SENTENCE_FORMATION) {
    const tokenIds = Array.isArray(value) ? value : safeParse(value, []) || [];
    const tokenMap = new Map((payload.tokens || []).map((t) => [String(t.id), t.text]));
    const words = tokenIds.map((id) => tokenMap.get(String(id)) || "?");
    return words.length ? words.join(" ") : "(no answer)";
  }

  if (questionType === QUESTION_TYPES.FILL_BLANK) {
    // Multi-blank answers are stored comma-joined ("is,Now") — render
    // as clean, spaced-out text rather than the raw joined string.
    return typeof value === "string" ? value.split(",").map((v) => v.trim()).join(", ") : String(value);
  }

  return typeof value === "string" ? value : JSON.stringify(value);
}

// The answer key each sub-question's grade is measured against, same
// resolution rules as formatAnswerValue.
export function formatExpectedAnswer(questionType, contentPayload, gradingRubric) {
  const payload = safeParse(contentPayload, {}) || {};
  const rubric = safeParse(gradingRubric, {}) || {};

  if (questionType === QUESTION_TYPES.MCQ || questionType === QUESTION_TYPES.TRUE_FALSE) {
    const option = (payload.options || []).find(
      (o) => String(o.id) === String(rubric.correct_option_id),
    );
    return option ? option.label : rubric.correct_option_id || "—";
  }

  if (questionType === QUESTION_TYPES.FILL_BLANK) {
    return (rubric.acceptable_answers || []).join(" / ") || "—";
  }

  if (questionType === QUESTION_TYPES.SENTENCE_FORMATION) {
    const tokenMap = new Map((payload.tokens || []).map((t) => [String(t.id), t.text]));
    const expected = rubric.expected_order || [];
    return expected.map((id) => tokenMap.get(String(id)) || "?").join(" ") || "—";
  }

  return rubric.explanation || "—";
}

function answerSheetDisplay(entry) {
  return formatAnswerValue(entry.questionType, entry.contentPayload, entry.studentAnswer);
}

function ComprehensionAnswerSheet({ entry }) {
  return (
    <div className="space-y-2 mt-3">
      {(entry.subResults || []).map((sub, index) => (
        <div
          key={sub.id}
          className={`rounded-lg p-3 border text-sm ${
            sub.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-2">
            {sub.isCorrect ? (
              <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-medium text-gray-700">Sub-question {index + 1}</p>
              <div
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: sub.prompt || "" }}
              />
              <p className="text-gray-600">
                <span className="font-medium">Answer: </span>
                {formatAnswerValue(sub.questionType, sub.contentPayload, sub.studentAnswer)}
              </p>
              {!sub.isCorrect && (
                <p className="text-gray-600">
                  <span className="font-medium">Expected: </span>
                  {formatExpectedAnswer(sub.questionType, sub.contentPayload, sub.gradingRubric)}
                </p>
              )}
              {sub.feedback && <p className="text-gray-500 mt-1">{sub.feedback}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {sub.scoreAwarded} / {sub.points} point{sub.points === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnswerSheetRow({ entry, index }) {
  const [expanded, setExpanded] = useState(false);
  const isComprehension = entry.questionType === QUESTION_TYPES.COMPREHENSION;

  return (
    <div
      className={`rounded-xl border ${
        entry.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer"
      >
        {entry.isCorrect ? (
          <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
        ) : (
          <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-500 mb-1">Question {index + 1}</p>
          {isComprehension ? (
            (() => {
              const payload = safeParse(entry.contentPayload, {}) || {};
              return payload.passage_html ? (
                <div className="border-l-4 border-indigo-300 bg-indigo-50/60 rounded-r-lg p-3 mb-2">
                  <p className="text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wide">
                    Reading Passage
                  </p>
                  <div
                    className="text-sm text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: payload.passage_html }}
                  />
                </div>
              ) : null;
            })()
          ) : (
            <div className="text-gray-800 mb-2" dangerouslySetInnerHTML={{ __html: entry.prompt }} />
          )}
          {!isComprehension && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Answer: </span>
              {answerSheetDisplay(entry)}
            </p>
          )}
          {entry.feedback && <p className="text-sm text-gray-500 mt-1">{entry.feedback}</p>}
          <p className="text-xs text-gray-400 mt-1">
            {entry.scoreAwarded} / {entry.points} point{entry.points === 1 ? "" : "s"} awarded
          </p>
        </div>
        {expanded ? <ChevronUp size={18} className="shrink-0" /> : <ChevronDown size={18} className="shrink-0" />}
      </button>
      {expanded && isComprehension && (
        <div className="px-4 pb-4">
          <ComprehensionAnswerSheet entry={entry} />
        </div>
      )}
    </div>
  );
}

// attempt: { id, attemptNumber, totalScore, maxScore, percentage, passed,
//   submittedAt, passingPercentage } — the same camelCase shape
// submitExerciseAttempt returns live; history endpoints normalize to
// this same shape so this component never needs two code paths.
// answerSheet: the array submitExerciseAttempt/buildAttemptAnswerSheet
// produce. actions: optional trailing buttons (Retake/Continue on the
// live player, nothing or a Close button on a historical view).
function ReportCard({ attempt, answerSheet, heading = "Diagnostic Report Card", actions }) {
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
          {attempt.totalScore} / {attempt.maxScore} points · Attempt #{attempt.attemptNumber} · Passing
          score {attempt.passingPercentage}%
        </p>
      </div>

      <h3 className="font-semibold text-gray-700 mb-4">{heading}</h3>
      <div className="space-y-3 mb-8">
        {(answerSheet || []).map((entry, index) => (
          <AnswerSheetRow key={entry.questionId} entry={entry} index={index} />
        ))}
      </div>

      {actions && <div className="flex flex-wrap justify-end gap-3">{actions}</div>}
    </div>
  );
}

export default ReportCard;
