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
router.post(
  "/",
  verifyToken,
  allowRoles("mentee"),
  upload.single("recording"),
  practiceController.submitPractice,
);

module.exports = router;
