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
