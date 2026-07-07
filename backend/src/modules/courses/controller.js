const courseService = require('./service');

const getAllCourses = async (req, res, next) => {
  try {
    const { data, meta } = await courseService.getAllCourses(req.query);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Courses retrieved successfully',
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
      message: 'Course retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const courseData = { ...req.body };
    if (req.file) {
      courseData.thumbnail_url = `/uploads/${req.file.filename}`;
    }
    const data = await courseService.createCourse(courseData, req.user.id);
    res.status(201).json({
      status: 'success',
      code: '00',
      message: 'Course created successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const courseData = { ...req.body };
    if (req.file) {
      courseData.thumbnail_url = `/uploads/${req.file.filename}`;
    }
    const data = await courseService.updateCourse(req.params.id, courseData, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Course updated successfully',
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
      message: 'Course deleted successfully'
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
      message: 'Materials retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const materialData = { ...req.body };
    if (req.file) {
      materialData.content = `/uploads/${req.file.filename}`;
    }
    const data = await courseService.createMaterial(req.params.courseId, materialData, req.user.id, req.user.role);
    res.status(201).json({
      status: 'success',
      code: '00',
      message: 'Material created successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    const materialData = { ...req.body };
    if (req.file) {
      materialData.content = `/uploads/${req.file.filename}`;
    }
    const data = await courseService.updateMaterial(req.params.id, materialData, req.user.id, req.user.role);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Material updated successfully',
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
      message: 'Material deleted successfully'
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
