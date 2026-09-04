// Shared tiering rule for the mentor "Student Tiering" board, matching
// the SRS 3.2 categories (Strong / Moderate / High-Attention). Kept as
// a pure function so the same rule applies whether the score came from
// mock data or a real analytics endpoint.

export const TIERS = {
  STRONG: { key: "strong", label: "Strong", colorClass: "text-green-700 bg-green-100" },
  MODERATE: { key: "moderate", label: "Moderate", colorClass: "text-amber-700 bg-amber-100" },
  NEEDS_ATTENTION: { key: "needs_attention", label: "Needs Attention", colorClass: "text-red-700 bg-red-100" },
};

export function tierForScore(avgScore) {
  if (avgScore >= 80) return TIERS.STRONG;
  if (avgScore >= 60) return TIERS.MODERATE;
  return TIERS.NEEDS_ATTENTION;
}

export function groupStudentsByTier(students) {
  const groups = {
    [TIERS.STRONG.key]: [],
    [TIERS.MODERATE.key]: [],
    [TIERS.NEEDS_ATTENTION.key]: [],
  };

  for (const student of students) {
    const tier = tierForScore(student.avgScore);
    groups[tier.key].push(student);
  }

  return groups;
}

export function heatmapColorClass(struggleRate) {
  if (struggleRate >= 40) return "bg-red-500";
  if (struggleRate >= 20) return "bg-amber-400";
  return "bg-green-500";
}
