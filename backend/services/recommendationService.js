const { Mentee, Lesson, PracticeAttempt } = require("../models");
const { parseJsonArray } = require("../utils/jsonUtils");
const REVIEW_STATUSES = require("../constants/reviewStatuses");
const LESSON_STATUSES = require("../constants/lessonStatuses");
const ERROR_MESSAGES = require("../constants/errorMessages");
const {
  PROFILE_REQUIRED_ATTEMPTS,
  WEAK_THRESHOLD,
} = require("../constants/recommendationConfig");

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
const getActiveAttempt = async (menteeId, lessonId) => {
  return await PracticeAttempt.findOne({
    where: {
      mentee_id: menteeId,
      lesson_id: lessonId,
      status: PRACTICE_ATTEMPT_STATUSES.STARTED,
    },
    order: [["created_at", "DESC"]],
  });
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
module.exports = {
  getRecommendationsForMentee,
};
