import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeroScoreCard from "../components/HeroScoreCard";
import RecognitionStatusCard from "../components/RecognitionPanel";
import SentenceComparisonCard from "../components/SentenceComparisonCard";
import AICoachCard from "../components/AICoachCard";
import WordAnalysisCard from "../components/WordAnalysisCard";
import PronunciationTipCard from "../components/PronunciationTipCard";
import BottomActionBar from "../components/BottomActionBar";
import usePracticePlayer from "../../../features/practice/hooks/usePracticePlayer";

import { Sparkles } from "lucide-react";
const SuccessAssessment = ({ assessment }) => {
  const navigate = useNavigate();
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedPhoneme, setSelectedPhoneme] = useState(null);
  const { retryRecording, submitting, submitRecording } = usePracticePlayer();
  console.log("Assessment Data:", assessment);
  return (
    <div className="space-y-6 p-4">
      {/* Hero Section */}
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Your Comparisson Feedback
          </h2>
          <p className="text-gray-500 text-sm">
            Check your performance and improve your pronunciation
          </p>
        </div>
      </div>
      <HeroScoreCard assessment={assessment} />
      <div className="flex flex-col lg:flex-row gap-6 items-stretch ">
        <div className="flex-1 flex">
          <SentenceComparisonCard
            expected={assessment.comparison.expected}
            detected={assessment.comparison.detected}
            differenceCount={assessment.comparison.differenceCount}
            onWordClick={(id) => console.log(id)}
          />
        </div>
        <div className="flex-1 flex">
          {/* Coach */}
          <WordAnalysisCard
            analysis={assessment.wordAnalysis}
            selectedWord={selectedWord}
            onSelectWord={(word) => {
              setSelectedWord(word);
              setSelectedPhoneme(null);
            }}
            selectedPhoneme={selectedPhoneme}
            onSelectPhoneme={setSelectedPhoneme}
          />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 items-stretch ">
        <div className="flex-1 flex">
          <PronunciationTipCard
            word={selectedWord}
            onListen={() => console.log("Play phoneme")}
          />
        </div>
        <div className="flex-1 flex">
          <AICoachCard
            greeting={assessment.coach.greeting}
            message={assessment.coach.message}
            focusSound={assessment.coach.focusSound}
            onListen={() => console.log("Listen Coach")}
          />
        </div>
      </div>
      <BottomActionBar
        onSubmit={submitRecording}
        onTryAgain={retryRecording}
        showSubmit={true}
        submitting={submitting}
      />
    </div>
  );
};

export default SuccessAssessment;
