const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const { AppError } = require('../../middlewares/errorHandler');
require('dotenv').config();

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const register = async (userData) => {
  const { fullName, email, password, role, phoneNumber } = userData;

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
    `INSERT INTO users (full_name, email, password_hash, role, phone_number)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role, phone_number, created_at`,
    [fullName, email, passwordHash, role, phoneNumber || null]
  );

  const u = result.rows[0];
  // Exact fields for register
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
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Email/username atau password salah', 401, '05');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Exact fields for login
  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
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

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      throw new AppError('Data tidak ditemukan', 401, '01');
    }
    const user = userResult.rows[0];
    const tokens = generateTokens(user);
    // Exact fields for refresh token
    return {
      accessToken: tokens.accessToken,
      expiresIn: 3600
    };
  } catch (error) {
    throw new AppError('Token tidak valid atau sudah expired', 401, '06');
  }
};

const logout = async (userId, token) => {
  if (!token) {
    throw new AppError('Token tidak valid atau sudah expired', 401, '06');
  }
  // no return data for logout
  return null;
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
