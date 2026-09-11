const {
  PracticeAttempt,
  PracticeSession,
  LessonSentence,
  Lesson,
  Mentee,
  User,
} = require("../models");
const PRACTICE_ATTEMPT_STATUSES = require("../constants/practiceAttemptStatuses");
const PRACTICE_SESSION_STATUSES = require("../constants/practiceSessionStatuses");
const REVIEW_STATUSES = require("../constants/reviewStatuses");
const progressionService = require("./progressionService");
const { PASS_THRESHOLD } = require("../constants/progressionConfig");

const getOrCreatePracticeAttempt = async (menteeId, lessonId) => {
  let attempt = await PracticeAttempt.findOne({
    where: {
      mentee_id: menteeId,
      lesson_id: lessonId,
      status: PRACTICE_ATTEMPT_STATUSES.IN_PROGRESS,
      review_status: REVIEW_STATUSES.PENDING,
    },
  });

  if (attempt) {
    return {
      attempt,
      isResumed: true,
    };
  }
  const lastAttempt = await PracticeAttempt.findOne({
    where: {
      mentee_id: menteeId,

      lesson_id: lessonId,
    },

    order: [["id", "DESC"]],
  });
  const attemptNumber = lastAttempt ? lastAttempt.attempt_number + 1 : 1;

  // Course Run lifecycle — bind this new attempt to whatever run is
  // currently active (finds an in_progress one, or mints a fresh one).
  // "Practice Again" on LessonPracticePage.jsx calls
  // progressionService.startNewRun BEFORE reaching here (via POST
  // /lessons/:lessonId/start-run — see courseStreamController.startRun),
  // so by the time this runs there's a guaranteed-fresh run to attach
  // to. This is what makes run-scoped completion in
  // courseStreamService.getResumeItem/activityRegistry actually work:
  // without a course_run_id, a new attempt could never satisfy any
  // run-scoped isCompleted check, and old attempts from a prior run
  // would keep counting toward this one forever — the exact bug this
  // delivery fixes.
  const activeRun = await progressionService.getOrCreateActiveRun(lessonId, menteeId);

  attempt = await PracticeAttempt.create({
    mentee_id: menteeId,
    lesson_id: lessonId,
    attempt_number: attemptNumber,
    course_run_id: activeRun.id,
  });

  return {
    attempt,
    isResumed: false,
  };
};

const updateProgress = async (attemptId, sentenceOrder) => {
  await PracticeAttempt.update(
    {
      current_sentence_order: sentenceOrder,
    },

    {
      where: {
        id: attemptId,
      },
    },
  );
};
// Requirement 1.1 (self-paced progression): NOT a rubber stamp. Computes
// the attempt's overall_score from its submitted sentences and only
// flips status -> "submitted" (and advances the mentee's CEFR level)
// when that score clears PASS_THRESHOLD. review_status / mentor review
// are never consulted here — mentor review stays fully optional,
// formative feedback that can arrive before or after this call, never a
// gate on it.
//
// Below threshold: overall_score is still recorded (so the mentee sees
// where they stand), but status stays "in_progress" and completed_at
// stays unset — getOrCreatePracticeAttempt's existing resume query
// (status=in_progress AND review_status=pending) picks this exact
// attempt back up next time the mentee opens the lesson, so they can
// keep improving individual sentences (via the progressive-tries
// mechanism already in place) and re-call /complete once ready. Calling
// this again after passing is a safe no-op re-evaluation, not a re-grade
// — evaluateAndAdvanceCefr is itself idempotent.
const completeAttempt = async (attemptId) => {
  const attempt = await PracticeAttempt.findByPk(attemptId);
  if (!attempt) {
    throw new Error("Practice attempt not found");
  }

  const overallScore = await progressionService.computeAttemptOverallScore(
    attemptId,
  );
  const passed = overallScore !== null && overallScore >= PASS_THRESHOLD;

  if (passed) {
    await attempt.update({
      status: PRACTICE_ATTEMPT_STATUSES.SUBMITTED,
      overall_score: overallScore,
      completed_at: new Date(),
    });

    await progressionService.evaluateAndAdvanceCefr(attempt.mentee_id);
  } else {
    await attempt.update({
      overall_score: overallScore ?? 0,
    });
  }

  return { overallScore, passed, attempt };
};
const getMenteeAttempts = async (userId) => {
  const mentee = await Mentee.findOne({
    where: {
      user_id: userId,
    },
  });

  if (!mentee) {
    return [];
  }

  const attempts = await PracticeAttempt.findAll({
    where: {
      mentee_id: mentee.id,
    },

    include: [
      {
        model: Lesson,

        attributes: ["id", "title", "thumbnail"],
      },
    ],

    order: [["created_at", "DESC"]],
  });

  return attempts;
};
const getAttemptResult = async (attemptId, userId) => {
  const mentee = await Mentee.findOne({
    where: {
      user_id: userId,
    },
  });

  if (!mentee) {
    throw new Error("Mentee not found");
  }

  const attempt = await PracticeAttempt.findOne({
    where: {
      id: attemptId,
      mentee_id: mentee.id,
    },

    include: [
      {
        model: Lesson,
      },

      {
        model: PracticeSession,
        // A session now exists from the first /compare call onward —
        // results should only show real submissions, never a stray
        // in-progress/abandoned compare. required:false keeps the
        // attempt itself visible even if it has zero submitted
        // sessions.
        where: { status: PRACTICE_SESSION_STATUSES.SUBMITTED },
        required: false,

        include: [
          {
            model: LessonSentence,
          },
        ],

        order: [["id", "ASC"]],
      },
    ],
  });

  return attempt;
};
const getActiveAttempt = async (menteeId, lessonId) => {
  return await PracticeAttempt.findOne({
    where: {
      mentee_id: menteeId,
      lesson_id: lessonId,
      status: PRACTICE_ATTEMPT_STATUSES.IN_PROGRESS,
    },
    order: [["created_at", "DESC"]],
  });
};
module.exports = {
  getOrCreatePracticeAttempt,
  updateProgress,
  completeAttempt,
  getMenteeAttempts,
  getAttemptResult,
  getActiveAttempt,
};
