const express = require("express");

const router = express.Router();

const mentorController = require("../controllers/mentorController");
const exerciseController = require("../controllers/exerciseController");
const topicController = require("../controllers/topicController");

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

// Hierarchical Content Tree — mentor authority to shape a course's topic
// tree. Read side (GET tree) lives on lessonRoutes.js since mentees read
// it too.
router.post(
  "/courses/:lessonId/topics",
  verifyToken,
  allowRoles("mentor", "admin"),
  topicController.createTopic,
);
router.put(
  "/topics/:topicId",
  verifyToken,
  allowRoles("mentor", "admin"),
  topicController.updateTopic,
);
router.delete(
  "/topics/:topicId",
  verifyToken,
  allowRoles("mentor", "admin"),
  topicController.deleteTopic,
);

module.exports = router;
