const { Batch, Mentee, User } = require("../models");
const { getPagination, getPagingData } = require("../utils/pagination");
exports.getMentorBatches = async (req, res) => {
  try {
    const batches = await Batch.findAll({
      where: {
        mentor_id: req.user.id,
      },

      order: [["id", "DESC"]],
    });

    res.json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.updateBatchThreshold = async (req, res) => {
  try {
    const { id } = req.params;
    const { default_passing_threshold } = req.body;

    const threshold = Number(default_passing_threshold);

    if (
      default_passing_threshold === null ||
      default_passing_threshold === undefined ||
      Number.isNaN(threshold) ||
      threshold < 0 ||
      threshold > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "default_passing_threshold must be a number between 0 and 100",
      });
    }

    const batch = await Batch.findOne({
      where: {
        id,
        mentor_id: req.user.id,
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    batch.default_passing_threshold = threshold;
    await batch.save();

    res.json({
      success: true,
      batch,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getMentorMentees = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { currentPage, pageLimit, offset } = getPagination(page, limit);
    const batches = await Batch.findAll({
      where: {
        mentor_id: req.user.id,
      },
    });

    const batchIds = batches.map((batch) => batch.id);
    const totalItems = await Mentee.count({
      where: {
        batch_id: batchIds,
      },
    });
    const mentees = await Mentee.findAll({
      where: {
        batch_id: batchIds,
      },
      limit: pageLimit,
      offset,

      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
      ],
    });

    const formattedMentees = mentees.map((mentee) => ({
      id: mentee.id,

      name: mentee.User?.name,

      email: mentee.User?.email,

      roll_number: mentee.roll_number,
    }));

    res.json({
      success: true,

      ...getPagingData(totalItems, formattedMentees, currentPage, pageLimit),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
