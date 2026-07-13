const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const assignmentController = require('./controller');
const { protect, restrictTo } = require('../../middlewares/auth');

const courseAssignmentRouter = express.Router();
const assignmentRouter = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine configuration
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

// Routes mounted under /api/v1/courses (course-specific assignments)
courseAssignmentRouter.get('/:courseId/assignments', protect, restrictTo('teacher', 'student'), assignmentController.getAssignmentsByCourse);
courseAssignmentRouter.post('/:courseId/assignments', protect, restrictTo('teacher'), assignmentController.createAssignment);

// Standalone routes mounted under /api/v1/assignments
assignmentRouter.put('/:id', protect, restrictTo('teacher'), assignmentController.updateAssignment);
assignmentRouter.delete('/:id', protect, restrictTo('teacher'), assignmentController.deleteAssignment);
assignmentRouter.post('/:id/submit', protect, restrictTo('student'), upload.single('file'), assignmentController.submitAssignment);
assignmentRouter.get('/:id/submissions', protect, restrictTo('teacher'), assignmentController.getSubmissions);
assignmentRouter.put('/submissions/:submissionId/grade', protect, restrictTo('teacher'), assignmentController.gradeSubmission);
assignmentRouter.get('/:id/submission', protect, restrictTo('student'), assignmentController.getMySubmission);

module.exports = {
  courseAssignmentRouter,
  assignmentRouter
};
