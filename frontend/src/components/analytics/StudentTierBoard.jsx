import { TIERS } from "../../utils/studentTiering";

// Strong / Moderate / Needs Attention columns (SRS 3.2 "Tiered Student
// Segmentation"). Tier is always shown as a text label + count header,
// column color is a secondary cue, never the only signal.
const COLUMNS = [TIERS.STRONG, TIERS.MODERATE, TIERS.NEEDS_ATTENTION];

function StudentTierBoard({ tiers }) {
  if (!tiers) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Student Tiering</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((tier) => {
          const students = tiers[tier.key] ?? [];

          return (
            <div key={tier.key}>
              <div
                className={`flex items-center justify-between px-4 py-2 rounded-xl mb-3 ${tier.colorClass}`}
              >
                <span className="text-sm font-semibold">{tier.label}</span>
                <span className="text-sm font-bold">{students.length}</span>
              </div>

              <div className="space-y-2">
                {students.length === 0 && (
                  <p className="text-sm text-gray-400 px-1">No students in this tier</p>
                )}

                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{student.email}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-700 shrink-0 ml-3">
                      {student.avgScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentTierBoard;
