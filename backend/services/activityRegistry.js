const { PracticeAttempt, Assessment, PracticeSession, ExerciseAttempt } = require("../models");
const { Op } = require("sequelize");

// ---------------------------------------------------------------------
// Activity Provider Registry — decouples the stream engine
// (courseStreamService.getResumeItem) from any one activity's storage
// shape. Adding a future module (toefl_ibt, a listening discrimination
// lab, a roleplay simulation) means adding one more entry here, never
// touching the walk itself.
//
// Every provider takes (step, menteeId, runContext) — runContext is a
// live CourseRun instance (see progressionService.getOrCreateActiveRun/
// startNewRun) — and returns a boolean "is this step done, scoped to
// THIS run". This run-scoping is the actual bug fix: before
// course_run_id existed, isCompleted read `exercise_attempts`/
// `assessments.is_accepted` with no notion of "this pass through the
// course" at all, so a mentee's exercise submission from a PRIOR run
// satisfied progression on every future run forever, and "Practice
// Again" skipped straight past steps the mentee hadn't touched this
// time.
//
// The `runContext.id ? {course_run_id: ...} : {created_at: {gte: ...}}`
// fallback below is defensive, not load-bearing in this codebase today
// — every call site (courseStreamService.getResumeItem) always passes a
// persisted CourseRun with a real `id`, so the course_run_id branch is
// the one that actually runs. Kept as written for a future caller that
// might evaluate completion against a lighter, unpersisted run context
// (a dry-run preview, say) without ever creating a row for it.
// ---------------------------------------------------------------------

const activityRegistry = {
  content: {
    // Completed if an accepted speech attempt exists for this sentence,
    // WITHIN this run — joined all the way through to the
    // practice_attempts row that owns the practice_session, and scoped
    // by that attempt's course_run_id.
    isCompleted: async (step, menteeId, runContext) => {
      const attemptWhere = runContext.id
        ? { course_run_id: runContext.id }
        : { created_at: { [Op.gte]: runContext.started_at } };

      const accepted = await Assessment.findOne({
        where: { is_accepted: true },
        include: [
          {
            model: PracticeSession,
            required: true,
            where: { mentee_id: menteeId, lesson_sentence_id: step.id },
            include: [
              {
                model: PracticeAttempt,
                required: true,
                where: attemptWhere,
              },
            ],
          },
        ],
      });
      return Boolean(accepted);
    },
    // No per-sentence deep link exists in this codebase today — the
    // sentence-recording engine runs one practice_attempt across an
    // entire lesson's sentence set as a single state machine (see this
    // doc's Auto-Advance notes). Routing here always means "go resume/
    // start this lesson's attempt from the overview", not a specific
    // sentence — so this intentionally does NOT return the spec's
    // literal `/mentee/practice/:courseId/player/:step.id` (that would
    // treat a lesson_sentence id as a practice_attempt id, which is
    // simply wrong — ROUTES.practicePlayer's second segment is an
    // attempt id, never a sentence id).
    getRoute: (step, courseId) => `/mentee/lessons/${courseId}`,
  },

  assessment: {
    // Completed if attempted >= 1 time, WITHIN this run. No pass
    // requirement — a mentee who keeps failing must still be able to
    // move the stream forward; a passing score is what retakes are for.
    isCompleted: async (step, menteeId, runContext) => {
      const attemptWhere = {
        mentee_id: menteeId,
        exercise_id: step.id,
        ...(runContext.id
          ? { course_run_id: runContext.id }
          : { created_at: { [Op.gte]: runContext.started_at } }),
      };

      const count = await ExerciseAttempt.count({ where: attemptWhere });
      return count >= 1;
    },
    getRoute: (step, courseId) => `/mentee/practice/${courseId}/assessment/${step.id}`,
  },

  // Extensibility hook only — no `toefl_ibt` item_type exists anywhere
  // in getCoursePlayStream yet (no schema, no content authored). Left
  // here as a concrete example of what a future module's entry looks
  // like: `isCompleted` always false (never satisfied, so it would
  // never silently appear "done") until real evaluation logic lands,
  // `getRoute` following the same (step, courseId) contract as the
  // other two.
  toefl_ibt: {
    isCompleted: async (step, menteeId, runContext) => {
      return false;
    },
    getRoute: (step, courseId) => `/mentee/toefl/${step.id}?course=${courseId}`,
  },
};

module.exports = activityRegistry;
