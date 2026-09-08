const express = require("express");

const router = express.Router();

const lessonSentenceController = require("../controllers/lessonSentenceController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

router.get(
  "/:lessonId",
  verifyToken,
  lessonSentenceController.getLessonSentences,
);

router.post(
  "/:lessonId",
  verifyToken,
  allowRoles("admin", "mentor"),
  // Block count is dynamic (Part 1 content builder) — files arrive as
  // block_<blockIndex>_attachment_<attachmentIndex>, so a fixed
  // upload.fields([...]) list no longer works. upload.any() accepts
  // arbitrary field names; the controller maps req.files back onto
  // content_blocks by fieldname.
  upload.any(),
  lessonSentenceController.createSentence,
);

router.delete(
  "/sentence/:id",
  verifyToken,
  allowRoles("admin", "mentor"),
  lessonSentenceController.deleteSentence,
);
router.put(
  "/reorder",
  verifyToken,
  allowRoles("mentor"),
  lessonSentenceController.reorderSentences,
);
router.put(
  "/:id",
  verifyToken,
  allowRoles("mentor"),
  upload.any(),
  lessonSentenceController.updateSentence,
);
module.exports = router;
