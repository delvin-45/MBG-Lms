const userService = require('./service');

const getAllUsers = async (req, res, next) => {
  try {
    const { data, meta } = await userService.getAllUsers(req.query);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Data pengguna berhasil diambil.',
      data,
      meta
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const data = await userService.getUserById(req.params.id);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Data pengguna berhasil diambil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const data = await userService.createUser(req.body);
    res.status(201).json({
      status: 'success',
      code: '00',
      message: 'Pengguna baru berhasil ditambahkan.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const data = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Data pengguna berhasil diperbarui.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Pengguna berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const data = await userService.getProfile(req.user.id);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Data profil berhasil diambil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profileData = { ...req.body };
    if (req.file) {
      profileData.avatarUrl = `/uploads/${req.file.filename}`;
    }
    const data = await userService.updateProfile(req.user.id, profileData);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Profil berhasil diperbarui.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Password berhasil diubah.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword
};
