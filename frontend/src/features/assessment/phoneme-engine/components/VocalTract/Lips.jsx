import React from "react";
import { LIP_TRANSFORMS } from "../../animationEngine";

export default function Lips({ state = "slightly_open", highlighted }) {
  const upperTransform =
    LIP_TRANSFORMS.upper[state] || LIP_TRANSFORMS.upper.slightly_open;
  const lowerTransform =
    LIP_TRANSFORMS.lower[state] || LIP_TRANSFORMS.lower.slightly_open;

  const activeStyle = {
    fill: highlighted ? "#E91E63" : "#CD5C5C",
    stroke: "#7B1FA2",
    strokeWidth: "2px",
    transition: "transform 0.3s ease, fill 0.3s",
    filter: highlighted ? "drop-shadow(0px 0px 8px #F48FB1)" : "none",
  };

  return (
    <g className="anatomical-lips">
      {/* Upper Lip */}
      <path
        transform={upperTransform}
        d="M 382,275 C 395,275 415,285 410,300 C 400,305 385,295 380,288 Z"
        style={activeStyle}
      />
      {/* Lower Lip */}
      <path
        transform={lowerTransform}
        d="M 380,345 C 390,340 412,342 412,358 C 405,370 388,365 378,352 Z"
        style={activeStyle}
      />
    </g>
  );
}
