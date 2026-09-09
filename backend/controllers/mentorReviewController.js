const {
  PracticeSession,
  Mentee,
  LessonSentence,
  Lesson,
  User,
  Batch,
  PracticeAttempt,
  Assessment,
  WordAssessment,
  PhonemeAssessment,
  Diagnosis,
  LearningNeed,
} = require("../models");
const PRACTICE_ATTEMPT_STATUSES = require("../constants/practiceAttemptStatuses");
const PRACTICE_SESSION_STATUSES = require("../constants/practiceSessionStatuses");
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
          // A session now exists from the first /compare call onward —
          // mentors should only ever review real submissions, never a
          // stray in-progress/abandoned compare. required:false keeps
          // the attempt visible even if a sentence was never submitted.
          where: { status: PRACTICE_SESSION_STATUSES.SUBMITTED },
          required: false,

          include: [
            {
              model: LessonSentence,
            },
            // Requirement 2 (Diagnostic Mentor Review Console): the
            // normalized assessment chain for this sentence's accepted
            // submission, so the review page can show word-by-word and
            // phoneme-level diagnostics alongside the recording —
            // is_accepted=true is always exactly the session's official
            // submission (assessmentPersistenceService only ever leaves
            // one accepted assessment per session). required:false —
            // an older session predating the normalized schema may have
            // no assessment row at all.
            {
              model: Assessment,
              where: { is_accepted: true },
              required: false,
              include: [
                {
                  model: WordAssessment,
                  as: "words",
                  required: false,
                  include: [
                    {
                      model: PhonemeAssessment,
                      as: "phonemes",
                      required: false,
                    },
                  ],
                },
                {
                  model: Diagnosis,
                  required: false,
                  include: [
                    {
                      model: LearningNeed,
                      as: "needs",
                      required: false,
                    },
                  ],
                },
              ],
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
