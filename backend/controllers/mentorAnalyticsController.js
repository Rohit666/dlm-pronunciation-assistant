const analyticsService = require("../services/analyticsService");
exports.getWeakStudents = async (req, res) => {
  try {
    const students = await analyticsService.getWeakStudents(req.user.id);

    res.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getInactiveStudents = async (req, res) => {
  try {
    const students = await analyticsService.getInactiveStudents(req.user.id);

    res.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getLessonEffectiveness = async (req, res) => {
  try {
    const lessons = await analyticsService.getLessonEffectiveness(req.user.id);
    res.json({
      success: true,
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
exports.getWeakOutcomes = async (req, res) => {
  try {
    const outcomes = await analyticsService.getWeakOutcomes(req.user.id);
    res.json({
      success: true,
      outcomes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getMostImprovedStudents = async (req, res) => {
  try {
    const students = await analyticsService.getMostImprovedStudents(
      req.user.id,
    );
    res.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
