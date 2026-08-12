const express = require("express");

const router = express.Router();

const menteeController = require("../controllers/menteeController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

router.get("/", verifyToken, allowRoles("admin"), menteeController.getMentees);

router.post(
  "/",
  verifyToken,
  allowRoles("admin"),
  menteeController.createMentee,
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  menteeController.deleteMentee,
);
router.put(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  menteeController.updateMentee,
);
module.exports = router;
