import AssessmentCard from "../../../components/common/AssessmentCard";
import ListenButton from "./ListenButton";
import PronunciationSkeleton from "./pronunciation-tip-card/PronunciationSkeleton";

import { Volume2, Lightbulb } from "lucide-react";

const PronunciationTipCard = ({ word, onListen }) => {
  if (!word) {
    return (
      <AssessmentCard className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Pronunciation Tip
            </h2>

            <p className="mt-2 text-gray-500">
              Learn how to correctly produce this sound.
            </p>
          </div>

          <ListenButton disabled />
        </div>

        {/* Skeleton */}
        <div className="mt-8 flex-1">
          <PronunciationSkeleton />
        </div>
      </AssessmentCard>
    );
  }

  const phoneme = word.weakPhonemes?.[0] ?? "";
  const phonemeName = word.phonemeName ?? "";
  const practiceWords = word.practiceWords ?? [];

  return (
    <AssessmentCard className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Pronunciation Tip
          </h2>

          <p className="mt-2 text-gray-500">
            Learn how to correctly produce this sound.
          </p>
        </div>

        <ListenButton onClick={onListen} />
      </div>

      {/* Phoneme */}
      <div className="mt-8 text-center">
        <div className="text-7xl font-black text-indigo-600">{phoneme}</div>

        <p className="mt-3 text-gray-500 font-medium">{phonemeName}</p>
      </div>

      {/* Animation */}
      <div
        className="
          mt-8
          h-56
          rounded-3xl
          border-2
          border-dashed
          border-gray-200
          bg-gray-50
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <Volume2 size={42} className="text-gray-400" />

        <p className="mt-4 text-gray-400 font-medium">Mouth Animation</p>
      </div>

      {/* Tip */}
      <div
        className="
          mt-8
          rounded-2xl
          border
          border-amber-200
          bg-amber-50
          p-5
        "
      >
        <div className="flex gap-3">
          <Lightbulb className="text-amber-600 mt-1 shrink-0" size={22} />

          <div>
            <h3 className="font-bold text-amber-700">Tip</h3>

            <p className="mt-2 leading-7 text-gray-700">
              {word.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Practice Words */}
      {practiceWords.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-gray-900">Practice Words</h3>

          <div className="flex flex-wrap gap-3 mt-4">
            {practiceWords.map((practiceWord) => (
              <span
                key={practiceWord}
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-indigo-50
                  text-indigo-700
                  font-semibold
                "
              >
                {practiceWord}
              </span>
            ))}
          </div>
        </div>
      )}
    </AssessmentCard>
  );
};

export default PronunciationTipCard;
