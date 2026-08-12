const {
  PracticeSession,
  Mentee,
  LessonSentence,
  Lesson,
  User,
  Batch,
  PracticeAttempt,
} = require("../models");
const PRACTICE_ATTEMPT_STATUSES = require("../constants/practiceAttemptStatuses");
const REVIEW_STATUSES = require("../constants/reviewStatuses");
exports.getReviewAttempts = async (req, res) => {
  try {
    const mentorId = req.user.id;
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
    });

    const menteeIds = mentees.map((mentee) => mentee.id);
    const attempts = await PracticeAttempt.findAll({
      where: {
        mentee_id: menteeIds,
        status: PRACTICE_ATTEMPT_STATUSES.SUBMITTED,
        review_status: REVIEW_STATUSES.PENDING,
      },

      include: [
        {
          model: Lesson,
          attributes: ["title"],
        },

        {
          model: Mentee,
          include: [
            {
              model: User,
              attributes: ["name", "email"],
            },
          ],
        },
      ],

      order: [["created_at", "DESC"]],
    });
    res.json({
      success: true,
      attempts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getReviewAttemptDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await PracticeAttempt.findByPk(id, {
      include: [
        {
          model: Lesson,
        },

        {
          model: Mentee,

          include: [
            {
              model: User,

              attributes: ["name", "email"],
            },
          ],
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

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    res.json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.saveAttemptReview = async (req, res) => {
  try {
    const { id } = req.params;

    const { sentenceReviews, overallScore, overallFeedback } = req.body;

    const mentorId = req.user.id;

    // Save sentence reviews
    for (const review of sentenceReviews) {
      await PracticeSession.update(
        {
          score: review.score,
          feedback: review.feedback,
          reviewed_by: mentorId,
          reviewed_at: new Date(),
        },
        {
          where: {
            id: review.sessionId,
          },
        },
      );
    }
    const updateData = {
      overall_score: overallScore,
      overall_feedback: overallFeedback,
      reviewed_by: mentorId,
      reviewed_at: new Date(),
      review_status: REVIEW_STATUSES.REVIEWED,
    };
    const attempt = await PracticeAttempt.findByPk(id);
    if (!attempt.first_reviewed_at) {
      updateData.first_reviewed_at = new Date();
    }
    await PracticeAttempt.update(updateData, {
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: "Review saved successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
