import { useEffect, useState } from "react";

const SentenceText = ({
  words,
  variant = "expected",
  clickable = false,
  onWordClick,
}) => {
  const [visibleWords, setVisibleWords] = useState([]);

  useEffect(() => {
    setVisibleWords([]);

    const timers = words.map((_, index) =>
      setTimeout(() => {
        setVisibleWords((prev) => [...prev, index]);
      }, index * 120),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [words]);

  const incorrectClass =
    variant === "expected" ? "text-indigo-600" : "text-orange-500";

  return (
    <div
      className="
        flex
        flex-wrap
        gap-x-2.5
        gap-y-2
        text-2xl
        sm:text-3xl
        font-bold
        leading-snug
        break-words
      "
    >
      {words.map((word, index) => (
        <span
          key={`${word.id ?? word.word}-${index}`}
          onClick={() =>
            clickable && word.status === "incorrect" && onWordClick?.(word.id)
          }
          className={`
            transition-all
            duration-500
            ease-out

            ${
              visibleWords.includes(index)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }

            ${word.status === "incorrect" ? incorrectClass : "text-gray-900"}

            ${
              clickable && word.status === "incorrect"
                ? "cursor-pointer hover:opacity-75"
                : ""
            }
          `}
        >
          {word.word}
        </span>
      ))}
    </div>
  );
};

export default SentenceText;
