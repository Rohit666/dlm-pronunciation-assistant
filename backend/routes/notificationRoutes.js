const express = require("express");

const router = express.Router();

const notificationController = require("../controllers/notificationController");

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/",
  verifyToken,
  allowRoles("admin", "mentor", "mentee"),
  notificationController.getNotifications,
);

router.patch(
  "/:id/read",
  verifyToken,
  allowRoles("admin", "mentor", "mentee"),
  notificationController.markAsRead,
);

module.exports = router;
