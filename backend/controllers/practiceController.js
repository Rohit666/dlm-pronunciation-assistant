const {
  PracticeSession,
  Mentee,
  LessonSentence,
  Lesson,
  User,
} = require("../models");

const { emitPracticeSubmitted } = require("../services/eventService");

exports.submitPractice = async (req, res) => {
  try {
    const { lesson_sentence_id, practice_attempt_id } = req.body;
    const mentee = await Mentee.findOne({
      where: {
        user_id: req.user.id,
      },
    });
    const user = await User.findByPk(req.user.id);
    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: "Mentee not found",
      });
    }

    const session = await PracticeSession.create({
      mentee_id: mentee.id,
      lesson_sentence_id,
      practice_attempt_id,
      recording_path: req.file ? req.file.path : null,
    });
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
    });
  } catch (error) {
    console.error(error);

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
