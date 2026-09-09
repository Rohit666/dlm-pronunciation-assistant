const express = require("express");

const router = express.Router();

const menteeDashboardController = require("../controllers/menteeDashboardController");

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

module.exports = router;
