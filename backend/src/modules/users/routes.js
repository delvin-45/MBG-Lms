const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userController = require('./controller');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Self profile actions (Any logged in user)
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, upload.single('avatar'), userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

// Administrative actions (Admin only)
router.get('/', protect, restrictTo('admin'), userController.getAllUsers);
router.post('/', protect, restrictTo('admin'), userController.createUser);
router.get('/:id', protect, restrictTo('admin'), userController.getUserById);
router.put('/:id', protect, restrictTo('admin'), userController.updateUser);
router.delete('/:id', protect, restrictTo('admin'), userController.deleteUser);

module.exports = router;
