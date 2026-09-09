import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, ClipboardList } from "lucide-react";

const QUESTION_TYPE_LABELS = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
  sentence_formation: "Sentence Formation",
  comprehension: "Comprehension",
  paragraph: "Paragraph Writing",
};

// Mentor-facing exercise summary card. "View" is an inline expand —
// shows each question's type/points/prompt — rather than launching the
// mentee-facing ExercisePlayerModal, since that modal submits attempts
// and has no read-only mode. Delete just raises onDelete(exercise);
// the confirm step lives in the parent (mirrors sentence deletion's
// ConfirmModal pattern in the same page).
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
            <p className="font-semibold text-gray-800 truncate">{exercise.title}</p>
            <p className="text-sm text-gray-500">
              {questions.length} question{questions.length === 1 ? "" : "s"} · Pass at{" "}
              {exercise.passing_percentage}%
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
            const subQuestions = question.content_payload?.sub_questions || [];
            const totalPoints = isComprehension
              ? subQuestions.reduce((sum, sub) => sum + (Number(sub.points) || 1), 0)
              : question.points;

            return (
              <div key={question.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-lg">
                    Q{index + 1} · {QUESTION_TYPE_LABELS[question.question_type] || question.question_type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {totalPoints} point{totalPoints === 1 ? "" : "s"}
                  </span>
                </div>

                {isComprehension ? (
                  <div className="space-y-3">
                    {question.content_payload?.passage_html && (
                      <div
                        className="text-sm text-gray-700 prose prose-sm max-w-none bg-gray-50 rounded-lg p-3"
                        dangerouslySetInnerHTML={{ __html: question.content_payload.passage_html }}
                      />
                    )}
                    <div className="space-y-2">
                      {subQuestions.map((sub, subIndex) => (
                        <div key={sub.id} className="border border-gray-100 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-400 mb-1">
                            {subIndex + 1}. {QUESTION_TYPE_LABELS[sub.question_type] || sub.question_type} ·{" "}
                            {sub.points} point{sub.points === 1 ? "" : "s"}
                          </p>
                          <div
                            className="text-sm text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sub.prompt }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-sm text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: question.prompt }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExerciseCard;
