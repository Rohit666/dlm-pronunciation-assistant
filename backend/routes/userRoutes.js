const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

const {
  verifyToken,
} = require('../middleware/authMiddleware');

const {
  allowRoles,
} = require('../middleware/roleMiddleware');

// Admin only
router.post(
  '/',
  verifyToken,
  allowRoles('admin'),
  userController.createUser
);

// Admin only
router.get(
  '/',
  verifyToken,
  allowRoles('admin'),
  userController.getUsers
);

module.exports = router;