const express = require("express");
const router = express.Router();
const mentorInsightsController = require("../controllers/mentorInsightsController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/mentor/cohort-heatmap",
  verifyToken,
  allowRoles("mentor"),
  mentorInsightsController.getCohortHeatmap,
);

router.get(
  "/mentor/student-tiers",
  verifyToken,
  allowRoles("mentor"),
  mentorInsightsController.getStudentTiers,
);

module.exports = router;
