const express = require("express");

const router = express.Router();

const mentorController = require("../controllers/mentorController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/batches",
  verifyToken,
  allowRoles("mentor"),
  mentorController.getMentorBatches,
);

router.get(
  "/mentees",
  verifyToken,
  allowRoles("mentor"),
  mentorController.getMentorMentees,
);

module.exports = router;
