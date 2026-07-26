const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const db = require('../config/db');
require('dotenv').config();

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Token tidak valid atau sudah expired', 401, '06'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is not inactive
    const userResult = await db.query('SELECT id, email, role, status FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return next(new AppError('Token tidak valid (User tidak ditemukan)', 401, '06'));
    }
    
    const user = userResult.rows[0];
    if (user.status === 'inactive') {
      return next(new AppError('Akun dinonaktifkan, silakan hubungi admin', 403, '08'));
    }

    req.user = decoded; // decoded contains { id, email, role }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token sudah expired', 401, '06'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token tidak valid', 401, '06'));
    }
    next(error);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07')
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
