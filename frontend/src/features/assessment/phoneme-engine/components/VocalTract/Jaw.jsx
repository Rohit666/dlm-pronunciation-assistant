import React from "react";
import { JAW_TRANSFORMS } from "../../engine/animationEngine";

export default function Jaw({ state = "closed", children }) {
  const transform = JAW_TRANSFORMS[state] || JAW_TRANSFORMS.closed;

  return (
    <g
      className="anatomical-jaw"
      transform={transform}
      style={{ transition: "transform 0.35s ease-out" }}
    >
      {/* Mandible Bone Outline */}
      <path
        d="M 180,420 C 200,430 280,450 350,420 C 380,405 385,380 380,365 L 350,365 C 340,390 280,410 180,390 Z"
        fill="#E5C4B0"
        stroke="#8D5B4C"
        strokeWidth="2"
        opacity="0.85"
      />
      {children}
    </g>
  );
}
