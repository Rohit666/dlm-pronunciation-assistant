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
  upload.fields([
    {
      name: "sentence_audio",
      maxCount: 1,
    },
    {
      name: "sentence_image",
      maxCount: 1,
    },
    {
      name: "sentence_video",
      maxCount: 1,
    },
  ]),
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
  upload.fields([
    {
      name: "audio",
      maxCount: 1,
    },
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  lessonSentenceController.updateSentence,
);
module.exports = router;
