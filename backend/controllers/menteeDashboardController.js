const {
  Mentee,
  Batch,
  PracticeSession,
  PracticeAttempt,
  Lesson,
  LessonSentence,
} = require("../models");
const { Op, fn, col } = require("sequelize");
const PRACTICE_SESSION_STATUSES = require("../constants/practiceSessionStatuses");
const PRACTICE_ATTEMPT_STATUSES = require("../constants/practiceAttemptStatuses");
const LESSON_STATUSES = require("../constants/lessonStatuses");
const { parseJsonField } = require("../utils/jsonHelper");
const progressionService = require("../services/progressionService");
const menteeInsightsService = require("../services/menteeInsightsService");
const { PASS_THRESHOLD } = require("../constants/progressionConfig");

const WEAK_SOUNDS_PHONEME_LIMIT = 5;
const CAROUSEL_LESSON_LIMIT = 10;

async function resolveMentee(userId) {
  return Mentee.findOne({ where: { user_id: userId } });
}

exports.getMenteeDashboard = async (req, res) => {
  try {
    const mentee = await Mentee.findOne({
      where: {
        user_id: req.user.id,
      },

      include: [
        {
          model: Batch,
          attributes: ["id", "batch_name", "description"],
        },
      ],
    });

    const practiceCount = await PracticeSession.count({
      where: {
        mentee_id: mentee?.id,
        // A session now exists from the first /compare call onward —
        // only count real submissions, not in-flight/abandoned ones.
        status: PRACTICE_SESSION_STATUSES.SUBMITTED,
      },
    });

    const rawLessons = await Lesson.findAll({
      limit: 6,
      where: {
        lesson_status: LESSON_STATUSES.PUBLISHED,
      },
      order: [["id", "DESC"]],
    });

    // Requirement 3.1: lesson-unlock is computed on read, never stored —
    // a lesson is locked if it sits at a CEFR level past what this
    // mentee has cleared. Mentor/admin lesson-management consumers of
    // getLessons (lessonController.js) are untouched by this; only the
    // mentee dashboard/lesson browsing surfaces need it.
    const currentCefrLevel = mentee?.current_cefr_level || "A1";
    const lessons = rawLessons.map((lesson) => {
      const lessonJson = lesson.toJSON();
      return {
        ...lessonJson,
        target_skills: parseJsonField(lesson.target_skills),
        locked: progressionService.isLessonLocked(
          lesson.cefr_level,
          currentCefrLevel,
        ),
      };
    });

    res.json({
      success: true,

      stats: {
        practiceCount,
      },

      mentee,
      currentCefrLevel,
      lessons,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// Requirement 1.2 — GET /api/mentee-dashboard/milestones. Replaces
// MOCK_CEFR_MILESTONES; shape unchanged
// ({level, status, accuracyAtCompletion, dateAchieved} per CEFR level)
// so CefrMilestoneTrack.jsx needs no changes.
exports.getCefrMilestones = async (req, res) => {
  try {
    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const progress = await progressionService.getCefrProgress(mentee.id);
    res.json({ success: true, milestones: progress.milestones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Requirement 1.2 — GET /api/mentee-dashboard/attempt-trajectory.
// Replaces MOCK_ATTEMPT_TRAJECTORY. AttemptTrajectoryChart.jsx's
// contract is per-lesson: one point per attempt_number, converging on a
// mastery threshold. Picks the mentee's most recently active lesson
// (their latest practice_attempts row) and plots overall_score across
// every attempt_number completeAttempt has ever graded for it —
// including in-progress ones, since completeAttempt now records a
// (possibly sub-threshold) overall_score on every call, not only a
// passing one.
exports.getAttemptTrajectory = async (req, res) => {
  try {
    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const latestAttempt = await PracticeAttempt.findOne({
      where: { mentee_id: mentee.id, overall_score: { [Op.ne]: null } },
      include: [{ model: Lesson, attributes: ["id", "title"] }],
      order: [["updated_at", "DESC"]],
    });

    if (!latestAttempt) {
      return res.json({ success: true, trajectory: null });
    }

    const attempts = await PracticeAttempt.findAll({
      where: {
        mentee_id: mentee.id,
        lesson_id: latestAttempt.lesson_id,
        overall_score: { [Op.ne]: null },
      },
      order: [["attempt_number", "ASC"]],
      attributes: ["attempt_number", "overall_score"],
    });

    res.json({
      success: true,
      trajectory: {
        lessonTitle: latestAttempt.Lesson?.title || "",
        masteryThreshold: PASS_THRESHOLD,
        attempts: attempts.map((attempt) => ({
          attemptNumber: attempt.attempt_number,
          score: Number(attempt.overall_score),
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Requirement 1.2 — GET /api/mentee-dashboard/carousels. Replaces
// getDiscoveryCarousels's mock. Shape unchanged
// ({upNext, weakSounds, continuePracticing, watchlist}, each an array of
// lesson-card objects) so CarouselRow/CarouselLessonCard need no
// changes.
//
// Two scope gaps carried over from the mock and NOT silently invented
// here (same discipline as the Milestone 5/6 cutover):
//   - weakSounds: lessons don't carry a per-lesson target-phoneme list
//     (no schema column for it — the mock's `targetPhonemes` was
//     demo-only). Matched instead by lesson_type='pronunciation_drill',
//     tagged with the mentee's own top weak phonemes (from
//     menteeInsightsService.getMenteePhonemes) as a *global* focus
//     hint, not a proven per-lesson match.
//   - watchlist: no bookmarks table exists anywhere in the schema.
//     Returns [] rather than fabricating a bookmarking feature that was
//     never asked for.
exports.getDiscoveryCarousels = async (req, res) => {
  try {
    const mentee = await resolveMentee(req.user.id);
    if (!mentee) {
      return res.status(404).json({ success: false, message: "Mentee not found" });
    }

    const currentCefrLevel = mentee.current_cefr_level;

    const attemptRows = await PracticeAttempt.findAll({
      where: { mentee_id: mentee.id },
      attributes: ["lesson_id", "status", "current_sentence_order"],
    });
    const attemptedLessonIds = new Set(attemptRows.map((row) => row.lesson_id));
    const inProgressByLesson = new Map(
      attemptRows
        .filter((row) => row.status === PRACTICE_ATTEMPT_STATUSES.IN_PROGRESS)
        .map((row) => [row.lesson_id, row]),
    );

    const [upNextLessons, weakSoundLessons, inProgressLessonIds] = await Promise.all([
      Lesson.findAll({
        where: {
          lesson_status: LESSON_STATUSES.PUBLISHED,
          cefr_level: currentCefrLevel,
          id: { [Op.notIn]: [...attemptedLessonIds, 0] },
        },
        limit: CAROUSEL_LESSON_LIMIT,
        order: [["id", "DESC"]],
      }),
      Lesson.findAll({
        where: {
          lesson_status: LESSON_STATUSES.PUBLISHED,
          lesson_type: "pronunciation_drill",
          id: { [Op.notIn]: [...attemptedLessonIds, 0] },
        },
        limit: CAROUSEL_LESSON_LIMIT,
        order: [["id", "DESC"]],
      }),
      Lesson.findAll({
        where: {
          lesson_status: LESSON_STATUSES.PUBLISHED,
          id: { [Op.in]: [...inProgressByLesson.keys(), 0] },
        },
      }),
    ]);

    const { weakestPhonemes } = await menteeInsightsService.getMenteePhonemes(
      mentee.id,
    );
    const topWeakSymbols = weakestPhonemes
      .slice(0, WEAK_SOUNDS_PHONEME_LIMIT)
      .map((phoneme) => phoneme.symbol);

    // total sentence counts for in-progress lessons, so "progress" is a
    // real percentage rather than a guess.
    const sentenceCounts = await LessonSentence.findAll({
      where: { lesson_id: { [Op.in]: [...inProgressByLesson.keys(), 0] } },
      attributes: ["lesson_id", [fn("COUNT", col("id")), "count"]],
      group: ["lesson_id"],
      raw: true,
    });
    const sentenceCountByLesson = new Map(
      sentenceCounts.map((row) => [row.lesson_id, Number(row.count)]),
    );

    const toCard = (lesson, extra = {}) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      thumbnail: lesson.thumbnail,
      cefrLevel: lesson.cefr_level,
      status: "not_started",
      progress: 0,
      locked: progressionService.isLessonLocked(
        lesson.cefr_level,
        currentCefrLevel,
      ),
      ...extra,
    });

    const upNext = upNextLessons.map((lesson) => toCard(lesson));

    const weakSounds = weakSoundLessons.map((lesson) =>
      toCard(lesson, { matchedPhonemes: topWeakSymbols }),
    );

    const continuePracticing = inProgressLessonIds.map((lesson) => {
      const attempt = inProgressByLesson.get(lesson.id);
      const totalSentences = sentenceCountByLesson.get(lesson.id) || 0;
      const progress = totalSentences
        ? Math.min(
            100,
            Math.round(
              (Math.max(0, (attempt?.current_sentence_order || 1) - 1) /
                totalSentences) *
                100,
            ),
          )
        : 0;
      return toCard(lesson, { status: "in_progress", progress });
    });

    res.json({
      success: true,
      carousels: {
        upNext,
        weakSounds,
        continuePracticing,
        // No bookmarks table exists — see note above.
        watchlist: [],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
