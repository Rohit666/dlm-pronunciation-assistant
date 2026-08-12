import { Mic2 } from "lucide-react";

const PronunciationSkeleton = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Blurred Content */}
      <div className="relative flex-1 overflow-hidden">
        <div className="blur-sm opacity-40 pointer-events-none select-none">
          {/* Phoneme */}
          <div className="text-center mt-4">
            <div className="text-7xl font-black text-indigo-600">TH</div>

            <p className="mt-3 text-gray-500">Voiceless Dental Fricative</p>
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
            "
          />

          {/* Tip */}
          <div
            className="
              mt-8
              rounded-2xl
              bg-amber-50
              h-32
            "
          />

          {/* Practice Words */}
          <div className="mt-8 flex gap-3">
            <div className="h-10 w-24 rounded-xl bg-indigo-100" />
            <div className="h-10 w-28 rounded-xl bg-indigo-100" />
            <div className="h-10 w-24 rounded-xl bg-indigo-100" />
          </div>
        </div>

        {/* Overlay */}
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
          "
        >
          <div
            className="
              max-w-sm
              rounded-2xl
              bg-white/90
              backdrop-blur
              shadow-lg
              border
              p-8
              text-center
            "
          >
            <Mic2 size={40} className="mx-auto text-indigo-500" />

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Select a word
            </h3>

            <p className="mt-3 text-gray-600 leading-7">
              Click any word in the Word Analysis card to view pronunciation
              guidance, mouth animation, practice words and audio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationSkeleton;
