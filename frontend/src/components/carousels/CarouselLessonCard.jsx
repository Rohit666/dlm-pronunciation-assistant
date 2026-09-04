import { Image as ImageIcon, PlayCircle } from "lucide-react";
import { API_BASE_URL } from "../../constants/api";
import { phonemeLabel } from "../../mock/phonemeCatalog";

// Compact poster-style card for a carousel row. Reuses the app's
// existing card visual language (rounded-3xl, shadow-sm, hover lift)
// from RecommendationCard/EntityCard rather than inventing a new one.
function CarouselLessonCard({ lesson, onOpen, matchReason }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(lesson.id)}
      className="
        snap-start shrink-0 w-64 text-left
        bg-white rounded-3xl shadow-sm overflow-hidden
        hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer
      "
    >
      <div className="h-36 bg-gray-100 relative">
        {lesson.thumbnail ? (
          <img
            src={`${API_BASE_URL}/${lesson.thumbnail}`}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={36} className="text-gray-400" />
          </div>
        )}

        {lesson.status === "in_progress" && (
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/10">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${lesson.progress}%` }}
            />
          </div>
        )}

        {lesson.status === "in_progress" && (
          <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1">
            <PlayCircle size={18} className="text-indigo-600" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
            {lesson.title}
          </h3>
          <span className="shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-100 text-indigo-700">
            {lesson.cefrLevel}
          </span>
        </div>

        {matchReason && lesson.matchedPhonemes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {lesson.matchedPhonemes.map((symbol) => (
              <span
                key={symbol}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700"
              >
                {phonemeLabel(symbol)}
              </span>
            ))}
          </div>
        )}

        {!matchReason && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {lesson.description}
          </p>
        )}
      </div>
    </button>
  );
}

export default CarouselLessonCard;
