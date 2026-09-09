// Milestone 6 cutover: getPhonemeHeatmap / getStudentTiers now hit the
// live GET /api/analytics/mentor/cohort-heatmap and
// /api/analytics/mentor/student-tiers endpoints — no mock, no
// synthetic delay.
//
// Still mock: getAttemptTrajectoryMetrics (per-lesson avg-attempts-to-
// mastery across the whole cohort, feeding AttemptTrajectoryMetrics.jsx
// on the mentor Analytics page). No corresponding endpoint was in this
// milestone's scope, so it's left exactly as it was rather than
// guessing at an undiscussed route.
import api from "./api";
import { MOCK_ATTEMPT_TRAJECTORY_METRICS } from "../mock/mentorInsightsMock";
import { groupStudentsByTier } from "../utils/studentTiering";

const resolve = (value, delay = 250) =>
  new Promise((res) => setTimeout(() => res(value), delay));

// Live: GET /api/analytics/mentor/cohort-heatmap. `batchId` optional —
// omit to see every batch this mentor owns.
export const getPhonemeHeatmap = async (batchId) => {
  const response = await api.get("/analytics/mentor/cohort-heatmap", {
    params: batchId ? { batch_id: batchId } : {},
  });
  return response.data.heatmap;
};

// Live: GET /api/analytics/mentor/student-tiers. Backend returns a
// flat per-student list (avgScore/attempts/avgRetriesPerSentence) —
// tiering into Strong/Moderate/Needs Attention stays a client-side
// concern via the existing groupStudentsByTier, which already
// implements the exact same >=80 / 60-79.99 / <60 thresholds, so the
// boundary rule lives in one place, not duplicated server + client.
export const getStudentTiers = async (batchId) => {
  const response = await api.get("/analytics/mentor/student-tiers", {
    params: batchId ? { batch_id: batchId } : {},
  });
  return groupStudentsByTier(response.data.students);
};

// GET /analytics/attempt-trajectory (proposed) — still mock.
export const getAttemptTrajectoryMetrics = async () =>
  resolve(MOCK_ATTEMPT_TRAJECTORY_METRICS);
