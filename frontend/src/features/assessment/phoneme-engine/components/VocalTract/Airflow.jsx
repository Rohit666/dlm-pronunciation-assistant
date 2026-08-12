import React from "react";

export default function Airflow({ type = "none", visible = true }) {
  if (!visible || type === "none") return null;

  const isBurst = type === "burst";
  const isNasal = type === "nasal";

  return (
    <g className="airflow-indicator" opacity="0.85">
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2979FF" stopOpacity="0.95" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Oral Cavity Air Flow Path */}
      {!isNasal && (
        <path
          d={
            isBurst
              ? "M 200,430 Q 220,350 300,340 T 385,320 L 430,320"
              : "M 195,430 Q 220,330 290,320 T 370,310 L 440,310"
          }
          fill="none"
          stroke="url(#flowGrad)"
          strokeWidth={isBurst ? "12" : "6"}
          strokeDasharray={isBurst ? "16,8" : "8,4"}
          strokeLinecap="round"
          filter="url(#glow)"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="100;0"
            dur={isBurst ? "0.3s" : "0.8s"}
            repeatCount="indefinite"
          />
        </path>
      )}

      {/* Nasal Cavity Air Flow Path */}
      {isNasal && (
        <path
          d="M 200,430 Q 220,270 260,200 Q 300,180 380,185 L 430,185"
          fill="none"
          stroke="url(#flowGrad)"
          strokeWidth="7"
          strokeDasharray="6,4"
          strokeLinecap="round"
          filter="url(#glow)"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="80;0"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </path>
      )}
    </g>
  );
}
