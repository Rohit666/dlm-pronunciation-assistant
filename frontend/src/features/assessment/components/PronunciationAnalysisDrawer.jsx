import { useEffect, useState } from "react";
import { X } from "lucide-react";

import AssessmentCard from "../../../components/common/AssessmentCard";
import WordAnalysisDetails from "./word-analysis-components/WordAnalysisDetails";
import PronunciationTipCard from "./PronunciationTipCard";

const PronunciationAnalysisDrawer = ({ word, onClose }) => {
  const [selectedPhoneme, setSelectedPhoneme] = useState(null);

  /*
   * Reset phoneme whenever a different word is opened.
   *
   * We intentionally do NOT automatically select
   * the first weak phoneme.
   */
  useEffect(() => {
    setSelectedPhoneme(null);
  }, [word?.id]);

  /*
   * Prevent background page scrolling while
   * the detail drawer is open.
   */
  useEffect(() => {
    if (!word) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [word]);

  if (!word) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        justify-end
      "
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close pronunciation analysis"
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-slate-900/30
          backdrop-blur-[2px]
        "
      />

      {/* Drawer */}
      <aside
        className="
          relative
          z-10
          h-full
          w-full
          bg-gray-50
          shadow-2xl

          lg:max-w-[900px]
          xl:max-w-[1100px]

          animate-slideInRight
        "
        role="dialog"
        aria-modal="true"
        aria-label={`Pronunciation analysis for ${word.expected}`}
      >
        {/* Drawer Header */}
        <div
          className="
            sticky
            top-0
            z-20
            border-b
            border-gray-200
            bg-white/95
            backdrop-blur
            px-6
            py-4
            sm:px-8
          "
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Pronunciation Analysis
              </p>

              <div className="mt-1 flex items-center gap-3">
                <h2 className="text-2xl font-black text-gray-900 truncate">
                  {word.expected}
                </h2>

                <span
                  className={`
                    shrink-0
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-bold
                    ${
                      word.status === "correct"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  `}
                >
                  {word.score}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="
                shrink-0
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                border
                border-gray-200
                bg-white
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-900
              "
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="h-[calc(100%-89px)] overflow-y-auto">
          <div
            className="
              p-4
              sm:p-6
              xl:p-8
            "
          >
            <div
              className="
                grid
                grid-cols-1
                xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]
                gap-6
                items-start
              "
            >
              {/* --------------------------------
                  WORD ANALYSIS
                 -------------------------------- */}
              <AssessmentCard className="w-full">
                <WordAnalysisDetails
                  word={word}
                  selectedPhoneme={selectedPhoneme}
                  onSelectPhoneme={setSelectedPhoneme}
                />
              </AssessmentCard>

              {/* --------------------------------
                  PRONUNCIATION TIP
                 -------------------------------- */}
              <AssessmentCard className="w-full xl:sticky xl:top-2">
                <PronunciationTipCard
                  word={word}
                  selectedPhoneme={selectedPhoneme}
                  embedded
                />
              </AssessmentCard>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PronunciationAnalysisDrawer;
