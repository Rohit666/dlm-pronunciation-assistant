const express = require("express");
const router = express.Router();
const exerciseController = require("../controllers/exerciseController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/:exerciseId",
  verifyToken,
  exerciseController.getExerciseById,
);

router.post(
  "/:exerciseId/submit",
  verifyToken,
  allowRoles("mentee"),
  exerciseController.submitExercise,
);

router.get(
  "/:exerciseId/attempts",
  verifyToken,
  allowRoles("mentee"),
  exerciseController.getExerciseAttempts,
);

// Comprehensive Assessment History Hub (mentee half) — full report card
// for one of this mentee's own past attempts. Two path segments, so it
// never collides with GET /:exerciseId above (Express matches by
// segment count, not declaration order, but kept below it for clarity).
router.get(
  "/attempts/:attemptId",
  verifyToken,
  allowRoles("mentee"),
  exerciseController.getMenteeAttemptDetail,
);

module.exports = router;
