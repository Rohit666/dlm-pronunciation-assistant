import CircularScore from "./hero-card/CircularScore";
import StarRating from "./hero-card/StarRating";
import RatingBadge from "./hero-card/RatingBadge";
import RecognitionPanel from "./RecognitionPanel";
import AssessmentCard from "../../../components/common/AssessmentCard";
import { useEffect, useState } from "react";
const HeroScoreCard = ({ assessment }) => {
  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 900);
    return () => clearTimeout(timer);
  }, []);
  return (
    <AssessmentCard className="relative overflow-hidden">
      {/* Background Glow */}
      <div
        className="
        absolute
        left-1/3
        top-1/2
        -translate-y-1/2
        w-[420px]
        h-[420px]
        rounded-full
        bg-indigo-100/40
        blur-3xl
        pointer-events-none
      "
      />

      <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
        {/* LEFT SIDE */}
        <div className="flex-1 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Score */}
            <div className="flex justify-center shrink-0">
              <CircularScore
                score={assessment.hero.score}
                size={180}
                strokeWidth={12}
              />
            </div>

            {/* Details */}
            <div className="flex-1 text-center lg:text-left">
              <p
                className="
                font-bold
                tracking-[0.12em]
                text-gray-500
                text-lg
              "
              >
                Native Speaker Similarity
              </p>

              <div className="mt-4">
                <StarRating score={assessment.hero.score} />
              </div>

              <div className="mt-4">
                <RatingBadge score={assessment.hero.score} />
              </div>

              <div
                className={`
                mt-4
                transition-all
                duration-700
                ${
                  showMessage
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }
              `}
              >
                <p
                  className="
                  text-sm                  
                  leading-8
                  text-gray-600
                  max-w-md
                "
                >
                  {assessment.hero.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="h-full flex items-center">
          <RecognitionPanel
            state={assessment.recognition.state}
            title={assessment.recognition.title}
            message={assessment.recognition.message}
          />
        </div>
      </div>
    </AssessmentCard>
  );
};
export default HeroScoreCard;
