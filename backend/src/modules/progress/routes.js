const express = require('express');
const progressController = require('./controller');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

router.get('/me', protect, restrictTo('student'), progressController.getStudentProgress);
router.get('/course/:courseId', protect, restrictTo('teacher'), progressController.getCourseProgress);

module.exports = router;
