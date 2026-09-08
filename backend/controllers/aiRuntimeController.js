const aiRuntimeService = require("../services/aiRuntimeService");

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

// compare() moved to practiceController.compare (POST /api/practice/compare)
// as part of the Transient Compare vs. Permanent Submit rearchitecture —
// it now needs the mentee lookup + assessment_token caching that belong
// with the practice flow, not the ai-runtime passthrough.
