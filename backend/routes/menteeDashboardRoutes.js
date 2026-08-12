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

module.exports = router;
