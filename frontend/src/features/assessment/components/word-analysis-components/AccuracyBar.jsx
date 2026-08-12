import { useEffect, useState } from "react";

const AccuracyBar = ({ score }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(score);
    }, 300);

    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div>
      <div className="flex justify-between mb-3">
        <span className="font-semibold">Accuracy</span>

        <span
          className="
            font-bold
            text-indigo-600
          "
        >
          {score}%
        </span>
      </div>

      <div
        className="
          h-3
          rounded-full
          bg-gray-200
          overflow-hidden
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-indigo-600
            transition-all
            duration-1000
          "
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
};

export default AccuracyBar;
