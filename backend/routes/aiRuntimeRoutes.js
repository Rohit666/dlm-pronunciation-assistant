const express = require("express");

const router = express.Router();

const aiRuntimeController = require("../controllers/aiRuntimeController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/health", verifyToken, aiRuntimeController.health);
router.post("/transcribe", verifyToken, aiRuntimeController.transcribe);

// /compare moved to POST /api/practice/compare — see
// controllers/practiceController.js and routes/practiceRoutes.js.

module.exports = router;
