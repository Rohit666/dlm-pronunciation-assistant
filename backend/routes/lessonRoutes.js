const express = require("express");

const router = express.Router();

const lessonController = require("../controllers/lessonController");
const exerciseController = require("../controllers/exerciseController");

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
