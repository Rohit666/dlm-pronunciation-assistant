import React, { useState, useEffect, useRef } from "react";
import Tongue from "./Tongue";
import Lips from "./Lips";
import Teeth from "./Teeth";
import Jaw from "./Jaw";
import Palate from "./Palate";
import Velum from "./Velum";
import VocalFolds from "./VocalFolds";
import Airflow from "./Airflow";
import Labels from "./Labels";
import { TONGUE_PATHS, interpolatePath } from "../../animationEngine";
export default function VocalTract({
  phoneme,
  width = 700,
  height = 500,
  speed = 1,
  showLabels = true,
  showAirflow = true,
  loop = true,
  onAnimationStart,
  onArticulationReached,
  onAirflowStart,
  onAnimationComplete,
}) {
  // Phase state: 0=Neutral, 1=MovingToTarget, 2=TargetHold, 3=Returning
  const [phase, setPhase] = useState(0);
  const [tonguePath, setTonguePath] = useState(TONGUE_PATHS.neutral);
  const animFrameRef = useRef(null);

  const targetArt = phoneme?.articulation || {
    tonguePosition: "neutral",
    lips: "slightly_open",
    jaw: "closed",
    velum: "raised",
    vocalFolds: "still",
    airflow: "none",
  };

  // Timeline Orchestration Loop
  useEffect(() => {
    let startTime = null;
    let cancelled = false;

    // Timeline Durations scaled by speed prop (in ms)
    const moveDur = 400 / speed;
    const holdDur = 600 / speed;
    const returnDur = 400 / speed;
    const restDur = 300 / speed;

    const targetPath =
      TONGUE_PATHS[targetArt.tonguePosition] || TONGUE_PATHS.neutral;

    const animateTimeline = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < moveDur) {
        // Phase 1: Move from Neutral -> Target Articulation
        if (phase !== 1) {
          setPhase(1);
          if (onAnimationStart) onAnimationStart(phoneme);
        }
        const prog = elapsed / moveDur;
        setTonguePath(interpolatePath(TONGUE_PATHS.neutral, targetPath, prog));
      } else if (elapsed < moveDur + holdDur) {
        // Phase 2: Hold Peak Articulation (Trigger Airflow/Voicing)
        if (phase !== 2) {
          setPhase(2);
          setTonguePath(targetPath);
          if (onArticulationReached) onArticulationReached(phoneme);
          if (onAirflowStart) onAirflowStart(phoneme);
        }
      } else if (elapsed < moveDur + holdDur + returnDur) {
        // Phase 3: Return Articulators -> Neutral
        if (phase !== 3) setPhase(3);
        const prog = (elapsed - (moveDur + holdDur)) / returnDur;
        setTonguePath(interpolatePath(targetPath, TONGUE_PATHS.neutral, prog));
      } else if (elapsed < moveDur + holdDur + returnDur + restDur) {
        // Phase 0: Rest at neutral
        setPhase(0);
        setTonguePath(TONGUE_PATHS.neutral);
      } else {
        // Cycle Complete
        if (onAnimationComplete) onAnimationComplete(phoneme);
        if (loop && !cancelled) {
          startTime = timestamp;
        } else {
          return;
        }
      }

      if (!cancelled) {
        animFrameRef.current = requestAnimationFrame(animateTimeline);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateTimeline);

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phoneme, speed, loop]);

  // Derived active state conditions
  const isAtTarget = phase === 2;
  const currentJaw = isAtTarget ? targetArt.jaw : "closed";
  const currentLips = isAtTarget ? targetArt.lips : "slightly_open";
  const currentVelum = isAtTarget ? targetArt.velum : "raised";
  const currentFolds = isAtTarget ? targetArt.vocalFolds : "still";
  const currentAirflow = isAtTarget ? targetArt.airflow : "none";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 500 500"
      style={{
        background: "#F8F9FA",
        borderRadius: "12px",
        border: "1px solid #E0E0E0",
      }}
    >
      <defs>
        {/* Head Outline Pattern/Shadow */}
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Static Skull Cavity Backing Structure */}
      <g className="anatomical-cavity-background" filter="url(#shadow)">
        {/* Pharynx / Vocal Tract Outer Boundary */}
        <path
          d="M 180,140 C 260,130 380,140 420,200 C 430,220 420,280 430,380 C 350,490 220,480 160,450 Z"
          fill="#FFF3E0"
          stroke="#FFE0B2"
          strokeWidth="3"
        />
        {/* Pharyngeal Wall (Back of throat) */}
        <path
          d="M 220,220 C 210,280 205,360 200,440"
          fill="none"
          stroke="#D7CCC8"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* Interactive & Dynamic Articulators */}
      <Palate
        highlighted={isAtTarget && targetArt.tonguePosition === "velar"}
      />

      <Velum
        state={currentVelum}
        highlighted={isAtTarget && currentVelum === "lowered"}
      />

      <Jaw state={currentJaw}>
        <Tongue
          currentPath={tonguePath}
          highlighted={isAtTarget && targetArt.tonguePosition !== "neutral"}
        />
        <Teeth isJawLowered={currentJaw !== "closed"} />
      </Jaw>

      <Lips
        state={currentLips}
        highlighted={
          isAtTarget &&
          (targetArt.lips === "closed" || targetArt.lips === "rounded")
        }
      />

      <VocalFolds
        state={currentFolds}
        highlighted={isAtTarget && currentFolds === "vibrating"}
      />

      <Airflow type={currentAirflow} visible={showAirflow} />

      <Labels visible={showLabels} />
    </svg>
  );
}
