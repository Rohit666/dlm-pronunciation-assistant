const { Mentee, Lesson, PracticeAttempt, sequelize, Sequelize } = require("../models");
const { parseJsonArray } = require("../utils/jsonUtils");
const REVIEW_STATUSES = require("../constants/reviewStatuses");
const LESSON_STATUSES = require("../constants/lessonStatuses");
const ERROR_MESSAGES = require("../constants/errorMessages");
const {
  PROFILE_REQUIRED_ATTEMPTS,
  WEAK_THRESHOLD,
} = require("../constants/recommendationConfig");
const { FUNCTION_WORDS, isFunctionWord } = require("../constants/functionWords");
const menteeInsightsService = require("./menteeInsightsService");

const { QueryTypes } = Sequelize;

// Requirement 3.2 tuning. Not exposed via recommendationConfig.js since
// that file's constants are specific to the existing outcome-based
// engine below — these are new, adaptive-engine-specific thresholds.
const VOCABULARY_DELETION_RATE_THRESHOLD = 20; // % — spec: "exceed 20%"
const GRAMMAR_SUBSTITUTION_RATE_THRESHOLD = 30; // % of function-word occurrences
const WEAK_PHONEME_ERROR_RATE_THRESHOLD = 30; // % — matches WEAK_THRESHOLD's spirit
const RECENT_ASSESSMENTS_FOR_VOCAB = 10;
const MAX_LESSONS_PER_PATH = 3;
const MAX_TOTAL_RECOMMENDATIONS = 6;

const getWeakOutcomesForMentee = async (menteeId) => {
  const attempts = await PracticeAttempt.findAll({
    where: {
      mentee_id: menteeId,
      review_status: REVIEW_STATUSES.REVIEWED,
    },
    include: [
      {
        model: Lesson,
      },
    ],
  });
  const outcomeMap = {};
  attempts.forEach((attempt) => {
    const outcomes = parseJsonArray(attempt.Lesson?.lesson_outcomes);
    outcomes.forEach((outcome) => {
      if (!outcomeMap[outcome]) {
        outcomeMap[outcome] = {
          totalScore: 0,
          attempts: 0,
        };
      }
      outcomeMap[outcome].totalScore += Number(attempt.overall_score || 0);
      outcomeMap[outcome].attempts += 1;
    });
  });
  return Object.entries(outcomeMap)
    .map(([outcome, data]) => ({
      outcome,
      averageScore: data.totalScore / data.attempts,
    }))
    .filter((item) => item.averageScore < WEAK_THRESHOLD);
};
const getLearningProfile = (reviewedAttempts) => {
  const progress = Math.min(
    100,
    Math.round((reviewedAttempts / PROFILE_REQUIRED_ATTEMPTS) * 100),
  );
  if (reviewedAttempts === 0) {
    return {
      state: "cold_start",
      progress: 0,
      title: "Start Your Learning Journey",
      message:
        "Complete your first practice session and mentor review to unlock personalized recommendations.",
      reviewedAttempts,
      requiredAttempts: PROFILE_REQUIRED_ATTEMPTS,
    };
  }
  if (reviewedAttempts < PROFILE_REQUIRED_ATTEMPTS) {
    return {
      state: "learning",
      progress,
      title: "Building Your Learning Profile",
      message: `Complete ${
        PROFILE_REQUIRED_ATTEMPTS - reviewedAttempts
      } more reviewed practice ${
        PROFILE_REQUIRED_ATTEMPTS - reviewedAttempts === 1
          ? "session"
          : "sessions"
      } to unlock personalized recommendations.`,
      reviewedAttempts,
      requiredAttempts: PROFILE_REQUIRED_ATTEMPTS,
    };
  }

  return {
    state: "personalized",
    progress: 100,
    title: "Personalized Learning Active",
    message:
      "Your recommendations are now personalized based on your pronunciation performance.",
    reviewedAttempts,
    requiredAttempts: PROFILE_REQUIRED_ATTEMPTS,
  };
};
const getRecommendationsForMentee = async (userId) => {
  const revisionLessons = [];
  const nextLessons = [];
  const mentee = await Mentee.findOne({
    where: {
      user_id: userId,
    },
  });
  if (!mentee) {
    if (!mentee) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }
  }
  const reviewedAttempts = await PracticeAttempt.count({
    where: {
      mentee_id: mentee.id,
      review_status: REVIEW_STATUSES.REVIEWED,
    },
  });
  let learningProfile = getLearningProfile(reviewedAttempts);
  const weakOutcomes = await getWeakOutcomesForMentee(mentee.id);

  if (
    reviewedAttempts >= PROFILE_REQUIRED_ATTEMPTS &&
    weakOutcomes.length === 0
  ) {
    learningProfile = {
      state: "excellent",
      progress: 100,
      title: "Excellent Progress!",
      message:
        "You're consistently performing well. Continue exploring advanced lessons to further strengthen your pronunciation.",
      reviewedAttempts,
      requiredAttempts: PROFILE_REQUIRED_ATTEMPTS,
    };
  }
  const lessons = await Lesson.findAll({
    where: {
      lesson_status: LESSON_STATUSES.PUBLISHED,
    },
  });
  const completedAttempts = await PracticeAttempt.findAll({
    where: {
      mentee_id: mentee.id,
      review_status: REVIEW_STATUSES.REVIEWED,
    },
  });

  const completedLessonIds = [
    ...new Set(completedAttempts.map((attempt) => attempt.lesson_id)),
  ];

  for (const lesson of lessons) {
    const lessonOutcomes = parseJsonArray(lesson.lesson_outcomes);
    const weakOutcomeMap = new Map(
      weakOutcomes.map((item) => [item.outcome, item]),
    );
    const matched = lessonOutcomes
      .map((outcome) => weakOutcomeMap.get(outcome))
      .filter(Boolean);
    if (matched.length === 0) {
      continue;
    }
    const recommendationScore = matched.reduce(
      (sum, outcome) => sum + (100 - outcome.averageScore),
      0,
    );
    const recommendation = {
      lessonId: lesson.id,
      title: lesson.title,
      description: lesson.description,
      thumbnail: lesson.thumbnail,
      cefrLevel: lesson.cefr_level,
      matchScore: recommendationScore,
      reason: matched,
    };
    if (completedLessonIds.includes(lesson.id)) {
      revisionLessons.push(recommendation);
    } else {
      nextLessons.push(recommendation);
    }
  }
  revisionLessons.sort((a, b) => b.matchScore - a.matchScore);
  nextLessons.sort((a, b) => b.matchScore - a.matchScore);
  return {
    learningProfile,
    revisionLessons: revisionLessons.slice(0, 5),
    nextLessons: nextLessons.slice(0, 5),
    hasPersonalizedRecommendations:
      learningProfile.state === "personalized" ||
      learningProfile.state === "excellent",
  };
};
// ---------------------------------------------------------------------
// Requirement 3.2 — GET /api/recommendations/mentee
//
// A separate, additive engine from getRecommendationsForMentee above,
// deliberately left untouched: that function backs the existing
// JourneyCard/RecommendationGrid "N of 5 mentor reviews" gamified
// journey on the mentee dashboard, which is fundamentally built around
// review-attempt counting — rewiring it to ignore review_status would
// silently break that UI's own messaging, and the user's spec asks for
// this as a NEW endpoint ("Implement ... and endpoint GET
// /api/recommendations/mentee"), not a replacement of the old one.
//
// This engine is phoneme/skill-based (learning_needs, deletion rate,
// function-word substitution rate) rather than outcome-based, and never
// consults review_status anywhere — Requirement 1's "mentor review is
// non-blocking" rule applies here too: a mentee with zero reviewed
// attempts still gets recommendations from their own submitted
// (self-graded) practice.
async function getWeakPhonemeSymbols(menteeId) {
  const { weakestPhonemes } = await menteeInsightsService.getMenteePhonemes(
    menteeId,
  );
  return weakestPhonemes
    .filter((phoneme) => (phoneme.errorRate ?? 0) >= WEAK_PHONEME_ERROR_RATE_THRESHOLD)
    .map((phoneme) => phoneme.symbol);
}

