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

    words.forEach((_, index) => {
      setTimeout(() => {
        setVisibleWords((prev) => [...prev, index]);
      }, index * 180);
    });
  }, [words]);

  const incorrectClass =
    variant === "expected" ? "text-indigo-600" : "text-orange-500";

  return (
    <div
      className="
        flex
        flex-wrap
        gap-3
        text-[30px]
        font-bold
        leading-tight
      "
    >
      {words.map((word, index) => (
        <span
          key={index}
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
                : "opacity-0 translate-y-3"
            }

            ${
              word.status === "incorrect"
                ? `${incorrectClass} `
                : "text-gray-900"
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
