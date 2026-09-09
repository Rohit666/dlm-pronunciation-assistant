import { Image as ImageIcon } from "lucide-react";
import { API_BASE_URL } from "../../constants/api";

// Requirement 3.2: renders the multi-skill adaptive recommendation
// engine's output (GET /api/recommendations/mentee) — pronunciation /
// vocabulary / grammar / fallback lesson matches, each tagged with the
// diagnostic reason that produced it. Additive to the dashboard,
// separate from the existing JourneyCard/RecommendationGrid pairing
// (that pairing stays wired to the older outcome-based engine — see
// recommendationService.js on the backend for why).
const MATCH_TYPE_STYLES = {
  pronunciation: { label: "Pronunciation", className: "bg-red-100 text-red-700" },
  vocabulary: { label: "Vocabulary", className: "bg-blue-100 text-blue-700" },
  grammar: { label: "Grammar", className: "bg-purple-100 text-purple-700" },
  fallback: { label: "Next Up", className: "bg-gray-100 text-gray-700" },
};

function RecommendationCard({ lesson, onOpenLesson }) {
  const style = MATCH_TYPE_STYLES[lesson.matchType] || MATCH_TYPE_STYLES.fallback;

  return (
    <button
      type="button"
      onClick={() => onOpenLesson(lesson.lessonId)}
      className="text-left bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="h-32 bg-gray-100 relative">
        {lesson.thumbnail ? (
          <img
            src={`${API_BASE_URL}/${lesson.thumbnail}`}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.className}`}>
            {style.label}
          </span>
          <span className="text-[11px] font-semibold text-gray-400">
            {lesson.cefrLevel}
          </span>
        </div>
        <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
          {lesson.title}
        </h4>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{lesson.reason}</p>
      </div>
    </button>
  );
}

function AdaptiveRecommendationPanel({ recommendation, onOpenLesson }) {
  if (!recommendation || recommendation.recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-gray-800">Recommended For You</h3>
        <span className="text-xs font-semibold text-gray-400">
          CEFR {recommendation.currentCefrLevel}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Based on your pronunciation, vocabulary, and grammar patterns across recent
        practice.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {recommendation.recommendations.map((lesson) => (
          <RecommendationCard
            key={lesson.lessonId}
            lesson={lesson}
            onOpenLesson={onOpenLesson}
          />
        ))}
      </div>
    </div>
  );
}

export default AdaptiveRecommendationPanel;
