const path = require("path");
const {
  PracticeSession,
  Mentee,
  LessonSentence,
  Lesson,
  User,
} = require("../models");

const { emitPracticeSubmitted } = require("../services/eventService");
const aiRuntimeService = require("../services/aiRuntimeService");
const assessmentCacheService = require("../services/assessmentCacheService");
const assessmentPersistenceService = require("../services/assessmentPersistenceService");
const {
  normalizeAssessmentPayload,
  AssessmentValidationError,
} = require("../utils/assessmentAdapter");

// POST /api/practice/compare — Transient. Calls the local Python AI
// runtime, caches the raw result under a one-time assessment_token,
// and returns it to the frontend. NEVER writes to a permanent
// assessment table — a regressed/abandoned comparison costs nothing
// but cache memory, and expires on its own (assessmentCacheService).
exports.compare = async (req, res) => {
  try {
    const { lessonSentenceId, practiceAttemptId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Recording is required.",
      });
    }

    const lessonSentence = await LessonSentence.findByPk(lessonSentenceId);
    if (!lessonSentence) {
      return res.status(404).json({
        success: false,
        message: "Lesson sentence not found.",
      });
    }

    const mentee = await Mentee.findOne({
      where: { user_id: req.user.id },
    });
    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: "Mentee not found.",
      });
    }

    const aiResponse = await aiRuntimeService.assess({
      audioPath: path.resolve(req.file.path),
      // sentence_text is kept in sync with the content_blocks main_text
      // block (see utils/sentenceBlocks.js), so this stays valid.
      referenceText: lessonSentence.sentence_text,
      language: "en",
    });

    const assessment_token = assessmentCacheService.put({
      aiResponse,
      lessonSentenceId: Number(lessonSentenceId),
      practiceAttemptId: practiceAttemptId ? Number(practiceAttemptId) : null,
      menteeId: mentee.id,
      audioPath: req.file.path,
    });

    res.json({
      success: true,
      result: aiResponse,
      assessment_token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to compare recording.",
    });
  }
};

// POST /api/practice — Permanent. Creates the sentence-level
// practice_session and, if an assessment_token is supplied, atomically
// redeems the cached AI result into the normalized assessment tables
// as the accepted submission (assessmentPersistenceService).
exports.submitPractice = async (req, res) => {
  try {
    const { lesson_sentence_id, practice_attempt_id, assessment_token } =
      req.body;

    const mentee = await Mentee.findOne({
      where: { user_id: req.user.id },
    });
    const user = await User.findByPk(req.user.id);
    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: "Mentee not found",
      });
    }

    let cached = null;
    if (assessment_token) {
      cached = assessmentCacheService.redeem(assessment_token);
      if (!cached) {
        return res.status(410).json({
          success: false,
          message:
            "This assessment has expired or was already submitted. Please record and try again.",
        });
      }
      if (Number(cached.menteeId) !== Number(mentee.id)) {
        return res.status(403).json({
          success: false,
          message: "Assessment token does not belong to this mentee.",
        });
      }
    }

    const session = await PracticeSession.create({
      mentee_id: mentee.id,
      lesson_sentence_id,
      practice_attempt_id,
      recording_path: cached ? cached.audioPath : null,
    });

    let assessmentResult = null;
    if (cached) {
      const normalized = normalizeAssessmentPayload(cached.aiResponse);
      assessmentResult = await assessmentPersistenceService.persistAcceptedAssessment(
        {
          practiceSession: session,
          menteeId: mentee.id,
          lessonSentenceId: Number(lesson_sentence_id),
          normalized,
        },
      );
    }

    const lessonSentence = await LessonSentence.findByPk(lesson_sentence_id);

    if (lessonSentence) {
      const lesson = await Lesson.findByPk(lessonSentence.lesson_id);

      await emitPracticeSubmitted({
        mentorUserId: lesson.created_by,
        menteeName: user.name,
        practiceSessionId: session.id,
        actorUserId: req.user.id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Practice submitted successfully",
      session,
      assessment: assessmentResult
        ? {
            overallAccuracy: Number(assessmentResult.assessment.overall_accuracy),
            previousAcceptedScore: assessmentResult.previousAcceptedScore,
            delta: assessmentResult.delta,
          }
        : null,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof AssessmentValidationError) {
      return res.status(422).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getPracticeHistory = async (req, res) => {
  try {
    const mentee = await Mentee.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    const sessions = await PracticeSession.findAll({
      where: {
        mentee_id: mentee.id,
      },

      include: [
        {
          model: LessonSentence,

          include: [
            {
              model: Lesson,
            },
          ],
        },
      ],

      order: [["id", "DESC"]],
    });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
