import { useEffect, useState } from "react";

import AccuracyBar from "./AccuracyBar";
import IssueCard from "./IssueCard";
import RecommendationCard from "./RecommendationCard";
import PhonemeComparison from "./PhonemeComparison";

const WordAnalysisDetails = ({ word, selectedPhoneme, onSelectPhoneme }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);

    const timer = setTimeout(() => {
      setVisible(true);
    }, 120);

    return () => clearTimeout(timer);
  }, [word]);

  if (!word) {
    return null;
  }

  return (
    <div
      className={`
        transition-all
        duration-500
        ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {/* Expected / Detected */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs text-gray-500">Expected</p>

          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {word.expected}
          </p>
        </div>

        <div
          className={`
            rounded-2xl
            border
            p-4
            ${
              word.status === "correct"
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }
          `}
        >
          <p className="text-xs text-gray-500">Detected</p>

          <p
            className={`
              mt-2
              text-2xl
              font-bold
              ${word.status === "correct" ? "text-emerald-700" : "text-red-600"}
            `}
          >
            {word.detectedLabel}
          </p>
        </div>
      </div>

      {/* Accuracy */}
      <div className="mt-6">
        <AccuracyBar score={word.score} />
      </div>

      {/* Phoneme Comparison */}
      <div className="mt-6">
        <PhonemeComparison
          comparison={word.phonemeComparison}
          selectedPhoneme={selectedPhoneme}
          onSelectPhoneme={onSelectPhoneme}
        />
      </div>

      {/* Feedback */}
      {word.status === "correct" ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-lg font-bold text-emerald-700">Excellent!</h3>

          <p className="mt-2 text-sm text-gray-700 leading-6">
            This word was pronounced correctly. Keep maintaining this
            pronunciation.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <IssueCard issue={word.issue} />
          </div>

          <div className="mt-6">
            <RecommendationCard recommendation={word.recommendation} />
          </div>
        </>
      )}
    </div>
  );
};

export default WordAnalysisDetails;
