import { useEffect, useMemo, useState } from "react";
import { getScoreMeta } from "../../utils/scoreUtils";

const CircularScore = ({ score = 0, size = 260, strokeWidth = 16 }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const meta = useMemo(() => getScoreMeta(score), [score]);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      current++;

      if (current >= score) {
        current = score;
        clearInterval(interval);

        setTimeout(() => {
          setCompleted(true);
        }, 120);
      }

      setDisplayScore(current);
    }, 22);

    return () => clearInterval(interval);
  }, [score]);

  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;

  const dashOffset = circumference - (displayScore / 100) * circumference;

  return (
    <div
      className={`
        relative
        flex
        items-center
        justify-center
        transition-transform
        duration-500
        ${completed ? "scale-100" : "scale-95"}
      `}
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: "rotate(-220deg)",
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient
            id="scoreGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={meta.color} />

            <stop offset="50%" stopColor={meta.color} />

            <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
          </linearGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />

            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Ring */}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#edf2f7"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Shadow Ring */}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={strokeWidth + 2}
          fill="none"
        />

        {/* Progress Ring */}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          filter="url(#glow)"
          style={{
            transition: "stroke-dashoffset .18s linear",
          }}
        />
      </svg>

      {/* Soft Glow */}

      {/* White Medal */}

      <div
        className="
          absolute
          w-[72%]
          h-[72%]
          rounded-full
          bg-white
          shadow-lg
          border
          border-gray-100
          flex
          items-center
          justify-center
        "
      >
        <div className="flex items-end">
          <span
            className="
              text-5xl
              font-black
              text-gray-900
              leading-none
            "
          >
            {displayScore}
          </span>

          <span
            className="
              ml-1
              mb-2
              text-xl
              font-bold
              text-gray-500
            "
          >
            %
          </span>
        </div>
      </div>
    </div>
  );
};

export default CircularScore;
