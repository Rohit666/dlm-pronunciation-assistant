const express = require("express");

const router = express.Router();

const aiRuntimeController = require("../controllers/aiRuntimeController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/health", verifyToken, aiRuntimeController.health);
router.post("/transcribe", verifyToken, aiRuntimeController.transcribe);
router.post(
  "/compare",
  verifyToken,
  allowRoles("mentee"),
  upload.single("recording"),
  aiRuntimeController.compare,
);
module.exports = router;
