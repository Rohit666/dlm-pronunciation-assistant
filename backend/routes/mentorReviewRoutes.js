const express = require("express");

const router = express.Router();

const mentorReviewController = require("../controllers/mentorReviewController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

// router.get(
//   "/",
//   verifyToken,
//   allowRoles("mentor"),
//   mentorReviewController.getMentorReviews,
// );
router.get(
  "/attempts",
  verifyToken,
  allowRoles("mentor"),
  mentorReviewController.getReviewAttempts,
);
router.get(
  "/attempt/:id",
  verifyToken,
  allowRoles("mentor"),
  mentorReviewController.getReviewAttemptDetails,
);
router.put(
  "/attempt/:id",
  verifyToken,
  allowRoles("mentor"),
  mentorReviewController.saveAttemptReview,
);

module.exports = router;
