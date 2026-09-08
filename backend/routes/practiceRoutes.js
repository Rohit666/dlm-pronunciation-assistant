const express = require("express");
const router = express.Router();
const practiceController = require("../controllers/practiceController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get(
  "/history",
  verifyToken,
  allowRoles("mentee"),
  practiceController.getPracticeHistory,
);

// Transient — never writes a permanent assessment. Takes the raw
// recording, returns the AI evaluation + a one-time assessment_token.
router.post(
  "/compare",
  verifyToken,
  allowRoles("mentee"),
  upload.single("recording"),
  practiceController.compare,
);

// Permanent — no file upload anymore (the recording was already
// captured at /compare time); takes JSON/form fields
// { lesson_sentence_id, practice_attempt_id, assessment_token }.
router.post(
  "/",
  verifyToken,
  allowRoles("mentee"),
  practiceController.submitPractice,
);

module.exports = router;
