const express = require("express");

const router = express.Router();

const analyticsController = require("../controllers/mentorAnalyticsController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/weak-students",
  verifyToken,
  allowRoles("mentor"),
  analyticsController.getWeakStudents,
);
router.get(
  "/inactive-students",
  verifyToken,
  allowRoles("mentor"),
  analyticsController.getInactiveStudents,
);
router.get(
  "/lesson-effectiveness",
  verifyToken,
  allowRoles("mentor"),
  analyticsController.getLessonEffectiveness,
);
router.get(
  "/weak-outcomes",
  verifyToken,
  allowRoles("mentor"),
  analyticsController.getWeakOutcomes,
);
router.get(
  "/most-improved-students",
  verifyToken,
  allowRoles("mentor"),
  analyticsController.getMostImprovedStudents,
);
module.exports = router;
