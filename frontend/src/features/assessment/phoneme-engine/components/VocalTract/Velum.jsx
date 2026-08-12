import React from "react";
import { VELUM_TRANSFORMS } from "../../engine/animationEngine";

export default function Velum({ state = "raised", highlighted }) {
  const transform = VELUM_TRANSFORMS[state] || VELUM_TRANSFORMS.raised;

  return (
    <g
      className="anatomical-velum"
      transform={transform}
      style={{ transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      {/* Soft Palate & Uvula */}
      <path
        d="M 275,223 C 260,225 240,230 230,255 C 225,270 228,285 232,290 C 236,292 240,285 238,270 C 242,250 260,238 275,232 Z"
        fill={highlighted ? "#FF7043" : "#D98880"}
        stroke="#922B21"
        strokeWidth="2"
        filter={highlighted ? "drop-shadow(0px 0px 6px #FF5722)" : "none"}
      />
    </g>
  );
}
