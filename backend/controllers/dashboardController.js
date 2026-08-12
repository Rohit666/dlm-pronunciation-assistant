const {
  getAdminDashboardStats,
  getMentorDashboardStats,
  getRecentActivities,
} = require("../services/analyticsService");

exports.getAdminStats = async (req, res) => {
  try {
    const stats = await getAdminDashboardStats();
    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
