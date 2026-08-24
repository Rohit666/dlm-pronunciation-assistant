import { Lightbulb } from "lucide-react";

import AssessmentCard from "../../../components/common/AssessmentCard";
import PronunciationSkeleton from "./pronunciation-tip-card/PronunciationSkeleton";

import { getPhonemeMetadata } from "../../../features/assessment/phoneme-engine/data/phonemeMetadata";

const PronunciationTipCard = ({
  word,
  selectedPhoneme,
  onListen,
  embedded = false,
}) => {
  const cardClass = embedded ? "w-full" : "flex flex-col h-full w-full";

  if (!selectedPhoneme) {
    const emptyContent = (
      <>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Pronunciation Tip
          </h2>

          <p className="mt-2 text-gray-500">
            Learn how to correctly produce this sound.
          </p>
        </div>

        <div className="mt-8">
          <PronunciationSkeleton />
        </div>
      </>
    );

    return embedded ? (
      <div className={cardClass}>{emptyContent}</div>
    ) : (
      <AssessmentCard className={cardClass}>{emptyContent}</AssessmentCard>
    );
  }

  const phoneme = selectedPhoneme?.expected?.symbol ?? "";

  const metadata = phoneme ? getPhonemeMetadata(phoneme) : null;

  const videoSrc = metadata?.video?.src ?? null;

  const phonemeName = metadata?.teaching?.name ?? word.phonemeName ?? "";

  const practiceWords = metadata?.example?.word
    ? [metadata.example.word]
    : (word.practiceWords ?? []);

  const recommendation = metadata?.teaching?.tip ?? word.recommendation ?? "";

  const content = (
    <>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pronunciation Tip</h2>

        <p className="mt-2 text-sm text-gray-500">
          Learn how to correctly produce this sound.
        </p>
      </div>

      {/* Phoneme */}
      <div className="mt-6 text-center">
        <div className="text-6xl font-black text-indigo-600">
          {phoneme || "—"}
        </div>

        <p className="mt-2 text-gray-500 font-medium">{phonemeName}</p>

        {metadata?.teaching?.description && (
          <p className="mt-4 text-gray-600 leading-7 text-sm">
            {metadata.teaching.description}
          </p>
        )}

        {selectedPhoneme && (
          <div className="mt-5 flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500">Expected</p>

              <p className="mt-1 text-2xl font-bold text-indigo-700">
                {selectedPhoneme.expected?.symbol ?? "—"}
              </p>
            </div>

            <div className="text-xl text-gray-400">→</div>

            <div className="text-center">
              <p className="text-xs font-medium text-gray-500">Your sound</p>

              <p className="mt-1 text-2xl font-bold text-orange-600">
                {selectedPhoneme.detected?.symbol ?? "Not detected"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video */}
      <div className="mt-6">
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black">
          {videoSrc ? (
            <video
              key={videoSrc}
              src={videoSrc}
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-video object-contain"
            />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-gray-50">
              <p className="text-sm text-gray-400">
                Demonstration video not available.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <Lightbulb className="text-amber-600 mt-1 shrink-0" size={20} />

          <div>
            <h3 className="font-bold text-amber-700">Tip</h3>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              {recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Practice Words */}
      {practiceWords.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-gray-900">Practice Words</h3>

          <div className="flex flex-wrap gap-2 mt-3">
            {practiceWords.map((practiceWord) => (
              <span
                key={practiceWord}
                className="
                  px-3
                  py-2
                  rounded-xl
                  bg-indigo-50
                  text-indigo-700
                  text-sm
                  font-semibold
                "
              >
                {practiceWord}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return embedded ? (
    <div className={cardClass}>{content}</div>
  ) : (
    <AssessmentCard className={cardClass}>{content}</AssessmentCard>
  );
};

export default PronunciationTipCard;
