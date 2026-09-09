const {
  sequelize,
  Mentee,
  Lesson,
  PracticeAttempt,
  PracticeSession,
  MenteeCefrMilestone,
} = require("../models");
const { Op, fn, col } = require("sequelize");
const { CEFR_LEVELS, nextLevel, isLevelLocked } = require("../constants/cefrLevels");
const PRACTICE_ATTEMPT_STATUSES = require("../constants/practiceAttemptStatuses");
const PRACTICE_SESSION_STATUSES = require("../constants/practiceSessionStatuses");
const LESSON_STATUSES = require("../constants/lessonStatuses");
const { PASS_THRESHOLD } = require("../constants/progressionConfig");

// Requirement 1.1: average of the OFFICIAL submitted score (practice_
// sessions.score — mirrored there by assessmentPersistenceService on
// every accepted submission) across every submitted session belonging
// to this attempt. null when the attempt has no submitted sessions yet
// (nothing to grade). Uses the same "PracticeSession" association
// practiceAttemptService already has loaded elsewhere in the codebase.
async function computeAttemptOverallScore(attemptId, transaction) {
  const result = await PracticeSession.findOne({
    attributes: [[fn("AVG", col("score")), "avgScore"]],
    where: {
      practice_attempt_id: attemptId,
      status: PRACTICE_SESSION_STATUSES.SUBMITTED,
    },
    raw: true,
    transaction,
  });

  if (!result || result.avgScore === null || result.avgScore === undefined) {
    return null;
  }

  return Math.round(Number(result.avgScore) * 100) / 100;
}

// A lesson is locked for a mentee if its cefr_level sits after the
// mentee's current_cefr_level in the CEFR order. Lessons with no CEFR
// level are never locked. Pure function — callers attach the boolean to
// whatever lesson payload they're already building.
function isLessonLocked(lessonCefrLevel, menteeCurrentLevel) {
  return isLevelLocked(lessonCefrLevel, menteeCurrentLevel);
}

// Requirement 1.1: "immediately advance the mentee's CEFR progress /
// lesson unlock sequence" once the final sentence of a lesson clears
// PASS_THRESHOLD. A CEFR level is cleared when EVERY published lesson at
// the mentee's current level has at least one submitted attempt scoring
// >= PASS_THRESHOLD (best attempt counts — a mentee doesn't lose credit
// for an earlier weak attempt on the same lesson). Idempotent: re-
// running this after the level is already cleared is a no-op (the
// unique index on mentee_cefr_milestones plus the currentLevel guard
// below prevent double-advancing).
async function evaluateAndAdvanceCefr(menteeId) {
  return sequelize.transaction(async (transaction) => {
    const mentee = await Mentee.findByPk(menteeId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!mentee) return { advanced: false, reason: "mentee_not_found" };

    const currentLevel = mentee.current_cefr_level;

    const lessonsAtLevel = await Lesson.findAll({
      where: { lesson_status: LESSON_STATUSES.PUBLISHED, cefr_level: currentLevel },
      attributes: ["id"],
      transaction,
    });

    // Nothing published at this level yet — nothing to clear. Avoids a
    // vacuous "0 of 0 lessons mastered" auto-advance.
    if (lessonsAtLevel.length === 0) {
      return { advanced: false, reason: "no_lessons_at_level", currentLevel };
    }

    const lessonIds = lessonsAtLevel.map((lesson) => lesson.id);

    const bestScoresByLesson = await PracticeAttempt.findAll({
      attributes: ["lesson_id", [fn("MAX", col("overall_score")), "bestScore"]],
      where: {
        mentee_id: menteeId,
        lesson_id: { [Op.in]: lessonIds },
        status: PRACTICE_ATTEMPT_STATUSES.SUBMITTED,
      },
      group: ["lesson_id"],
      raw: true,
      transaction,
    });

    const bestScoreByLessonId = new Map(
      bestScoresByLesson.map((row) => [row.lesson_id, Number(row.bestScore)]),
    );

    const masteredScores = lessonIds
      .map((id) => bestScoreByLessonId.get(id))
      .filter((score) => score !== undefined && score >= PASS_THRESHOLD);

    if (masteredScores.length < lessonIds.length) {
      return { advanced: false, reason: "level_incomplete", currentLevel };
    }

    const accuracyAtCompletion =
      Math.round(
        (masteredScores.reduce((sum, score) => sum + score, 0) /
          masteredScores.length) *
          100,
      ) / 100;

    const [, created] = await MenteeCefrMilestone.findOrCreate({
      where: { mentee_id: menteeId, cefr_level: currentLevel },
      defaults: {
        mentee_id: menteeId,
        cefr_level: currentLevel,
        accuracy_at_completion: accuracyAtCompletion,
        achieved_at: new Date(),
      },
      transaction,
    });

    if (!created) {
      // Milestone already recorded by an earlier call — level was
      // already advanced past, nothing further to do.
      return { advanced: false, reason: "already_milestoned", currentLevel };
    }

    const upgradedLevel = nextLevel(currentLevel);
    if (upgradedLevel) {
      await mentee.update({ current_cefr_level: upgradedLevel }, { transaction });
    }

    return {
      advanced: true,
      previousLevel: currentLevel,
      newLevel: upgradedLevel || currentLevel,
      accuracyAtCompletion,
    };
  });
}

// CEFR milestone track contract (matches CefrMilestoneTrack.jsx / the
// menteeInsightsMock.MOCK_CEFR_MILESTONES shape it replaces):
// [{ level, status: "achieved" | "current" | "locked", accuracyAtCompletion, dateAchieved }]
// for every level in CEFR_LEVELS.
async function getCefrProgress(menteeId) {
  const mentee = await Mentee.findByPk(menteeId);
  if (!mentee) return null;

  const milestoneRows = await MenteeCefrMilestone.findAll({
    where: { mentee_id: menteeId },
  });
  const milestoneByLevel = new Map(
    milestoneRows.map((row) => [row.cefr_level, row]),
  );

  const milestones = CEFR_LEVELS.map((level) => {
    const milestone = milestoneByLevel.get(level);
    let status = "locked";
    if (milestone) status = "achieved";
    else if (level === mentee.current_cefr_level) status = "current";
    return {
      level,
      status,
      accuracyAtCompletion: milestone
        ? Number(milestone.accuracy_at_completion)
        : null,
      dateAchieved: milestone ? milestone.achieved_at : null,
    };
  });

  return { currentLevel: mentee.current_cefr_level, milestones };
}

module.exports = {
  computeAttemptOverallScore,
  evaluateAndAdvanceCefr,
  getCefrProgress,
  isLessonLocked,
};
