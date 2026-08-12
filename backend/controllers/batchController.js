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
    const { batch_name, description, mentor_id } = req.body;

    const batch = await Batch.create({
      batch_name,
      description,
      mentor_id: mentor_id || null,
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

    const { batch_name, description, mentor_id } = req.body;

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