async function getVocabularyDeletionRate(menteeId) {
  const [row] = await sequelize.query(
    `SELECT SUM(deletions) AS deletions, SUM(total_reference) AS total_reference
     FROM (
       SELECT a.deletions, a.total_reference
       FROM assessments a
       INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
       WHERE ps.mentee_id = :menteeId AND a.is_accepted = TRUE
       ORDER BY a.created_at DESC
       LIMIT :limit
     ) recent`,
    {
      replacements: { menteeId, limit: RECENT_ASSESSMENTS_FOR_VOCAB },
      type: QueryTypes.SELECT,
    },
  );
  const totalReference = Number(row?.total_reference || 0);
  if (totalReference === 0) return 0;
  return (Number(row?.deletions || 0) / totalReference) * 100;
}

async function getFunctionWordSubstitutionRate(menteeId) {
  const functionWordList = [...FUNCTION_WORDS];
  const rows = await sequelize.query(
    `SELECT wa.operation, wa.expected_word
     FROM word_assessments wa
     INNER JOIN assessments a ON a.id = wa.assessment_id
     INNER JOIN practice_sessions ps ON ps.id = a.practice_session_id
     WHERE ps.mentee_id = :menteeId AND a.is_accepted = TRUE
       AND LOWER(wa.expected_word) IN (:functionWordList)`,
    {
      replacements: { menteeId, functionWordList },
      type: QueryTypes.SELECT,
    },
  );
  // Re-verified in JS via isFunctionWord (belt-and-suspenders against
  // any casing/whitespace edge the SQL IN-clause might miss) rather
  // than trusted purely from the SQL filter.
  const functionWordRows = rows.filter((row) => isFunctionWord(row.expected_word));
  if (functionWordRows.length === 0) return 0;
  const substituted = functionWordRows.filter(
    (row) => row.operation === "substitution",
  ).length;
  return (substituted / functionWordRows.length) * 100;
}

