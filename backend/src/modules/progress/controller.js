const progressService = require('./service');

const getStudentProgress = async (req, res, next) => {
  try {
    const data = await progressService.getStudentProgress(req.user.id);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Data progress berhasil diambil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getCourseProgress = async (req, res, next) => {
  try {
    const data = await progressService.getCourseProgress(req.params.courseId, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Data progress course berhasil diambil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentProgress,
  getCourseProgress
};
