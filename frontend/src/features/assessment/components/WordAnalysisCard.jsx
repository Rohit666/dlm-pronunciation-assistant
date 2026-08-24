import { CheckCircle2, AlertCircle } from "lucide-react";

import AssessmentCard from "../../../components/common/AssessmentCard";

const WordAnalysisCard = ({ analysis, selectedWord, onSelectWord }) => {
  return (
    <AssessmentCard className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Word Analysis
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Select a word to explore its pronunciation.
          </p>
        </div>

        <span
          className="
            hidden
            sm:inline-flex
            shrink-0
            rounded-full
            bg-gray-100
            px-3
            py-1.5
            text-xs
            font-semibold
            text-gray-500
          "
        >
          {analysis.length} words
        </span>
      </div>

      {/* Word Pills */}
      <div className="mt-6 flex flex-wrap gap-3">
        {analysis.map((word) => {
          const selected = selectedWord?.id === word.id;
          const correct = word.status === "correct";

          return (
            <button
              key={`${word.id}-${word.index}`}
              type="button"
              onClick={() => onSelectWord(word)}
              className={`
                inline-flex
                w-fit
                max-w-full
                items-center
                gap-2
                rounded-2xl
                border
                px-4
                py-3
                text-left
                transition-all
                duration-200

                ${
                  selected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md ring-1 ring-indigo-200"
                    : correct
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
                      : "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300"
                }
              `}
            >
              <span className="font-semibold truncate">{word.word}</span>

              <span
                className={`
                  text-xs
                  font-bold
                  shrink-0
                  ${
                    selected
                      ? "text-indigo-600"
                      : correct
                        ? "text-emerald-600"
                        : "text-orange-600"
                  }
                `}
              >
                {word.score}%
              </span>

              {correct ? (
                <CheckCircle2 size={17} className="shrink-0" />
              ) : (
                <AlertCircle size={17} className="shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Guidance */}
      <div
        className="
          mt-5
          rounded-2xl
          border
          border-indigo-100
          bg-indigo-50/60
          px-4
          py-3
        "
      >
        <p className="text-sm text-indigo-700">
          Select a word to open detailed pronunciation analysis.
        </p>
      </div>
    </AssessmentCard>
  );
};

export default WordAnalysisCard;
