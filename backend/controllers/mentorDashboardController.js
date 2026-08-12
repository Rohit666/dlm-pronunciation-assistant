const analyticsService = require("../services/analyticsService");
exports.getMentorDashboard = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const stats = await analyticsService.getMentorDashboardStats(mentorId);
    const recentActivities = await analyticsService.getRecentActivities();

    res.json({
      success: true,
      stats: stats,
      recentActivities,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
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
