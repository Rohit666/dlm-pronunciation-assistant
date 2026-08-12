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

module.exports = router;
