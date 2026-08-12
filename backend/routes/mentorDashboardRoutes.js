const express = require("express");

const router = express.Router();

const mentorDashboardController = require("../controllers/mentorDashboardController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/",
  verifyToken,
  allowRoles("mentor"),
  mentorDashboardController.getMentorDashboard,
);
module.exports = router;
