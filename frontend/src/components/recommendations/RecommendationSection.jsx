import { useEffect, useState } from "react";

import JourneyCard from "./JourneyCard";
import RecommendationGrid from "./RecommendationGrid";

function RecommendationSection({
  recommendation,
  onContinuePractice,
  onOpenLesson,
  userId,
}) {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!recommendation) {
      return;
    }

    const shouldCelebrate =
      recommendation.learningProfile?.state === "personalized";

    if (!shouldCelebrate) {
      return;
    }

    const storageKey = `journey-celebrated-${userId}`;

    const alreadySeen = localStorage.getItem(storageKey);

    if (!alreadySeen) {
      setShowCelebration(true);

      localStorage.setItem(storageKey, "true");
    }
  }, [recommendation, userId]);

  if (!recommendation) {
    return null;
  }

  return (
    <div className="mb-8">
      <JourneyCard
        learningProfile={recommendation.learningProfile}
        showCelebration={showCelebration}
        onAction={
          recommendation.hasPersonalizedRecommendations
            ? () => {
                document.getElementById("recommendation-grid")?.scrollIntoView({
                  behavior: "smooth",
                });
              }
            : onContinuePractice
        }
      />

      {recommendation.hasPersonalizedRecommendations && (
        <div id="recommendation-grid" className="mt-8">
          <RecommendationGrid
            revisionLessons={recommendation.revisionLessons}
            nextLessons={recommendation.nextLessons}
            onOpenLesson={onOpenLesson}
          />
        </div>
      )}
    </div>
  );
}

export default RecommendationSection;
