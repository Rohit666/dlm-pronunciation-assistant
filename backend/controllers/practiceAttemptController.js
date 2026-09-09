const { PracticeAttempt, Lesson, Mentee } = require("../models");
const practiceAttemptService = require("../services/practiceAttemptService");

exports.startPracticeAttempt = async (req, res) => {
  try {
    const { lesson_id } = req.body;
    const mentee = await Mentee.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: "Mentee not found",
      });
    }
    const { attempt, isResumed } =
      await practiceAttemptService.getOrCreatePracticeAttempt(
        mentee.id,
        lesson_id,
      );
    if (attempt.mentee_id !== mentee.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    res.json({
      success: true,
      attemptId: attempt.id,
      currentSentenceOrder: attempt.current_sentence_order,
      attemptNumber: attempt.attempt_number,
      isResumed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getPracticeAttempt = async (req, res) => {
  try {
    const attempt = await PracticeAttempt.findByPk(req.params.id, {
      include: [
        {
          model: Lesson,
          attributes: ["id", "title"],
        },
      ],
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Practice attempt not found",
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
exports.updateAttemptProgress = async (req, res) => {
  try {
    const { currentSentenceOrder } = req.body;
    await practiceAttemptService.updateProgress(
      req.params.id,
      currentSentenceOrder,
    );
    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.completeAttempt = async (req, res) => {
  try {
    const attemptId = req.params.id;
    const { overallScore, passed } =
      await practiceAttemptService.completeAttempt(attemptId);
    res.json({
      success: true,
      overallScore,
      passed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await practiceAttemptService.getMenteeAttempts(
      req.user.id,
    );

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
exports.getAttemptResult = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await practiceAttemptService.getAttemptResult(
      id,
      req.user.id,
    );

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
exports.getActiveAttempt = async (req, res) => {
  try {
    const mentee = await Mentee.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    const attempt = await practiceAttemptService.getActiveAttempt(
      mentee.id,
      req.params.lessonId,
    );

    res.json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
