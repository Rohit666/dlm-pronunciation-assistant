import { useState } from "react";

// Single-series line chart: score per attempt, converging toward a
// mastery threshold. One axis (score, 0-100) against attempt order.
// Indigo line (brand primary), dashed gray threshold reference line,
// direct label on the last point, hover tooltip per point.
const WIDTH = 560;
const HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 28, left: 32 };

function AttemptTrajectoryChart({ trajectory }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!trajectory || trajectory.attempts.length === 0) return null;

  const { attempts, masteryThreshold, lessonTitle } = trajectory;

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const xFor = (index) =>
    PADDING.left +
    (attempts.length === 1 ? 0 : (index / (attempts.length - 1)) * plotWidth);
  const yFor = (score) =>
    PADDING.top + plotHeight - (Math.min(100, score) / 100) * plotHeight;

  const linePath = attempts
    .map((attempt, index) => `${index === 0 ? "M" : "L"}${xFor(index)},${yFor(attempt.score)}`)
    .join(" ");

  const lastAttempt = attempts[attempts.length - 1];
  const hovered = hoverIndex !== null ? attempts[hoverIndex] : null;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Attempt-to-Mastery Trajectory</h3>
          <p className="text-sm text-gray-500 mt-1">{lessonTitle}</p>
        </div>
        <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-100 text-indigo-700">
          Mastery at {masteryThreshold}%
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Score per attempt for ${lessonTitle}, trending toward ${masteryThreshold}% mastery`}
      >
        {/* Mastery threshold reference line */}
        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={yFor(masteryThreshold)}
          y2={yFor(masteryThreshold)}
          stroke="#9ca3af"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
        <text
          x={WIDTH - PADDING.right}
          y={yFor(masteryThreshold) - 6}
          textAnchor="end"
          className="fill-gray-400 text-[10px]"
        >
          Mastery
        </text>

        {/* Score line */}
        <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth={2} strokeLinecap="round" />

        {/* Points */}
        {attempts.map((attempt, index) => (
          <g key={attempt.attemptNumber}>
            <circle
              cx={xFor(index)}
              cy={yFor(attempt.score)}
              r={hoverIndex === index ? 6 : 4}
              fill="#4f46e5"
              stroke="#fff"
              strokeWidth={2}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          </g>
        ))}

        {/* Direct label on the last point */}
        <text
          x={xFor(attempts.length - 1)}
          y={yFor(lastAttempt.score) - 12}
          textAnchor="end"
          className="fill-indigo-700 text-xs font-bold"
        >
          {lastAttempt.score}%
        </text>

        {/* X axis attempt numbers */}
        {attempts.map((attempt, index) => (
          <text
            key={attempt.attemptNumber}
            x={xFor(index)}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-gray-400 text-[10px]"
          >
            {attempt.attemptNumber}
          </text>
        ))}
      </svg>

      <div className="h-6 mt-1 text-sm text-gray-600">
        {hovered
          ? `Attempt ${hovered.attemptNumber}: ${hovered.score}%`
          : "Hover a point for attempt detail"}
      </div>
    </div>
  );
}

export default AttemptTrajectoryChart;
