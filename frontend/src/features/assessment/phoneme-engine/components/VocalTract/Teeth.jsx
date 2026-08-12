import React from "react";

export default function Teeth({ isJawLowered }) {
  return (
    <g className="anatomical-teeth">
      {/* Upper Incisors (Fixed to Maxilla) */}
      <g className="upper-teeth">
        <path
          d="M 385,275 C 387,290 382,305 378,310 C 374,310 372,295 375,275 Z"
          fill="#FFFFFF"
          stroke="#B0BEC5"
          strokeWidth="1.5"
        />
        <path d="M 378,275 L 374,308" stroke="#ECEFF1" strokeWidth="1" />
      </g>

      {/* Lower Incisors (Attached to Mandible frame) */}
      <g
        className="lower-teeth"
        transform={isJawLowered ? "translate(2, 6)" : "translate(0, 0)"}
      >
        <path
          d="M 375,340 C 373,355 378,368 381,368 C 384,368 385,355 382,340 Z"
          fill="#FFFFFF"
          stroke="#B0BEC5"
          strokeWidth="1.5"
        />
      </g>
    </g>
  );
}
