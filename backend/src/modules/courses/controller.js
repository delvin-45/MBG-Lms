const courseService = require('./service');

const getAllCourses = async (req, res, next) => {
  try {
    const { data, meta } = await courseService.getAllCourses(req.query);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Data course berhasil diambil.',
      data,
      meta
    });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const data = await courseService.getCourseById(req.params.id);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Detail course berhasil diambil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const data = await courseService.createCourse(req.body, req.user.id);
    res.status(201).json({
      status: 'success',
      code: '00',
      message: 'Course berhasil dibuat.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const data = await courseService.updateCourse(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Course berhasil diperbarui.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Course berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};

// Materials
const getMaterials = async (req, res, next) => {
  try {
    const data = await courseService.getMaterialsByCourse(req.params.courseId);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Data materi berhasil diambil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const data = await courseService.createMaterial(req.params.courseId, req.body, req.user.id, req.user.role);
    res.status(201).json({
      status: 'success',
      code: '00',
      message: 'Materi berhasil ditambahkan.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    const data = await courseService.updateMaterial(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Materi berhasil diperbarui.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    await courseService.deleteMaterial(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Materi berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
