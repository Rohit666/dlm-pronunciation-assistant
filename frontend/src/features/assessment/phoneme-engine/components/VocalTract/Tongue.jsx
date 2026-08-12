import React from "react";

export default function Tongue({ currentPath, highlighted }) {
  return (
    <g className="anatomical-tongue">
      {/* Main Muscle Mass */}
      <path
        d={currentPath}
        fill={highlighted ? "#FF5252" : "#E57373"}
        stroke="#C62828"
        strokeWidth="3"
        strokeLinejoin="round"
        style={{
          transition: "fill 0.3s",
          filter: highlighted
            ? "drop-shadow(0px 0px 10px rgba(255,82,82,0.8))"
            : "none",
        }}
      />
      {/* Surface Muscle Texture Lines */}
      <path
        d={currentPath}
        fill="none"
        stroke="#FFEBEE"
        strokeWidth="1"
        strokeDasharray="4,6"
        opacity="0.6"
      />
    </g>
  );
}
