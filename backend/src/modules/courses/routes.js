const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const courseController = require('./controller');
const { protect, restrictTo } = require('../../middlewares/auth');

const courseRouter = express.Router();
const materialRouter = express.Router();

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
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Course endpoints
courseRouter.get('/', protect, restrictTo('student', 'teacher'), courseController.getAllCourses);
courseRouter.post('/', protect, restrictTo('teacher'), upload.single('thumbnail'), courseController.createCourse);
courseRouter.get('/:id', protect, restrictTo('student', 'teacher'), courseController.getCourseById);
courseRouter.put('/:id', protect, restrictTo('teacher'), upload.single('thumbnail'), courseController.updateCourse);
courseRouter.delete('/:id', protect, restrictTo('teacher'), courseController.deleteCourse);

// Material endpoints relative to courses
courseRouter.get('/:courseId/materials', protect, restrictTo('student', 'teacher'), courseController.getMaterials);
courseRouter.post('/:courseId/materials', protect, restrictTo('teacher'), upload.single('materialFile'), courseController.createMaterial);

// Standalone Material endpoints
materialRouter.put('/:id', protect, restrictTo('teacher'), upload.single('materialFile'), courseController.updateMaterial);
materialRouter.delete('/:id', protect, restrictTo('teacher'), courseController.deleteMaterial);

module.exports = {
  courseRouter,
  materialRouter
};
