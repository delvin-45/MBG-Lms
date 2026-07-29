const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const db = require('../config/db');
require('dotenv').config();

// Middleware Proteksi Autentikasi: Memastikan pengguna membawa Token JWT yang sah & akunnya aktif
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Ambil string token dari header Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Token tidak valid atau sudah expired', 401, '06'));
    }

    // 2. Verifikasi tanda tangan digital JWT dengan kunci rahasia
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Cek ke Database: Pastikan user belum dihapus dan statusnya BUKAN 'inactive'
    const userResult = await db.query('SELECT id, email, role, status FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return next(new AppError('Token tidak valid (User tidak ditemukan)', 401, '06'));
    }
    
    const user = userResult.rows[0];
    if (user.status === 'inactive') {
      return next(new AppError('Akun dinonaktifkan, silakan hubungi admin', 403, '08'));
    }

    // 4. Simpan identitas user ({ id, email, role }) ke objek req agar bisa dipakai controller
    req.user = decoded;
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

// Middleware Hak Akses Role (RBAC): Membatasi endpoint hanya untuk role tertentu (misal: 'admin' atau 'teacher')
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
