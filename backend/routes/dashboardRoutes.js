const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/admin/stats",
  verifyToken,
  allowRoles("admin"),
  dashboardController.getAdminStats,
);

module.exports = router;
