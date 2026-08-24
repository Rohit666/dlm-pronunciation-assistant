import { useState } from "react";

import HeroScoreCard from "../components/HeroScoreCard";
import SentenceComparisonCard from "../components/SentenceComparisonCard";
import WordAnalysisCard from "../components/WordAnalysisCard";
import AICoachCard from "../components/AICoachCard";
import BottomActionBar from "../components/BottomActionBar";
import PronunciationAnalysisDrawer from "../components/PronunciationAnalysisDrawer";

import usePracticePlayer from "../../../features/practice/hooks/usePracticePlayer";

import { Sparkles } from "lucide-react";

const SuccessAssessment = ({ assessment }) => {
  const [selectedWord, setSelectedWord] = useState(null);

  const { retryRecording, submitting, submitRecording } = usePracticePlayer();

  const handleSelectWord = (word) => {
    setSelectedWord(word);
  };

  const handleCloseAnalysis = () => {
    setSelectedWord(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* =====================================================
          PAGE HEADER
         ===================================================== */}
      <header className="flex items-center gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-purple-100
          "
        >
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Pronunciation Assessment
          </h1>

          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Review your performance and explore the sounds that need practice.
          </p>
        </div>
      </header>

      {/* =====================================================
          HERO
         ===================================================== */}
      <HeroScoreCard assessment={assessment} />

      {/* =====================================================
          MAIN ASSESSMENT GRID
         ===================================================== */}
      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-6
          items-start
        "
      >
        {/* -------------------------------------------------
            LEFT COLUMN
           ------------------------------------------------- */}
        <div className="min-w-0 space-y-6">
          <SentenceComparisonCard
            expected={assessment.comparison.expected}
            detected={assessment.comparison.detected}
            differenceCount={assessment.comparison.differenceCount}
            onWordClick={(id) => {
              console.log("Sentence word clicked:", id);
            }}
          />

          <AICoachCard
            greeting={assessment.coach.greeting}
            message={assessment.coach.message}
            focusSound={assessment.coach.focusSound}
            onListen={() => console.log("Listen Coach")}
          />
        </div>

        {/* -------------------------------------------------
            RIGHT COLUMN
           ------------------------------------------------- */}
        <div className="min-w-0">
          <WordAnalysisCard
            analysis={assessment.wordAnalysis}
            selectedWord={selectedWord}
            onSelectWord={handleSelectWord}
          />
        </div>
      </div>

      {/* =====================================================
          ACTIONS
         ===================================================== */}
      <BottomActionBar
        onSubmit={submitRecording}
        onTryAgain={retryRecording}
        showSubmit={true}
        submitting={submitting}
      />

      {/* =====================================================
          DETAIL DRAWER
         ===================================================== */}
      <PronunciationAnalysisDrawer
        word={selectedWord}
        onClose={handleCloseAnalysis}
      />
    </div>
  );
};

export default SuccessAssessment;
