const express = require("express");

const router = express.Router();

const recommendationController = require("../controllers/recommendationController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/",
  verifyToken,
  allowRoles("mentee"),
  recommendationController.getRecommendations,
);

// Requirement 3.2 — new, additive multi-skill adaptive engine. Left as
// a distinct path rather than replacing "/" — see
// recommendationService.js's getMenteeAdaptiveRecommendation comment.
router.get(
  "/mentee",
  verifyToken,
  allowRoles("mentee"),
  recommendationController.getMenteeAdaptiveRecommendation,
);

module.exports = router;
