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
const practiceSessionTryService = require("../services/practiceSessionTryService");
const PRACTICE_SESSION_STATUSES = require("../constants/practiceSessionStatuses");
const {
  normalizeAssessmentPayload,
  AssessmentValidationError,
} = require("../utils/assessmentAdapter");

// POST /api/practice/compare — Transient AI call, but NOT a no-op on the
// DB: it finds-or-creates the sentence's open (status=started)
// practice_sessions row, then logs this try into practice_session_tries
// IF it beats the session's best score so far (Progressive Filter Rule —
// intermediate regressed comparisons are still never persisted). The
// full AI payload itself still only ever lives in the short-lived
// assessment_token cache; /compare NEVER writes assessments/
// word_assessments/etc — only /submit does that.
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

    const overallScore = Number(
      aiResponse.assessment_document.pronunciation.overall_accuracy,
    );

    const session = await practiceSessionTryService.findOrCreateOpenSession({
      menteeId: mentee.id,
      lessonSentenceId: Number(lessonSentenceId),
      practiceAttemptId: practiceAttemptId ? Number(practiceAttemptId) : null,
    });

    const tryResult = await practiceSessionTryService.recordTryIfImprovement({
      practiceSessionId: session.id,
      overallScore,
    });

    const bestScoreSoFar = tryResult.persisted
      ? overallScore
      : tryResult.bestScoreSoFar;

    const assessment_token = assessmentCacheService.put({
      aiResponse,
      lessonSentenceId: Number(lessonSentenceId),
      practiceAttemptId: practiceAttemptId ? Number(practiceAttemptId) : null,
      menteeId: mentee.id,
      audioPath: req.file.path,
      practiceSessionId: session.id,
      overallScore,
      tryPersisted: tryResult.persisted,
      tryNumber: tryResult.tryNumber,
    });

    res.json({
      success: true,
      result: aiResponse,
      assessment_token,
      practice_session_id: session.id,
      try_persisted: tryResult.persisted,
      try_number: tryResult.tryNumber,
      best_score_so_far: bestScoreSoFar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to compare recording.",
    });
  }
};

// POST /api/practice — Permanent. Takes the practice_session_id created
// by an earlier /compare call plus its assessment_token, redeems the
// cached AI result, and atomically persists it into the normalized
// assessment tables as that session's accepted submission
// (assessmentPersistenceService), flipping the session to "submitted".
// No practice_sessions row is created here anymore — /compare already
// created (or reused) it.
exports.submitPractice = async (req, res) => {
  try {
    const { practice_session_id, assessment_token } = req.body;

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

    if (!practice_session_id || !assessment_token) {
      return res.status(400).json({
        success: false,
        message: "practice_session_id and assessment_token are required.",
      });
    }

    const session = await PracticeSession.findByPk(practice_session_id);
    if (!session || Number(session.mentee_id) !== Number(mentee.id)) {
      return res.status(404).json({
        success: false,
        message: "Practice session not found.",
      });
    }
    if (session.status !== PRACTICE_SESSION_STATUSES.STARTED) {
      return res.status(409).json({
        success: false,
        message: "This practice session was already submitted.",
      });
    }

    const cached = assessmentCacheService.redeem(assessment_token);
    if (!cached) {
      return res.status(410).json({
        success: false,
        message:
          "This assessment has expired or was already submitted. Please record and try again.",
      });
    }
    if (
      Number(cached.menteeId) !== Number(mentee.id) ||
      Number(cached.practiceSessionId) !== Number(session.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Assessment token does not belong to this practice session.",
      });
    }

    const normalized = normalizeAssessmentPayload(cached.aiResponse);
    const assessmentResult =
      await assessmentPersistenceService.persistAcceptedAssessment({
        practiceSession: session,
        menteeId: mentee.id,
        lessonSentenceId: cached.lessonSentenceId,
        normalized,
        recordingPath: cached.audioPath,
        tryInfo: {
          overallScore: cached.overallScore,
          tryPersisted: cached.tryPersisted,
        },
      });

    const lessonSentence = await LessonSentence.findByPk(
      cached.lessonSentenceId,
    );

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
      assessment: {
        overallAccuracy: Number(assessmentResult.assessment.overall_accuracy),
        previousAcceptedScore: assessmentResult.previousAcceptedScore,
        delta: assessmentResult.delta,
      },
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
        // A session now exists from the first /compare call onward —
        // only ones actually submitted belong in "history".
        status: PRACTICE_SESSION_STATUSES.SUBMITTED,
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
