import { Check, Lock } from "lucide-react";
import { cefrLevels } from "../../utils/cefrLevels";

// A1 -> C2 milestone badge track (SRS 3.1 "Gamified Progress: CEFR
// badge milestones"). Single-hue state indicator (achieved / current /
// locked), not a categorical palette, so no CVD concern — states are
// also always distinguished by icon + label, never fill alone.
function badgeState(status) {
  if (status === "achieved") {
    return { fill: "bg-indigo-600 text-white", ring: "" };
  }
  if (status === "current") {
    return { fill: "bg-white text-indigo-600", ring: "ring-4 ring-indigo-200" };
  }
  return { fill: "bg-gray-100 text-gray-400", ring: "" };
}

function CefrMilestoneTrack({ milestones }) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">CEFR Milestones</h3>

      <div className="flex items-start justify-between">
        {cefrLevels.map((level) => {
          const milestone = milestones.find((m) => m.level === level) ?? {
            status: "locked",
          };
          const { fill, ring } = badgeState(milestone.status);

          return (
            <div key={level} className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border border-gray-200 ${fill} ${ring}`}
              >
                {milestone.status === "achieved" ? (
                  <Check size={20} />
                ) : milestone.status === "locked" ? (
                  <Lock size={16} />
                ) : (
                  level
                )}
              </div>

              <p className="text-xs font-semibold text-gray-700 mt-2">{level}</p>

              <p className="text-[11px] text-gray-400 text-center mt-0.5 capitalize">
                {milestone.status.replace("_", " ")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CefrMilestoneTrack;
