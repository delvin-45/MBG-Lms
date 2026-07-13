const db = require('../../config/db');
const { redisClient } = require('../../config/redis');
const { hashPassword, comparePassword } = require('../../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');
const { AppError } = require('../../middlewares/errorHandler');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (userData) => {
  const { fullName, email, password, role, phoneNumber } = userData;

  // Validation
  if (!fullName) throw new AppError('fullName tidak boleh kosong', 400, '02');
  if (!email) throw new AppError('email tidak boleh kosong', 400, '02');
  if (!password) throw new AppError('password tidak boleh kosong', 400, '02');
  if (!role) throw new AppError('role tidak boleh kosong', 400, '02');

  // Role validation
  if (!['teacher', 'student'].includes(role)) {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 400, '07');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Format email tidak valid', 400, '03');
  }

  // Check if email already registered
  const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (userCheck.rows.length > 0) {
    throw new AppError('Email sudah terdaftar', 409, '04');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Insert user
  const result = await db.query(
    `INSERT INTO users (full_name, email, password_hash, role, phone_number)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role, phone_number, created_at`,
    [fullName, email, passwordHash, role, phoneNumber || null]
  );

  const newUser = result.rows[0];
  return {
    id: newUser.id,
    fullName: newUser.full_name,
    email: newUser.email,
    role: newUser.role,
    phoneNumber: newUser.phone_number,
    createdAt: newUser.created_at
  };
};

const login = async (loginData) => {
  const { email, password } = loginData;

  if (!email) throw new AppError('email tidak boleh kosong', 400, '02');
  if (!password) throw new AppError('password tidak boleh kosong', 400, '02');

  // Find user
  const result = await db.query(
    'SELECT id, full_name, email, password_hash, role, avatar_url, phone_number FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Email/username atau password salah', 401, '05');
  }

  const user = result.rows[0];

  // Compare password
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Email/username atau password salah', 401, '05');
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  // Simpan ke Redis
  const redisKey = `refresh_token:${user.id}:${refreshToken}`;
  await redisClient.set(redisKey, 'valid', {
    EX: 7 * 24 * 60 * 60 // 7 days
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url,
      phoneNumber: user.phone_number
    }
  };
};

const refreshToken = async (token) => {
  if (!token) throw new AppError('refreshToken tidak boleh kosong', 400, '02');

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Check in Redis
    const redisKey = `refresh_token:${decoded.id}:${token}`;
    const exists = await redisClient.get(redisKey);

    if (!exists) {
      throw new AppError('Token tidak valid atau sudah expired', 401, '06');
    }

    // Fetch fresh user details to make sure role and email are up-to-date
    const userResult = await db.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      throw new AppError('Token tidak valid atau sudah expired', 401, '06');
    }

    const user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      role: userResult.rows[0].role
    };

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Invalidate old refresh token in Redis
    await redisClient.del(redisKey);

    // Save new refresh token in Redis
    const ttl = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SEC, 10) || 604800;
    await redisClient.set(
      `refresh_token:${decoded.id}:${newRefreshToken}`,
      'active',
      { EX: ttl }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (err) {
    throw new AppError('Token tidak valid atau sudah expired', 401, '06');
  }
};

const logout = async (userId, token) => {
  if (token) {
    // Revoke only the specific refresh token
    const redisKey = `refresh_token:${userId}:${token}`;
    await redisClient.del(redisKey);
  } else {
    // Fallback: Revoke all refresh tokens for this user
    const keys = await redisClient.keys(`refresh_token:${userId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
  return true;
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
