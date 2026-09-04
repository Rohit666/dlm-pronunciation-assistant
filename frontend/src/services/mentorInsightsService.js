// Demo stub layer for the mentor analytics widgets (phoneme heatmap,
// student tiering, attempt-to-mastery trajectory). Same swap-in-later
// contract as services/menteeInsightsService.js.
import {
  MOCK_PHONEME_HEATMAP,
  MOCK_STUDENT_PERFORMANCE,
  MOCK_ATTEMPT_TRAJECTORY_METRICS,
} from "../mock/mentorInsightsMock";
import { groupStudentsByTier } from "../utils/studentTiering";

const resolve = (value, delay = 250) =>
  new Promise((res) => setTimeout(() => res(value), delay));

// GET /analytics/phoneme-heatmap (proposed)
export const getPhonemeHeatmap = async () => resolve(MOCK_PHONEME_HEATMAP);

// GET /analytics/student-tiers (proposed)
export const getStudentTiers = async () =>
  resolve(groupStudentsByTier(MOCK_STUDENT_PERFORMANCE));

// GET /analytics/attempt-trajectory (proposed)
export const getAttemptTrajectoryMetrics = async () =>
  resolve(MOCK_ATTEMPT_TRAJECTORY_METRICS);
