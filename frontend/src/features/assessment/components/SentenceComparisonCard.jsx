import { Volume2 } from "lucide-react";
import AssessmentCard from "../../../components/common/AssessmentCard";
import DifferenceBadge from "./sentence-components/DifferenceBadge";
import SentenceText from "./sentence-components/SentenceText";
import { useEffect, useState } from "react";

const SentenceComparisonCard = ({
  expected,
  detected,
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
      className={`
        w-full
        overflow-hidden
        transition-all
        duration-700
        ease-out
        ${
          showSentenceCard
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-8"
        }
      `}
    >
      <div
        className="
          grid
          grid-cols-1
        "
      >
        {/* =================================================
            EXPECTED
           ================================================= */}
        <section className="min-w-0 p-6 sm:p-7 ">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Expected Sentence
            </h3>

            <button
              type="button"
              aria-label="Listen to expected sentence"
              className="
                w-10
                h-10
                shrink-0
                rounded-xl
                hover:bg-indigo-50
                transition
                flex
                items-center
                justify-center
                text-indigo-600
              "
            >
              <Volume2 size={21} />
            </button>
          </div>

          <div className="mt-6">
            <SentenceText words={expected} variant="expected" />
          </div>
        </section>
        <hr className="border-gray-200" />
        {/* =================================================
            STUDENT RECORDING
           ================================================= */}
        <section className="min-w-0 p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Your Said
            </h3>

            <button
              type="button"
              aria-label="Listen to your recording"
              className="
                w-10
                h-10
                shrink-0
                rounded-xl
                hover:bg-indigo-50
                transition
                flex
                items-center
                justify-center
                text-indigo-600
              "
            >
              <Volume2 size={21} />
            </button>
          </div>

          <div className="mt-6">
            <SentenceText
              words={detected}
              variant="detected"
              clickable
              onWordClick={onWordClick}
            />
          </div>

          {differenceCount > 0 && (
            <div className="mt-6 animate-[fadeIn_0.5s_ease-out]">
              <DifferenceBadge count={differenceCount} />
            </div>
          )}
        </section>
      </div>
    </AssessmentCard>
  );
};

export default SentenceComparisonCard;
