const express = require('express');
const courseController = require('./controller');
const { protect, restrictTo } = require('../../middlewares/auth');

const courseRouter = express.Router();
const materialRouter = express.Router();

// --- Course endpoints ---
// GET: any authenticated user (doc: Bearer Token, no role restriction)
courseRouter.get('/', protect, restrictTo('student', 'teacher', 'admin'), courseController.getAllCourses);
courseRouter.get('/:id', protect, restrictTo('student', 'teacher', 'admin'), courseController.getCourseById);

// POST/PUT/DELETE: Teacher (ownership enforced inside service)
courseRouter.post('/', protect, restrictTo('teacher'), courseController.createCourse);
courseRouter.put('/:id', protect, restrictTo('teacher'), courseController.updateCourse);
courseRouter.delete('/:id', protect, restrictTo('teacher'), courseController.deleteCourse);

// --- Material endpoints (nested under courses) ---
// GET: any authenticated user
courseRouter.get('/:courseId/materials', protect, restrictTo('student', 'teacher', 'admin'), courseController.getMaterials);
// POST: Teacher only (ownership enforced inside service)
courseRouter.post('/:courseId/materials', protect, restrictTo('teacher'), courseController.createMaterial);

// --- Standalone Material endpoints ---
materialRouter.put('/:id', protect, restrictTo('teacher'), courseController.updateMaterial);
materialRouter.delete('/:id', protect, restrictTo('teacher'), courseController.deleteMaterial);

module.exports = {
  courseRouter,
  materialRouter
};
