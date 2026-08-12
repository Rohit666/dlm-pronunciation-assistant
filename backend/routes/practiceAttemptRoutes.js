const express = require("express");
const router = express.Router();
const practiceAttemptController = require("../controllers/practiceAttemptController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
router.get(
  "/my-attempts",
  verifyToken,
  allowRoles("mentee"),
  practiceAttemptController.getMyAttempts,
);
router.get(
  "/:id",
  verifyToken,
  allowRoles("mentee"),
  practiceAttemptController.getPracticeAttempt,
);
router.post(
  "/start",
  verifyToken,
  allowRoles("mentee"),
  practiceAttemptController.startPracticeAttempt,
);
router.put(
  "/:id/progress",
  verifyToken,
  allowRoles("mentee"),
  practiceAttemptController.updateAttemptProgress,
);
router.post(
  "/:id/complete",
  verifyToken,
  allowRoles("mentee"),
  practiceAttemptController.completeAttempt,
);
router.get(
  "/result/:id",
  verifyToken,
  allowRoles("mentee"),
  practiceAttemptController.getAttemptResult,
);
router.get(
  "/lesson/:lessonId/active",
  verifyToken,
  allowRoles("mentee"),
  practiceAttemptController.getActiveAttempt,
);
module.exports = router;
