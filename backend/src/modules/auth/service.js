const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const { redisClient } = require('../../config/redis');
const { AppError } = require('../../middlewares/errorHandler');
require('dotenv').config();

const REFRESH_TTL = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SEC, 10) || 604800;

const register = async (userData) => {
  const { fullName, email, password, role } = userData;

  if (!fullName) throw new AppError('fullName tidak boleh kosong', 400, '02');
  if (!email) throw new AppError('email tidak boleh kosong', 400, '02');
  if (!password) throw new AppError('password tidak boleh kosong', 400, '02');
  if (!role) throw new AppError('role tidak boleh kosong', 400, '02');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Format email tidak valid', 400, '03');
  }

  const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (userCheck.rows.length > 0) {
    throw new AppError('Email sudah terdaftar', 409, '04');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email, role, created_at`,
    [fullName, email, passwordHash, role]
  );

  const u = result.rows[0];
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    createdAt: u.created_at
  };
};

const login = async (credentials) => {
  const { email, password } = credentials;

  if (!email) throw new AppError('email tidak boleh kosong', 400, '02');
  if (!password) throw new AppError('password tidak boleh kosong', 400, '02');

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new AppError('Email/username atau password salah', 401, '05');
  }

  const user = result.rows[0];
  if (user.status === 'inactive') {
    throw new AppError('Akun dinonaktifkan, silakan hubungi admin', 403, '08');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Email/username atau password salah', 401, '05');
  }

  // Generate tokens with separate secrets for access and refresh
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  // Store refresh token in Redis for server-side revocation (TTL = 7 days)
  await redisClient.set(
    `refresh_token:${user.id}:${refreshToken}`,
    'valid',
    { EX: REFRESH_TTL }
  );

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      id: user.id,
      fullName: user.full_name,
      role: user.role
    }
  };
};

const refreshToken = async (token) => {
  if (!token) {
    throw new AppError('Token tidak valid atau sudah expired', 401, '06');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Token tidak valid atau sudah expired', 401, '06');
  }

  // Revocation check: token must exist in Redis
  const redisKey = `refresh_token:${decoded.id}:${token}`;
  const exists = await redisClient.get(redisKey);
  if (!exists) {
    throw new AppError('Token tidak valid atau sudah expired', 401, '06');
  }

  // Get fresh user data to ensure role/email are up to date
  const userResult = await db.query(
    'SELECT id, email, role, status FROM users WHERE id = $1',
    [decoded.id]
  );
  if (userResult.rows.length === 0) {
    throw new AppError('Token tidak valid atau sudah expired', 401, '06');
  }

  const user = userResult.rows[0];
  if (user.status === 'inactive') {
    throw new AppError('Akun dinonaktifkan, silakan hubungi admin', 403, '08');
  }
  const newAccessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  return {
    accessToken: newAccessToken,
    expiresIn: 3600
  };
};

const logout = async (userId, token) => {
  if (!token) {
    throw new AppError('Token tidak valid atau sudah expired', 401, '06');
  }
  // Actually revoke the refresh token — delete from Redis
  const redisKey = `refresh_token:${userId}:${token}`;
  await redisClient.del(redisKey);
  return null;
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
