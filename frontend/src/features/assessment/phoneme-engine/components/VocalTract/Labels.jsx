import React from "react";

export default function Labels({ visible = true }) {
  if (!visible) return null;

  const labelData = [
    { text: "Nasal Cavity", x: 320, y: 150, cx: 320, cy: 180 },
    { text: "Hard Palate", x: 410, y: 210, cx: 340, cy: 230 },
    { text: "Soft Palate / Velum", x: 150, y: 210, cx: 255, cy: 235 },
    { text: "Tongue Tip", x: 450, y: 370, cx: 370, cy: 330 },
    { text: "Lips", x: 450, y: 290, cx: 400, cy: 290 },
    { text: "Vocal Folds (Larynx)", x: 70, y: 435, cx: 180, cy: 435 },
  ];

  return (
    <g className="anatomical-labels" pointerEvents="none">
      {labelData.map((item, idx) => (
        <g key={idx}>
          {/* Pointer line */}
          <line
            x1={item.x}
            y1={item.y}
            x2={item.cx}
            y2={item.cy}
            stroke="#37474F"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
          {/* Anchor Dot */}
          <circle cx={item.cx} cy={item.cy} r="3" fill="#00897B" />
          {/* Label Text */}
          <text
            x={item.x}
            y={item.y - 4}
            fill="#263238"
            fontSize="12"
            fontWeight="600"
            fontFamily="system-ui, sans-serif"
            textAnchor={item.x < item.cx ? "end" : "start"}
          >
            {item.text}
          </text>
        </g>
      ))}
    </g>
  );
}
