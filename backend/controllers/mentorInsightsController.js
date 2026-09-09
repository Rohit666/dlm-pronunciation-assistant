const mentorInsightsService = require("../services/mentorInsightsService");

// GET /api/analytics/mentor/cohort-heatmap?batch_id=:id (optional)
exports.getCohortHeatmap = async (req, res) => {
  try {
    const batchId = req.query.batch_id ? Number(req.query.batch_id) : null;
    const heatmap = await mentorInsightsService.getCohortHeatmap(
      req.user.id,
      batchId,
    );
    res.json({ success: true, heatmap });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

// GET /api/analytics/mentor/student-tiers?batch_id=:id (optional)
exports.getStudentTiers = async (req, res) => {
  try {
    const batchId = req.query.batch_id ? Number(req.query.batch_id) : null;
    const students = await mentorInsightsService.getStudentTiers(
      req.user.id,
      batchId,
    );
    res.json({ success: true, students });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Server error",
    });
  }
};
