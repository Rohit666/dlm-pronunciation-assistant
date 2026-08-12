import { Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import PrimaryButton from "../common/PrimaryButton";
import { JOURNEY_LEVELS } from "../../constants/journeyLevels";

function JourneyCard({ learningProfile, showCelebration = false, onAction }) {
  if (!learningProfile) {
    return null;
  }
  const journeyLevel =
    JOURNEY_LEVELS.find(
      (level) =>
        learningProfile.progress >= level.min &&
        learningProfile.progress <= level.max,
    ) || JOURNEY_LEVELS[0];
  const progress = learningProfile.progress || 0;
  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(learningProfile.progress);
    }, 150);

    return () => clearTimeout(timer);
  }, [learningProfile.progress]);
  const getHeading = () => {
    if (showCelebration) {
      return `🎉 Congratulations!

You've unlocked a personalized learning experience.

From now on, your lesson recommendations will focus on the pronunciation skills that matter most to you.

Continue learning, and we'll keep refining your path to help you improve faster.

[ View My Next Steps ]`;
    }

    switch (learningProfile.state) {
      case "cold_start":
        return "🌱 Start Your Learning Journey";

      case "learning":
        return "🎯 Your Pronunciation Journey";

      case "excellent":
        return "⭐ Excellent Progress!";

      default:
        return "⭐ Personalized Learning Active";
    }
  };

  const getButtonText = () => {
    if (
      learningProfile.state === "personalized" ||
      learningProfile.state === "excellent" ||
      showCelebration
    ) {
      return "View My Next Steps";
    }

    return "Continue Practice";
  };
  const getEncouragingMessage = () => {
    const remaining =
      learningProfile.requiredAttempts - learningProfile.reviewedAttempts;

    if (remaining <= 0) {
      return "Fantastic work! Your learning experience is now personalized based on your progress.";
    }

    if (remaining === 1) {
      return "You're one mentor review away from unlocking personalized lesson recommendations!";
    }

    return `You've made excellent progress already. Complete ${remaining} more mentor-reviewed practice sessions and we'll tailor lesson recommendations specifically for you.`;
  };
  return (
    <div
      className="bg-gradient-to-r
from-indigo-50
via-white
to-blue-50 rounded-3xl shadow-sm p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{journeyLevel.emoji}</div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Your Pronunciation Journey
            </h2>

            <p className={`${journeyLevel.color} font-semibold mt-2`}>
              {journeyLevel.title}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-4xl font-bold text-indigo-600">
            {animatedProgress}%
          </p>

          <p className="text-sm text-gray-500 mt-1">Progress</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="
            h-full
            bg-indigo-600
            rounded-full
            transition-all
            duration-1000
            ease-out
          "
          style={{
            width: `${animatedProgress}%`,
          }}
        />
      </div>
      <div className="flex justify-between mt-6">
        {JOURNEY_LEVELS.map((level, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={`
          w-10
          h-10
          rounded-full
          flex
          items-center
          justify-center
          text-xl
          transition-all
          duration-500
          ${
            animatedProgress >= level.max
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }
        `}
            >
              {level.emoji}
            </div>

            <p className="text-xs text-center mt-2 text-gray-500 px-1">
              {level.title}
            </p>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <p className="text-gray-700">
          <span className="font-bold text-indigo-600">
            {learningProfile.reviewedAttempts}
          </span>{" "}
          of{" "}
          <span className="font-bold">{learningProfile.requiredAttempts}</span>{" "}
          mentor reviews completed
        </p>

        <p className="font-semibold text-indigo-600">Keep Going!</p>
      </div>

      <h3 className="text-xl font-semibold mt-8">{learningProfile.title}</h3>

      <p className="text-gray-600 mt-3 leading-7">{getEncouragingMessage()}</p>

      <div className="mt-8">
        <PrimaryButton onClick={onAction}>
          <div
            className="flex items-center gap-2 
font-semibold "
          >
            {getButtonText()}

            <ArrowRight size={18} />
          </div>
        </PrimaryButton>
      </div>
    </div>
  );
}

export default JourneyCard;
