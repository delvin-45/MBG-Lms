const assignmentService = require('./service');

const getAssignmentsByCourse = async (req, res, next) => {
  try {
    const data = await assignmentService.getAssignmentsByCourse(req.params.courseId);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Assignments retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const data = await assignmentService.createAssignment(req.params.courseId, req.body, req.user.id, req.user.role);
    res.status(201).json({
      status: 'success',
      code: '00',
      message: 'Assignment created successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const data = await assignmentService.updateAssignment(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Assignment updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    await assignmentService.deleteAssignment(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const submitAssignment = async (req, res, next) => {
  try {
    // req.file is populated by multer middleware
    const { note } = req.body;
    const data = await assignmentService.submitAssignment(req.params.id, req.user.id, req.file, note);
    res.status(201).json({
      status: 'success',
      code: '00',
      message: 'Assignment submitted successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getSubmissions = async (req, res, next) => {
  try {
    const data = await assignmentService.getSubmissions(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Submissions retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const gradeSubmission = async (req, res, next) => {
  try {
    const { score } = req.body;
    const data = await assignmentService.gradeSubmission(req.params.submissionId, score, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Submission graded successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getMySubmission = async (req, res, next) => {
  try {
    const data = await assignmentService.getMySubmission(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Submission retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  getMySubmission
};
