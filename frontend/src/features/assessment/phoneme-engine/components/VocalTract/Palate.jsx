import React from "react";

export default function Palate({ highlighted }) {
  return (
    <g className="anatomical-palate">
      {/* Upper Maxilla & Nasal cavity bone boundary */}
      <path
        d="M 220,180 L 220,220 C 260,220 310,220 340,230 C 370,240 380,260 385,275 L 420,275 C 410,230 360,200 310,190 Z"
        fill="#E5C4B0"
        stroke="#8D5B4C"
        strokeWidth="2"
      />
      {/* Hard Palate Surface (Roof of Mouth) */}
      <path
        d="M 290,222 C 330,225 365,242 385,275"
        fill="none"
        stroke={highlighted ? "#FF5722" : "#A64B2A"}
        strokeWidth={highlighted ? "6" : "4"}
        strokeLinecap="round"
        style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
      />
      {/* Bone Texture Cross-hatching */}
      <path
        d="M 300,200 L 310,215 M 330,205 L 340,220 M 360,215 L 370,235"
        stroke="#C99D8B"
        strokeWidth="1.5"
      />
    </g>
  );
}
