const { Notification } = require("../models");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        user_id: req.user.id,
      },

      order: [["created_at", "DESC"]],

      limit: 20,
    });

    const unreadCount = await Notification.count({
      where: {
        user_id: req.user.id,

        is_read: false,
      },
    });

    res.json({
      success: true,

      notifications,

      unreadCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.update(
      {
        is_read: true,
      },
      {
        where: {
          id,

          user_id: req.user.id,
        },
      },
    );

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
