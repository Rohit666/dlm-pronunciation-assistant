const { User, Batch, Mentee } = require("../models");
exports.getMentees = async (req, res) => {
  try {
    const mentees = await Mentee.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: Batch,
          attributes: ["id", "batch_name"],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json({
      success: true,
      mentees,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.createMentee = async (req, res) => {
  try {
    const { name, email, password, batch_id, roll_number } = req.body;

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const bcrypt = require("bcryptjs");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "mentee",
    });

    await Mentee.create({
      user_id: user.id,
      batch_id,
      roll_number,
    });

    res.status(201).json({
      success: true,
      message: "Mentee created successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteMentee = async (req, res) => {
  try {
    const { id } = req.params;

    const mentee = await Mentee.findByPk(id);

    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: "Mentee not found",
      });
    }

    await User.destroy({
      where: {
        id: mentee.user_id,
      },
    });

    await mentee.destroy();

    res.json({
      success: true,
      message: "Mentee deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.updateMentee = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, roll_number, batch_id } = req.body;

    const mentee = await Mentee.findByPk(id, {
      include: [User],
    });

    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: "Mentee not found",
      });
    }

    await mentee.User.update({
      name,
      email,
    });

    await mentee.update({
      roll_number,
      batch_id,
    });

    res.json({
      success: true,
      message: "Mentee updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
