const express = require("express");

const router = express.Router();

const lessonController = require("../controllers/lessonController");
const exerciseController = require("../controllers/exerciseController");
const topicController = require("../controllers/topicController");
const courseStreamController = require("../controllers/courseStreamController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

router.get("/", verifyToken, lessonController.getLessons);

router.post(
  "/",
  verifyToken,
  allowRoles("admin", "mentor"),
  upload.single("thumbnail"),
  lessonController.createLesson,
);
router.get("/:id", verifyToken, lessonController.getLessonById);

// Milestone 9 — GET /api/lessons/:lessonId/exercises. Separate segment
// count from "/:id" above, no route collision.
router.get(
  "/:lessonId/exercises",
  verifyToken,
  exerciseController.getLessonExercises,
);

// Hierarchical Content Tree — read side. Tree powers the mentor Tree
// Explorer; stream/progress power the mentee unified sequential player.
router.get("/:lessonId/tree", verifyToken, topicController.getCourseTree);
router.get("/:lessonId/stream", verifyToken, courseStreamController.getStream);
router.get(
  "/:lessonId/progress",
  verifyToken,
  allowRoles("mentee"),
  courseStreamController.getProgress,
);
router.post(
  "/:lessonId/progress",
  verifyToken,
  allowRoles("mentee"),
  courseStreamController.updateProgress,
);
// Resolved resume target — first incomplete stream item, not the raw
// last-touched pointer /progress above returns.
router.get(
  "/:lessonId/resume",
  verifyToken,
  allowRoles("mentee"),
  courseStreamController.getResumeTarget,
);

router.put(
  "/:id",
  verifyToken,
  allowRoles("mentor"),
  upload.single("thumbnail"),
  lessonController.updateLesson,
);
router.patch(
  "/:id/status",
  verifyToken,
  allowRoles("mentor"),
  lessonController.updateLessonStatus,
);
router.delete(
  "/:id",
  verifyToken,
  allowRoles("mentor"),
  lessonController.deleteLesson,
);
module.exports = router;
