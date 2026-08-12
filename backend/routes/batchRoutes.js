const express = require("express");

const router = express.Router();

const batchController = require("../controllers/batchController");

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

router.get("/", verifyToken, allowRoles("admin"), batchController.getBatches);

router.post("/", verifyToken, allowRoles("admin"), batchController.createBatch);

router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  batchController.deleteBatch,
);
router.put(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  batchController.updateBatch,
);
module.exports = router;
