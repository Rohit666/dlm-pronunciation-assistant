// Milestone 5 cutover: getMenteeOverview / getMenteePhonemes /
// getScoreOverview hit the live GET /api/analytics/mentee/overview
// and /api/analytics/mentee/phonemes endpoints.
//
// Requirement 1.2 cutover: getDiscoveryCarousels / getCefrMilestones /
// getAttemptTrajectory now hit the live GET /api/mentee-dashboard/
// carousels, /milestones, and /attempt-trajectory endpoints. No mock
// imports, no synthetic delay timers remain in this file.
import api from "./api";

// Live: GET /api/mentee-dashboard/carousels
export const getDiscoveryCarousels = async () => {
  const response = await api.get("/mentee-dashboard/carousels");
  return response.data.carousels;
};

// Live: GET /api/mentee-dashboard/milestones
export const getCefrMilestones = async () => {
  const response = await api.get("/mentee-dashboard/milestones");
  return response.data.milestones;
};

// Live: GET /api/mentee-dashboard/attempt-trajectory. Returns null when
// the mentee has no graded attempt yet — AttemptTrajectoryChart.jsx
// already renders nothing for a null trajectory.
export const getAttemptTrajectory = async () => {
  const response = await api.get("/mentee-dashboard/attempt-trajectory");
  return response.data.trajectory;
};

// Live: GET /api/analytics/mentee/overview
export const getMenteeOverview = async () => {
  const response = await api.get("/analytics/mentee/overview");
  return response.data.overview;
};

// Live: GET /api/analytics/mentee/phonemes
export const getMenteePhonemes = async () => {
  const response = await api.get("/analytics/mentee/phonemes");
  return response.data;
};

// ScoreOverviewCard.jsx's contract is { accuracy, fluency, completeness
// }. Only `accuracy` is real: the ai-runtime pipeline has no
// fluency_score/completeness_score field (verified against its actual
// response schema, not assumed) — those two are omitted here rather
// than faked, and ScoreOverviewCard skips rendering a meter for a
// missing value instead of showing a fabricated number.
export const getScoreOverview = async () => {
  const overview = await getMenteeOverview();
  return { accuracy: overview.averageSubmittedAccuracy };
};
