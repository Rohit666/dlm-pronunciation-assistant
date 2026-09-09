const { sequelize, Batch, Mentee, Lesson, StudentProgression } = require("../models");
const {
  PROGRESSION_FRAMEWORKS,
  FRAMEWORK_LEVELS,
  DEFAULT_PASSING_THRESHOLD,
} = require("../constants/progressionFrameworks");

/**
 * Mentor-configured passing threshold, replacing the old hardcoded 70%
 * gate. Resolution order: the lesson's own override wins, then the
 * mentee's batch default, then a last-resort constant.
 *
 * `??` (not `||`) is deliberate — a mentor setting either threshold to
 * 0 is a valid, if unusual, pedagogical choice and must not be treated
 * as "unset".
 */
function resolvePassingThreshold(lesson, batch) {
  const lessonThreshold = lesson?.passing_score;
  if (lessonThreshold !== null && lessonThreshold !== undefined) {
    return Number(lessonThreshold);
  }

  const batchThreshold = batch?.default_passing_threshold;
  if (batchThreshold !== null && batchThreshold !== undefined) {
    return Number(batchThreshold);
  }

  return DEFAULT_PASSING_THRESHOLD;
}

function hasPassed(overallScore, threshold) {
  return Number(overallScore) >= threshold;
}

async function getOrCreateProgression(menteeId, framework, transaction) {
  const [progression] = await StudentProgression.findOrCreate({
    where: { mentee_id: menteeId, framework },
    defaults: {
      mentee_id: menteeId,
      framework,
      current_level_order: 0,
      current_level_code: null,
    },
    transaction,
  });

  return progression;
}

/**
 * Moves a mentee forward on `lesson`'s framework track, never backward
 * and never past what the lesson itself declares. A lesson with no
 * level_order isn't part of a tracked progression at all — e.g. a
 * revision/practice-only lesson slotted between milestone lessons —
 * so it's a no-op here, not an error.
 */
async function advanceProgression(menteeId, lesson, transaction) {
  const levelOrder = lesson.level_order;
  if (!Number.isInteger(levelOrder) || levelOrder < 1) {
    return null;
  }

  const framework = lesson.framework || PROGRESSION_FRAMEWORKS.CEFR;
  const progression = await getOrCreateProgression(
    menteeId,
    framework,
    transaction,
  );

  if (levelOrder <= progression.current_level_order) {
    return progression;
  }

  const levels = FRAMEWORK_LEVELS[framework] || [];
  await progression.update(
    {
      current_level_order: levelOrder,
      current_level_code: levels[levelOrder - 1] ?? progression.current_level_code,
    },
    { transaction },
  );

  return progression;
}

/**
 * Central gate for "did this lesson attempt qualify as complete?" —
 * call this instead of comparing overall_score to a hardcoded number.
 * Wraps threshold resolution + (conditional) progression advancement in
 * one transaction so a mentee is never advanced without the score that
 * justified it, or vice versa (CLAUDE.md: atomic state & DB updates).
 *
 * Pass an existing `transaction` to compose into a caller's own
 * transaction (e.g. alongside the review save); omit it to run
 * standalone.
 */
async function evaluateLessonCompletion({
  menteeId,
  lessonId,
  overallScore,
  transaction,
}) {
  const run = async (t) => {
    const lesson = await Lesson.findByPk(lessonId, { transaction: t });
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const mentee = await Mentee.findByPk(menteeId, { transaction: t });
    if (!mentee) {
      throw new Error("Mentee not found");
    }

    const batch = mentee.batch_id
      ? await Batch.findByPk(mentee.batch_id, { transaction: t })
      : null;

    const threshold = resolvePassingThreshold(lesson, batch);
    const passed = hasPassed(overallScore, threshold);

    const progression = passed
      ? await advanceProgression(menteeId, lesson, t)
      : null;

    return { passed, threshold, progression };
  };

  if (transaction) {
    return run(transaction);
  }

  return sequelize.transaction(run);
}

module.exports = {
  resolvePassingThreshold,
  hasPassed,
  evaluateLessonCompletion,
};
