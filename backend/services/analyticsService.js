const {
  Batch,
  Mentee,
  Lesson,
  PracticeSession,
  LessonSentence,
  User,
  ActivityLog,
  PracticeAttempt,
} = require("../models");

const { Op, fn, col } = require("sequelize");

const REVIEW_STATUSES = require("../constants/reviewStatuses");
const PRACTICE_ATTEMPT_STATUSES = require("../constants/practiceAttemptStatuses");
const PRACTICE_SESSION_STATUSES = require("../constants/practiceSessionStatuses");
const LESSON_STATUSES = require("../constants/lessonStatuses");
const { parseJsonArray } = require("../utils/jsonUtils");

const getAdminDashboardStats = async () => {
  const totalMentors = await User.count({
    where: {
      role: "mentor",
    },
  });

  const totalMentees = await User.count({
    where: {
      role: "mentee",
    },
  });

  const totalBatches = await Batch.count();

  const totalAssignedMentees = await Mentee.count({
    where: {
      batch_id: {
        [Op.ne]: null,
      },
    },
  });

  return {
    totalMentors,
    totalMentees,
    totalBatches,
    totalAssignedMentees,
  };
};
const getMentorDashboardStats = async (mentorUserId) => {
  // Assigned batches
  const assignedBatches = await Batch.count({
    where: {
      mentor_id: mentorUserId,
    },
  });

  // Total mentees
  const totalMentees = await Mentee.count();

  // Published lessons
  const publishedLessons = await Lesson.count({
    where: {
      created_by: mentorUserId,

      lesson_status: LESSON_STATUSES.PUBLISHED,
    },
  });

  // Draft lessons
  const draftLessons = await Lesson.count({
    where: {
      created_by: mentorUserId,

      lesson_status: LESSON_STATUSES.DRAFT,
    },
  });

  // Archived lessons
  const archivedLessons = await Lesson.count({
    where: {
      created_by: mentorUserId,

      lesson_status: LESSON_STATUSES.ARCHIVED,
    },
  });

  // Pending reviews
  const pendingReviews = await PracticeAttempt.count({
    where: {
      status: PRACTICE_ATTEMPT_STATUSES.SUBMITTED,
      review_status: REVIEW_STATUSES.PENDING,
    },
  });

  // Today's submissions
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const todaySubmissions = await PracticeSession.count({
    where: {
      // A session now exists from the first /compare call onward —
      // "submissions" means actually-submitted ones, not in-flight
      // practice.
      status: PRACTICE_SESSION_STATUSES.SUBMITTED,
      created_at: {
        [Op.gte]: today,
      },
    },
  });

  return {
    assignedBatches,
    totalMentees,
    publishedLessons,
    draftLessons,
    archivedLessons,
    pendingReviews,
    todaySubmissions,
  };
};
const getRecentActivities = async () => {
  const activities = await ActivityLog.findAll({
    include: [
      {
        model: User,
        attributes: ["name"],
      },
    ],

    order: [["created_at", "DESC"]],

    limit: 10,
  });

  return activities;
};
const getWeakStudents = async (mentorId) => {
  const mentorBatches = await Batch.findAll({
    where: {
      mentor_id: mentorId,
    },
  });
  const batchIds = mentorBatches.map((batch) => batch.id);
  const mentees = await Mentee.findAll({
    where: {
      batch_id: batchIds,
    },
    include: [
      {
        model: User,
        attributes: ["name", "email"],
      },
    ],
  });
  const results = [];
  for (const mentee of mentees) {
    const attempts = await PracticeAttempt.findAll({
      where: {
        mentee_id: mentee.id,

        review_status: "reviewed",
      },
    });
    if (attempts.length === 0) {
      continue;
    }
    const totalScore = attempts.reduce(
      (sum, attempt) => sum + Number(attempt.overall_score || 0),
      0,
    );
    const averageScore = totalScore / attempts.length;
    results.push({
      menteeId: mentee.id,
      name: mentee.User.name,
      email: mentee.User.email,
      attempts: attempts.length,
      averageScore: Number(averageScore.toFixed(2)),
    });
  }
  return results.sort((a, b) => a.averageScore - b.averageScore);
};
const getInactiveStudents = async (mentorId) => {
  const mentorBatches = await Batch.findAll({
    where: {
      mentor_id: mentorId,
    },
  });
  const batchIds = mentorBatches.map((batch) => batch.id);
  const mentees = await Mentee.findAll({
    where: {
      batch_id: batchIds,
    },

    include: [
      {
        model: User,
        attributes: ["name", "email"],
      },
    ],
  });
  const results = [];
  for (const mentee of mentees) {
    const latestAttempt = await PracticeAttempt.findOne({
      where: {
        mentee_id: mentee.id,
      },

      order: [["created_at", "DESC"]],
    });
    if (!latestAttempt) {
      results.push({
        menteeId: mentee.id,
        name: mentee.User.name,
        email: mentee.User.email,
        daysInactive: 999,
        lastPracticeDate: null,
      });
      continue;
    }
    const today = new Date();
    const lastDate = new Date(latestAttempt.created_at);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    results.push({
      menteeId: mentee.id,
      name: mentee.User.name,
      email: mentee.User.email,
      daysInactive: diffDays,
      lastPracticeDate: latestAttempt.created_at,
    });
  }
  return results.sort((a, b) => b.daysInactive - a.daysInactive);
};
const getLessonEffectiveness = async (mentorId) => {
  const lessons = await Lesson.findAll({
    where: {
      created_by: mentorId,
    },
  });
  const results = [];
  for (const lesson of lessons) {
    const attempts = await PracticeAttempt.findAll({
      where: {
        lesson_id: lesson.id,

        review_status: REVIEW_STATUSES.REVIEWED,
      },
    });
    if (attempts.length === 0) {
      continue;
    }
    const totalScore = attempts.reduce(
      (sum, attempt) => sum + Number(attempt.overall_score || 0),
      0,
    );
    const averageScore = totalScore / attempts.length;
    results.push({
      lessonId: lesson.id,
      title: lesson.title,
      attempts: attempts.length,
      averageScore: Number(averageScore.toFixed(2)),
    });
  }
  return results.sort((a, b) => a.averageScore - b.averageScore);
};
const getWeakOutcomes = async (mentorId) => {
  const lessons = await Lesson.findAll({
    where: {
      created_by: mentorId,
    },
  });
  const outcomeMap = {};
  for (const lesson of lessons) {
    const outcomes = parseJsonArray(lesson.lesson_outcomes);
    const attempts = await PracticeAttempt.findAll({
      where: {
        lesson_id: lesson.id,
        review_status: REVIEW_STATUSES.REVIEWED,
      },
    });
    if (attempts.length === 0) {
      continue;
    }
    const totalLessonScore = attempts.reduce(
      (sum, attempt) => sum + Number(attempt.overall_score || 0),
      0,
    );
    outcomes.forEach((outcome) => {
      if (!outcomeMap[outcome]) {
        outcomeMap[outcome] = {
          outcome,
          totalScore: 0,
          totalAttempts: 0,
          lessonCount: 0,
        };
      }
      outcomeMap[outcome].totalScore += totalLessonScore;
      outcomeMap[outcome].totalAttempts += attempts.length;
      outcomeMap[outcome].lessonCount += 1;
    });
  }
  return Object.values(outcomeMap).map((item) => ({
    outcome: item.outcome,
    averageScore: Number((item.totalScore / item.totalAttempts).toFixed(2)),
    lessonCount: item.lessonCount,
    attemptCount: item.totalAttempts,
  }));
};
const getMostImprovedStudents = async (mentorId) => {
  const mentorBatches = await Batch.findAll({
    where: {
      mentor_id: mentorId,
    },
  });
  const batchIds = mentorBatches.map((batch) => batch.id);
  const mentees = await Mentee.findAll({
    where: {
      batch_id: batchIds,
    },

    include: [
      {
        model: User,
        attributes: ["name", "email"],
      },
    ],
  });
  const results = [];
  for (const mentee of mentees) {
    const attempts = await PracticeAttempt.findAll({
      where: {
        mentee_id: mentee.id,
        review_status: REVIEW_STATUSES.REVIEWED,
      },
      order: [["created_at", "ASC"]],
    });
    if (attempts.length < 2) {
      continue;
    }
    const firstAttempt = attempts[0];
    const latestAttempt = attempts[attempts.length - 1];
    const improvement =
      Number(latestAttempt.overall_score || 0) -
      Number(firstAttempt.overall_score || 0);
    results.push({
      menteeId: mentee.id,
      name: mentee.User.name,
      email: mentee.User.email,
      firstScore: firstAttempt.overall_score,
      latestScore: latestAttempt.overall_score,
      improvement: Number(improvement.toFixed(2)),
    });
  }
  return results.sort((a, b) => b.improvement - a.improvement);
};
module.exports = {
  getAdminDashboardStats,
  getMentorDashboardStats,
  getRecentActivities,
  getWeakStudents,
  getInactiveStudents,
  getLessonEffectiveness,
  getWeakOutcomes,
  getMostImprovedStudents,
};
