import React, { useState } from "react";
import VocalTract from "./components/VocalTract/VocalTract";

// Import Phoneme Configurations
import theta from "./phonemes/theta";
import p from "./phonemes/p";
import b from "./phonemes/b";
import t from "./phonemes/t";
import d from "./phonemes/d";
import k from "./phonemes/k";
import g from "./phonemes/g";
import f from "./phonemes/f";
import v from "./phonemes/v";

const PHONEMES = [theta, p, b, t, d, k, g, f, v];

export default function App() {
  const [selectedPhoneme, setSelectedPhoneme] = useState(theta);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showAirflow, setShowAirflow] = useState(true);
  const [statusText, setStatusText] = useState("Idle");

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h2>44 Phonemes Articulation Engine</h2>

      {/* Selector Controls */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {PHONEMES.map((item) => (
          <button
            key={item.ipa}
            onClick={() => setSelectedPhoneme(item)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border:
                selectedPhoneme.ipa === item.ipa
                  ? "2px solid #1976D2"
                  : "1px solid #CCC",
              background: selectedPhoneme.ipa === item.ipa ? "#E3F2FD" : "#FFF",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {item.ipa} ({item.name.split(" ")[0]})
          </button>
        ))}
      </div>

      {/* Main Stage */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <VocalTract
          phoneme={selectedPhoneme}
          width={600}
          height={480}
          speed={speed}
          showLabels={showLabels}
          showAirflow={showAirflow}
          loop={true}
          onAnimationStart={(p) =>
            setStatusText(`Moving articulators for ${p.ipa}`)
          }
          onArticulationReached={(p) =>
            setStatusText(`Peak articulation reached for ${p.ipa}`)
          }
          onAirflowStart={(p) =>
            setStatusText(`Airflow active (${p.articulation.airflow})`)
          }
          onAnimationComplete={() =>
            setStatusText("Cycle completed. Resetting...")
          }
        />

        {/* Control Panel Sidebar */}
        <div
          style={{
            flex: 1,
            minWidth: "250px",
            background: "#F5F5F5",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <h3>
            {selectedPhoneme.name}{" "}
            <span style={{ color: "#1976D2" }}>{selectedPhoneme.ipa}</span>
          </h3>

          <div style={{ margin: "16px 0" }}>
            <label>
              <strong>Playback Speed:</strong> {speed}x
            </label>
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ width: "100%", marginTop: "8px" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <label
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              Show Anatomical Labels
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <input
                type="checkbox"
                checked={showAirflow}
                onChange={(e) => setShowAirflow(e.target.checked)}
              />
              Show Airflow Vectors
            </label>
          </div>

          <div style={{ borderTop: "1px solid #DDD", paddingTop: "12px" }}>
            <h4>State Telemetry:</h4>
            <p>
              <strong>Status:</strong> {statusText}
            </p>
            <ul
              style={{
                paddingLeft: "20px",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              <li>
                <strong>Tongue:</strong>{" "}
                {selectedPhoneme.articulation.tonguePosition}
              </li>
              <li>
                <strong>Lips:</strong> {selectedPhoneme.articulation.lips}
              </li>
              <li>
                <strong>Jaw:</strong> {selectedPhoneme.articulation.jaw}
              </li>
              <li>
                <strong>Velum:</strong> {selectedPhoneme.articulation.velum}
              </li>
              <li>
                <strong>Vocal Folds:</strong>{" "}
                {selectedPhoneme.articulation.vocalFolds}
              </li>
              <li>
                <strong>Airflow:</strong> {selectedPhoneme.articulation.airflow}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
