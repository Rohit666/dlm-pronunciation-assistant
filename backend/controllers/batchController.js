const { Batch, User } = require("../models");

exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
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

exports.createBatch = async (req, res) => {
  try {
    const { batch_name, description, mentor_id, default_passing_threshold } =
      req.body;

    const batch = await Batch.create({
      batch_name,
      description,
      mentor_id: mentor_id || null,
      // Omitted -> model default (70.00); explicit "" is treated the
      // same as omitted rather than coerced into an invalid DECIMAL.
      default_passing_threshold:
        default_passing_threshold === "" ? undefined : default_passing_threshold,
    });

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
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

exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findByPk(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    await batch.destroy();

    res.json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const { batch_name, description, mentor_id, default_passing_threshold } =
      req.body;

    const batch = await Batch.findByPk(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    await batch.update({
      batch_name,
      description,
      mentor_id,
      default_passing_threshold:
        default_passing_threshold === ""
          ? batch.default_passing_threshold
          : default_passing_threshold,
    });

    res.json({
      success: true,
      message: "Batch updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
