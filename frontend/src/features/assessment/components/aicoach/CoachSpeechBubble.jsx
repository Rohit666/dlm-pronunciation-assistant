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
        rounded-2xl
        bg-gradient-to-br
        from-indigo-50
        to-purple-50
        border
        border-indigo-100
        px-5
        py-4
      "
    >
      <Quote
        size={24}
        className={`
          absolute
          left-4
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

      <div className="ml-7">
        <h4
          className={`
            text-indigo-700
            text-base
            sm:text-lg
            font-bold
            transition-all
            duration-500
            ${
              showGreeting
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }
          `}
        >
          {greeting}
        </h4>

        <p
          className={`
            mt-1
            text-sm
            leading-6
            text-gray-700
            transition-all
            duration-700
            ${
              showMessage
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }
          `}
        >
          {children}
        </p>
      </div>
    </div>
  );
};

export default CoachSpeechBubble;
