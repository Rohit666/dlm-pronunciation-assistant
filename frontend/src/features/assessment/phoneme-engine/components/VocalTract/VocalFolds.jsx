import React from "react";

export default function VocalFolds({ state = "still", highlighted }) {
  const isVibrating = state === "vibrating";

  return (
    <g className="anatomical-vocal-folds" transform="translate(195, 430)">
      {/* Larynx Housing */}
      <path
        d="M -15,-20 L 25,-20 L 15,30 L -25,30 Z"
        fill="#D50000"
        opacity="0.15"
      />

      {/* Left Fold */}
      <path
        d="M -12,-10 C -5,-10 -2,-2 -2,0 C -2,2 -5,10 -12,10"
        fill="none"
        stroke={isVibrating ? "#FF1744" : "#B0BEC5"}
        strokeWidth="4"
        strokeLinecap="round"
      >
        {isVibrating && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 3,0; 0,0; -2,0; 0,0"
            dur="0.08s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Right Fold */}
      <path
        d="M 12,-10 C 5,-10 2,-2 2,0 C 2,2 5,10 12,10"
        fill="none"
        stroke={isVibrating ? "#FF1744" : "#B0BEC5"}
        strokeWidth="4"
        strokeLinecap="round"
      >
        {isVibrating && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -3,0; 0,0; 2,0; 0,0"
            dur="0.08s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Glottis Glow effect during Voicing */}
      {isVibrating && (
        <ellipse cx="0" cy="0" rx="4" ry="8" fill="#FFEA00" opacity="0.85">
          <animate
            attributeName="opacity"
            values="0.2;1;0.2"
            dur="0.15s"
            repeatCount="indefinite"
          />
        </ellipse>
      )}
    </g>
  );
}
