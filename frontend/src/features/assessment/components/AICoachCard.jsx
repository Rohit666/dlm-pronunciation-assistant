import AssessmentCard from "../../../components/common/AssessmentCard";
import CoachHeader from "./aicoach/CoachHeader";
import CoachSpeechBubble from "./aicoach/CoachSpeechBubble";
import FocusSoundPill from "./aicoach/FocusSoundPill";
import { useEffect, useState } from "react";

const AICoachCard = ({ greeting, message, focusSound, onListen }) => {
  const [showCoach, setShowCoach] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCoach(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AssessmentCard
      className={`
        w-full
        transition-all
        duration-700
        ease-out
        ${showCoach ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      `}
    >
      <div
        className={`
          transition-all
          duration-700
          ${
            showCoach ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }
        `}
      >
        <CoachHeader onListen={onListen} />
      </div>

      <div
        className="
          mt-5
          grid
          grid-cols-1
          lg:grid-cols-[minmax(0,1fr)_auto]
          gap-4
          items-center
        "
      >
        {/* Coach Message */}
        <div
          className={`
            min-w-0
            transition-all
            duration-700
            delay-200
            ${
              showCoach
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-3"
            }
          `}
        >
          <CoachSpeechBubble greeting={greeting}>{message}</CoachSpeechBubble>
        </div>

        {/* Focus Sound */}
        {focusSound && (
          <div
            className={`
              shrink-0
              transition-all
              duration-700
              delay-400
              ${
                showCoach
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3"
              }
            `}
          >
            <FocusSoundPill sound={focusSound} />
          </div>
        )}
      </div>
    </AssessmentCard>
  );
};

export default AICoachCard;
