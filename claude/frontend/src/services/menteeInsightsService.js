// Demo stub layer for the mentee discovery/milestone widgets. Every
// export here is what the real service will look like once the
// backend persists per-attempt phoneme results (see Gap Assessment) —
// swap the mock import + resolve() body for `api.get(...)` and no
// caller needs to change, since the return shape is already final.
import {
  MOCK_STUDENT_WEAK_PHONEMES,
  MOCK_LESSON_CATALOG,
  MOCK_WATCHLIST_LESSON_IDS,
  MOCK_CEFR_MILESTONES,
  MOCK_SCORE_OVERVIEW,
  MOCK_ATTEMPT_TRAJECTORY,
} from "../mock/menteeInsightsMock";
import { recommendLessonsForWeakPhonemes } from "../utils/recommendationHeuristic";

// Simulated network latency so loading states are visible in the demo.
const resolve = (value, delay = 250) =>
  new Promise((res) => setTimeout(() => res(value), delay));

// GET /mentee-dashboard/carousels (proposed)
export const getDiscoveryCarousels = async () => {
  const catalog = MOCK_LESSON_CATALOG;

  const upNext = catalog.filter(
    (lesson) => lesson.status === "not_started" && lesson.cefrLevel !== "C1",
  );

  const weakSounds = recommendLessonsForWeakPhonemes(
    MOCK_STUDENT_WEAK_PHONEMES,
    catalog,
  );

  const continuePracticing = catalog.filter(
    (lesson) => lesson.status === "in_progress",
  );

  const watchlist = catalog.filter((lesson) =>
    MOCK_WATCHLIST_LESSON_IDS.includes(lesson.id),
  );

  return resolve({ upNext, weakSounds, continuePracticing, watchlist });
};

// GET /mentee-dashboard/milestones (proposed)
export const getCefrMilestones = async () => resolve(MOCK_CEFR_MILESTONES);

// GET /mentee-dashboard/score-overview (proposed)
export const getScoreOverview = async () => resolve(MOCK_SCORE_OVERVIEW);

// GET /mentee-dashboard/attempt-trajectory (proposed)
export const getAttemptTrajectory = async () => resolve(MOCK_ATTEMPT_TRAJECTORY);
