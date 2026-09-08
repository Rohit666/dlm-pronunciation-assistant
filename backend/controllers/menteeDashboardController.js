const { Mentee, Batch, PracticeSession, Lesson } = require("../models");
const PRACTICE_SESSION_STATUSES = require("../constants/practiceSessionStatuses");

exports.getMenteeDashboard = async (req, res) => {
  try {
    const mentee = await Mentee.findOne({
      where: {
        user_id: req.user.id,
      },

      include: [
        {
          model: Batch,
          attributes: ["id", "batch_name", "description"],
        },
      ],
    });

    const practiceCount = await PracticeSession.count({
      where: {
        mentee_id: mentee?.id,
        // A session now exists from the first /compare call onward —
        // only count real submissions, not in-flight/abandoned ones.
        status: PRACTICE_SESSION_STATUSES.SUBMITTED,
      },
    });

    const lessons = await Lesson.findAll({
      limit: 6,
      where: {
        lesson_status: "published",
      },
      order: [["id", "DESC"]],
    });

    res.json({
      success: true,

      stats: {
        practiceCount,
      },

      mentee,
      lessons,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};
