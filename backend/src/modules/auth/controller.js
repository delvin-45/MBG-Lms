const authService = require('./service');

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({
      status: 'success',
      code: '00',
      message: 'Registrasi berhasil, silakan login.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Login berhasil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refreshToken(refreshToken);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Token berhasil diperbarui.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user.id, refreshToken);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Logout berhasil.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
