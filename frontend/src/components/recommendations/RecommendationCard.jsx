import { Image as ImageIcon, ArrowRight } from "lucide-react";

import { API_BASE_URL } from "../../constants/api";

import PrimaryButton from "../common/PrimaryButton";

function RecommendationCard({ lesson, type, onContinue }) {
  return (
    <div
      className="
        bg-white
        rounded-3xl
        shadow-sm
        overflow-hidden
        hover:shadow-lg
        transition-all
      "
    >
      <div className="h-44 bg-gray-100">
        {lesson.thumbnail ? (
          <img
            src={`${API_BASE_URL}/${lesson.thumbnail}`}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={40} className="text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">{lesson.title}</h2>

          <span
            className={`
              px-3
              py-1
              rounded-xl
              text-xs
              font-semibold
              ${
                type === "revision"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }
            `}
          >
            {type === "revision" ? "Revision" : "Next Lesson"}
          </span>
        </div>

        <p className="text-gray-600 mt-4 leading-7 line-clamp-3">
          {lesson.description}
        </p>

        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            This lesson will help you practice:
          </p>

          <div className="flex flex-wrap gap-2">
            {lesson.reason.map((outcome) => (
              <span
                key={outcome}
                className="
          px-3
          py-1
          rounded-full
          bg-indigo-100
          text-indigo-700
          text-sm
          font-medium
        "
              >
                {outcome}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <span className="px-3 py-1 bg-gray-100 rounded-xl text-sm">
            {lesson.cefrLevel}
          </span>

          <PrimaryButton onClick={onContinue}>
            <div className="flex items-center gap-2">
              Continue
              <ArrowRight size={18} />
            </div>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default RecommendationCard;
