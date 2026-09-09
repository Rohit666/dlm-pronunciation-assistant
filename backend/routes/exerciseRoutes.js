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

module.exports = router;
