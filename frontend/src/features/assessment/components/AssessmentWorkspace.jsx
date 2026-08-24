import { useState } from "react";

import WordAnalysisCard from "./WordAnalysisCard";
import WordAnalysisDetails from "./word-analysis-components/WordAnalysisDetails";
import PronunciationTipCard from "./PronunciationTipCard";
import AssessmentCard from "../../../components/common/AssessmentCard";

const AssessmentWorkspace = ({ analysis }) => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedPhoneme, setSelectedPhoneme] = useState(null);

  const handleSelectWord = (word) => {
    setSelectedWord(word);
    setSelectedPhoneme(null);
  };

  return (
    <div
      className="
        grid
        grid-cols-1
        xl:grid-cols-[280px_minmax(0,1fr)]
        gap-6
        items-start
      "
    >
      {/* Word Summary */}
      <WordAnalysisCard
        analysis={analysis}
        selectedWord={selectedWord}
        onSelectWord={handleSelectWord}
      />

      {/* Detail Workspace */}
      <AssessmentCard
        className="
          w-full
          overflow-visible
          xl:h-[680px]
          xl:overflow-hidden
        "
      >
        {/* Header */}
        <div className="pb-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            Selected Word Analysis
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Explore the word and inspect each pronunciation sound.
          </p>
        </div>

        {!selectedWord ? (
          <div
            className="
              min-h-[420px]
              flex
              items-center
              justify-center
              px-8
              py-12
            "
          >
            <div className="max-w-md text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-3xl">↗</span>
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                Select a word to begin
              </h3>

              <p className="mt-3 text-gray-500 leading-7">
                Choose a word from the summary to see its pronunciation
                analysis. You can then select any phoneme to learn how to
                produce that sound.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="
              mt-0
              grid
              grid-cols-1
              xl:grid-cols-[1.1fr_0.9fr]
              xl:h-[calc(680px-90px)]
              xl:min-h-0
            "
          >
            {/* Word analysis */}
            <div
              className="
                min-w-0
                pt-5
                pb-6
                pr-0
                xl:pr-6
                xl:min-h-0
                xl:overflow-hidden
              "
            >
              <WordAnalysisDetails
                word={selectedWord}
                selectedPhoneme={selectedPhoneme}
                onSelectPhoneme={setSelectedPhoneme}
              />
            </div>

            {/* Pronunciation */}
            <div
              className="
                min-w-0
                pt-6
                pb-6
                xl:pt-5
                xl:pl-6
                xl:pr-2
                xl:border-l
                xl:border-gray-100
                xl:min-h-0
                xl:overflow-y-auto
              "
            >
              <PronunciationTipCard
                word={selectedWord}
                selectedPhoneme={selectedPhoneme}
                embedded
              />
            </div>
          </div>
        )}
      </AssessmentCard>
    </div>
  );
};

export default AssessmentWorkspace;