async function findLessonsByType(lessonType, cefrLevel, excludeLessonIds, limit) {
  return Lesson.findAll({
    where: {
      lesson_status: LESSON_STATUSES.PUBLISHED,
      lesson_type: lessonType,
      cefr_level: cefrLevel,
      id: { [Sequelize.Op.notIn]: [...excludeLessonIds, 0] },
    },
    limit,
    order: [["id", "DESC"]],
  });
}

function toLessonRecommendation(lesson, matchType, reason) {
  return {
    lessonId: lesson.id,
    title: lesson.title,
    description: lesson.description,
    thumbnail: lesson.thumbnail,
    cefrLevel: lesson.cefr_level,
    lessonType: lesson.lesson_type,
    matchType,
    reason,
  };
}

async function getMenteeAdaptiveRecommendation(userId) {
  const mentee = await Mentee.findOne({ where: { user_id: userId } });
  if (!mentee) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const currentCefrLevel = mentee.current_cefr_level;

  // Lessons the mentee has already attempted at least once are excluded
  // from every path below — recommendations surface something new to
  // try, not a rehash of what's already on the dashboard's own
  // "Continue Practicing" carousel.
  const attemptedRows = await PracticeAttempt.findAll({
    where: { mentee_id: mentee.id },
    attributes: ["lesson_id"],
  });
  const attemptedLessonIds = attemptedRows.map((row) => row.lesson_id);

  const triggeredPaths = [];
  const recommendations = [];

  // --- Pronunciation Path ---
  const weakPhonemeSymbols = await getWeakPhonemeSymbols(mentee.id);
  if (weakPhonemeSymbols.length > 0) {
    const lessons = await findLessonsByType(
      "pronunciation_drill",
      currentCefrLevel,
      attemptedLessonIds,
      MAX_LESSONS_PER_PATH,
    );
    if (lessons.length > 0) {
      triggeredPaths.push("pronunciation");
      recommendations.push(
        ...lessons.map((lesson) =>
          toLessonRecommendation(
            lesson,
            "pronunciation",
            `Weak phonemes detected: ${weakPhonemeSymbols.join(", ")}`,
          ),
        ),
      );
    }
  }

  // --- Vocabulary & Fluency Path ---
  const deletionRate = await getVocabularyDeletionRate(mentee.id);
  if (deletionRate > VOCABULARY_DELETION_RATE_THRESHOLD) {
    const lessons = await findLessonsByType(
      "vocabulary_builder",
      currentCefrLevel,
      attemptedLessonIds,
      MAX_LESSONS_PER_PATH,
    );
    if (lessons.length > 0) {
      triggeredPaths.push("vocabulary");
      recommendations.push(
        ...lessons.map((lesson) =>
          toLessonRecommendation(
            lesson,
            "vocabulary",
            `Word omission rate ${deletionRate.toFixed(1)}% exceeds ${VOCABULARY_DELETION_RATE_THRESHOLD}%`,
          ),
        ),
      );
    }
  }

  // --- Grammar & Structural Path ---
  const functionWordSubstitutionRate = await getFunctionWordSubstitutionRate(
    mentee.id,
  );
  if (functionWordSubstitutionRate > GRAMMAR_SUBSTITUTION_RATE_THRESHOLD) {
    const lessons = await findLessonsByType(
      "grammar_in_context",
      currentCefrLevel,
      attemptedLessonIds,
      MAX_LESSONS_PER_PATH,
    );
    if (lessons.length > 0) {
      triggeredPaths.push("grammar");
      recommendations.push(
        ...lessons.map((lesson) =>
          toLessonRecommendation(
            lesson,
            "grammar",
            `Function-word substitution rate ${functionWordSubstitutionRate.toFixed(1)}% exceeds ${GRAMMAR_SUBSTITUTION_RATE_THRESHOLD}%`,
          ),
        ),
      );
    }
  }

  // --- Fallback: next progressive lesson at the mentee's current CEFR
  // level, only when no diagnostic path produced anything (either
  // nothing triggered, or a triggered path had no matching lesson type
  // published yet).
  if (recommendations.length === 0) {
    const fallbackLessons = await Lesson.findAll({
      where: {
        lesson_status: LESSON_STATUSES.PUBLISHED,
        cefr_level: currentCefrLevel,
        id: { [Sequelize.Op.notIn]: [...attemptedLessonIds, 0] },
      },
      limit: MAX_LESSONS_PER_PATH,
      order: [["id", "ASC"]],
    });
    triggeredPaths.push("fallback");
    recommendations.push(
      ...fallbackLessons.map((lesson) =>
        toLessonRecommendation(
          lesson,
          "fallback",
          `Next lesson in your current level (${currentCefrLevel})`,
        ),
      ),
    );
  }

  return {
    currentCefrLevel,
    triggeredPaths,
    diagnostics: {
      weakPhonemes: weakPhonemeSymbols,
      vocabularyDeletionRate: Math.round(deletionRate * 10) / 10,
      grammarSubstitutionRate: Math.round(functionWordSubstitutionRate * 10) / 10,
    },
    recommendations: recommendations.slice(0, MAX_TOTAL_RECOMMENDATIONS),
  };
}

module.exports = {
  getRecommendationsForMentee,
  getMenteeAdaptiveRecommendation,
};
