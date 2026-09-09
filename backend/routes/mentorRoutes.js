const express = require("express");

const router = express.Router();

const mentorController = require("../controllers/mentorController");
const exerciseController = require("../controllers/exerciseController");

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

// Milestone 9 — mentor authority to create exercises on their lessons.
router.post(
  "/lessons/:lessonId/exercises",
  verifyToken,
  allowRoles("mentor", "admin"),
  exerciseController.createExercise,
);
router.delete(
  "/exercises/:exerciseId",
  verifyToken,
  allowRoles("mentor", "admin"),
  exerciseController.deleteExercise,
);

module.exports = router;
