import { Volume2 } from "lucide-react";
import AssessmentCard from "../../../components/common/AssessmentCard";
import DifferenceBadge from "./sentence-components/DifferenceBadge";
import SentenceText from "./sentence-components/SentenceText";
import { useEffect, useState } from "react";
const SentenceComparisonCard = ({
  expected,
  detected,
  words,
  differenceCount,
  onWordClick,
}) => {
  const [showSentenceCard, setShowSentenceCard] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSentenceCard(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);
  return (
    <AssessmentCard
      className={`flex flex-col flex-1 transition-all
    duration-700
    ease-out
    ${showSentenceCard ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
    `}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Expected Sentence */}

        <div className="p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-xl">
              Expected Sentence
            </h3>

            <button
              className="
        w-11
        h-11
        rounded-xl
        hover:bg-indigo-50
        transition
        flex
        items-center
        justify-center
        text-indigo-600
    "
            >
              <Volume2 size={22} />
            </button>
          </div>

          <div className="mt-14">
            <SentenceText words={expected} variant="expected" />
          </div>
        </div>

        {/* Student Recording */}

        <div className="p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-xl">
              Your Recording
            </h3>

            <button
              className="
        w-11
        h-11
        rounded-xl
        hover:bg-indigo-50
        transition
        flex
        items-center
        justify-center
        text-indigo-600
    "
            >
              <Volume2 size={22} />
            </button>
          </div>

          <div className="mt-14">
            <SentenceText
              words={detected}
              variant="detected"
              clickable
              onWordClick={onWordClick}
            />
          </div>

          <div className="mt-8 animate-[fadeIn_0.5s_ease-out]">
            <DifferenceBadge count={differenceCount} />
          </div>
        </div>
      </div>
    </AssessmentCard>
  );
};

export default SentenceComparisonCard;
