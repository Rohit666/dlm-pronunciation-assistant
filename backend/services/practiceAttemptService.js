const {
  PracticeAttempt,
  PracticeSession,
  LessonSentence,
  Lesson,
  Mentee,
  User,
} = require("../models");
const PRACTICE_ATTEMPT_STATUSES = require("../constants/practiceAttemptStatuses");
const REVIEW_STATUSES = require("../constants/reviewStatuses");

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
  attempt = await PracticeAttempt.create({
    mentee_id: menteeId,
    lesson_id: lessonId,
    attempt_number: attemptNumber,
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
const completeAttempt = async (attemptId) => {
  await PracticeAttempt.update(
    {
      status: PRACTICE_ATTEMPT_STATUSES.SUBMITTED,
      completed_at: new Date(),
    },

    {
      where: {
        id: attemptId,
      },
    },
  );
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
