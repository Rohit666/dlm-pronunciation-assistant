const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

// Admin only
router.post("/", verifyToken, allowRoles("admin"), userController.createUser);

// Admin only
router.get("/", verifyToken, allowRoles("admin"), userController.getUsers);
router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  userController.deleteUser,
);
router.put("/:id", verifyToken, allowRoles("admin"), userController.updateUser);

module.exports = router;
