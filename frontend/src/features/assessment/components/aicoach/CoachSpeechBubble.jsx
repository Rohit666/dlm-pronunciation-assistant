import { Quote } from "lucide-react";
import { useEffect, useState } from "react";
const CoachSpeechBubble = ({ greeting, children }) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const greetingTimer = setTimeout(() => {
      setShowGreeting(true);
    }, 150);

    const messageTimer = setTimeout(() => {
      setShowMessage(true);
    }, 550);

    return () => {
      clearTimeout(greetingTimer);
      clearTimeout(messageTimer);
    };
  }, []);
  return (
    <div
      className="
        relative
        rounded-[32px]
        bg-gradient-to-br
        from-indigo-50
        to-purple-50
        border
        border-indigo-100
        p-6
        mt-6
      "
    >
      <Quote
        size={28}
        className={`
    absolute
    left-5
    top-4
    text-indigo-200
    transition-all
    duration-500
    ${
      showGreeting
        ? "opacity-100 scale-100 rotate-0"
        : "opacity-0 scale-75 -rotate-12"
    }
  `}
      />

      <div className="ml-8">
        <h4
          className={`
    text-indigo-700
    text-xl
    font-bold
    mb-3
    transition-all
    duration-500
    ${showGreeting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
  `}
        >
          {greeting}
        </h4>

        <p
          className={`
    text-gray-700
    leading-8
    transition-all
    duration-700
    ${showMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
  `}
        >
          {children}
        </p>
      </div>
    </div>
  );
};

export default CoachSpeechBubble;
