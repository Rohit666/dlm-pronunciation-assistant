const express = require("express");
const router = express.Router();
const menteeInsightsController = require("../controllers/menteeInsightsController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/mentee/overview",
  verifyToken,
  allowRoles("mentee"),
  menteeInsightsController.getOverview,
);

router.get(
  "/mentee/phonemes",
  verifyToken,
  allowRoles("mentee"),
  menteeInsightsController.getPhonemes,
);

module.exports = router;
