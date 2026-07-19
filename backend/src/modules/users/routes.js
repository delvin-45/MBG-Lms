const express = require('express');
const userController = require('./controller');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

// Self profile actions (Any logged-in user — no role restriction)
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

// Administrative actions (Admin only)
router.get('/', protect, restrictTo('admin'), userController.getAllUsers);
router.post('/', protect, restrictTo('admin'), userController.createUser);
router.get('/:id', protect, restrictTo('admin'), userController.getUserById);
router.put('/:id', protect, restrictTo('admin'), userController.updateUser);
router.delete('/:id', protect, restrictTo('admin'), userController.deleteUser);

module.exports = router;
