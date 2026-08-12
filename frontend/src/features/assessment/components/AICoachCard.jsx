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
    flex
    flex-col
    flex-1
    transition-all
    duration-700
    ease-out
    ${showCoach ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
  `}
    >
      <div
        className={`
    transition-all
    duration-700
    delay-150
    ${showCoach ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
  `}
      >
        <CoachHeader onListen={onListen} />
      </div>

      <div
        className={`
    transition-all
    duration-700
    delay-300
    ${
      showCoach
        ? "opacity-100 scale-100 translate-y-0"
        : "opacity-0 scale-95 translate-y-4"
    }
  `}
      >
        <CoachSpeechBubble greeting={greeting}>{message}</CoachSpeechBubble>
      </div>

      <div
        className={`
    mt-auto
    pt-8
    transition-all
    duration-700
    delay-500
    ${showCoach ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
  `}
      >
        <FocusSoundPill sound={focusSound} />
      </div>
    </AssessmentCard>
  );
};

export default AICoachCard;
