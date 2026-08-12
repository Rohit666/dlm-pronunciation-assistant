import { useState } from "react";
import { Bot } from "lucide-react";

import AssessmentCard from "../../../components/common/AssessmentCard";
import WordSelector from "./word-analysis-components/WordSelector";
import WordAnalysisDetails from "./word-analysis-components/WordAnalysisDetails";
import WordAnalysisSkeleton from "./word-analysis-components/WordAnalysisSkeleton";

const WordAnalysisCard = ({
  analysis,
  selectedWord,
  onSelectWord,
  selectedPhoneme,
  onSelectPhoneme,
}) => {
  return (
    <AssessmentCard className="h-full w-full">
      <h2 className="text-2xl font-bold text-gray-900">Word Analysis</h2>

      {/* Word Selector */}
      <div className="mt-8">
        <WordSelector
          words={analysis}
          selectedId={selectedWord?.id}
          onSelect={onSelectWord}
        />
      </div>

      {/* Content */}
      <div className="relative mt-8 min-h-[420px]">
        {/* Empty State */}
        {!selectedWord && (
          <>
            {/* Skeleton */}
            <div className="opacity-40 blur-[0.8px] pointer-events-none">
              <WordAnalysisSkeleton />
            </div>

            {/* Overlay */}
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                px-8
              "
            >
              <div
                className="
                  max-w-md
                  rounded-3xl
                  bg-white/90
                  backdrop-blur-sm
                  border
                  border-indigo-100
                  shadow-lg
                  p-8
                  text-center
                  transition-all
                  duration-500
                "
              >
                <div
                  className="
                    w-16
                    h-16
                    rounded-full
                    bg-indigo-100
                    flex
                    items-center
                    justify-center
                    mx-auto
                  "
                >
                  <Bot size={34} className="text-indigo-600" />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-gray-900">
                  Let's improve together!
                </h3>

                <p className="mt-4 text-gray-600 leading-7">
                  Select any word above to see why it was recognised that way,
                  discover what happened, and learn how to pronounce it more
                  naturally.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Details */}
        {selectedWord && (
          <div
            className="
              animate-fadeIn
            "
          >
            <WordAnalysisDetails word={selectedWord} />
          </div>
        )}
      </div>
    </AssessmentCard>
  );
};

export default WordAnalysisCard;
