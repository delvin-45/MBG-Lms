const authService = require('./service');

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({
      status: 'success',
      code: '00',
      message: 'User registered successfully',
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
      message: 'Login successful',
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
      message: 'Token refreshed successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    await authService.logout(req.user.id);
    res.status(200).json({
      status: 'success',
      code: '00',
      message: 'Logged out successfully'
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
