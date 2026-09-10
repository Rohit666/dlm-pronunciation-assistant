const express = require("express");

const router = express.Router();

const menteeDashboardController = require("../controllers/menteeDashboardController");
const exerciseController = require("../controllers/exerciseController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/",
  verifyToken,
  allowRoles("mentee"),
  menteeDashboardController.getMenteeDashboard,
);

// Requirement 1.2 — live replacements for menteeInsightsService.js's
// remaining mocks (getDiscoveryCarousels / getCefrMilestones /
// getAttemptTrajectory). Paths match the "(proposed)" comments already
// left in that mock service.
router.get(
  "/carousels",
  verifyToken,
  allowRoles("mentee"),
  menteeDashboardController.getDiscoveryCarousels,
);
router.get(
  "/milestones",
  verifyToken,
  allowRoles("mentee"),
  menteeDashboardController.getCefrMilestones,
);
router.get(
  "/attempt-trajectory",
  verifyToken,
  allowRoles("mentee"),
  menteeDashboardController.getAttemptTrajectory,
);

// Comprehensive Assessment History Hub (mentee half) — every assessment
// attempt this mentee has submitted, across every lesson. Lives on
// exerciseController.js (kept alongside the rest of the exercise-attempt
// logic) but mounted here, since this router is already the mentee's
// cross-lesson data hub.
router.get(
  "/assessment-attempts",
  verifyToken,
  allowRoles("mentee"),
  exerciseController.getMenteeAssessmentAttempts,
);

module.exports = router;
