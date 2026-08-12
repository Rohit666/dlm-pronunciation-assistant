const aiRuntimeService = require("../services/aiRuntimeService");
const fs = require("fs");

exports.health = async (req, res) => {
  try {
    const health = await aiRuntimeService.health();

    res.json({
      success: true,
      runtime: health,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to connect to AI Runtime.",
    });
  }
};
exports.transcribe = async (req, res) => {
  try {
    const result = await aiRuntimeService.transcribe(
      req.body.audioPath,
      req.body.language,
    );

    res.json({
      success: true,

      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: "Failed to transcribe audio.",
    });
  }
};

exports.compare = async (req, res) => {
  try {
    const result = await aiRuntimeService.compare(req);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to compare recording.",
    });
  } finally {
    try {
      if (req.file) {
        // await fs.promises.unlink(req.file.path);
      }
    } catch (error) {
      console.warn("Unable to delete temporary comparison recording.", error);
    }
  }
};
