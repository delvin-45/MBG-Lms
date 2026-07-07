const db = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/hash');
const { AppError } = require('../../middlewares/errorHandler');

const getAllUsers = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const { role, search } = query;

  let queryText = 'SELECT id, full_name, email, role, phone_number, avatar_url, created_at FROM users WHERE 1=1';
  const queryParams = [];
  let paramCount = 1;

  if (role) {
    queryText += ` AND role = $${paramCount}`;
    queryParams.push(role);
    paramCount++;
  }

  if (search) {
    queryText += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
    queryParams.push(`%${search}%`);
    paramCount++;
  }

  // Get total count for pagination meta
  let countQueryText = 'SELECT COUNT(*) FROM users WHERE 1=1';
  const countQueryParams = [...queryParams];
  if (role) {
    countQueryText += ' AND role = $1';
  }
  if (search) {
    countQueryText += role ? ' AND (full_name ILIKE $2 OR email ILIKE $2)' : ' AND (full_name ILIKE $1 OR email ILIKE $1)';
  }

  const countResult = await db.query(countQueryText, countQueryParams);
  const total = parseInt(countResult.rows[0].count, 10);

  // Add order, limit & offset
  queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  queryParams.push(limit, offset);

  const { rows } = await db.query(queryText, queryParams);

  const data = rows.map(u => ({
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    phoneNumber: u.phone_number,
    avatarUrl: u.avatar_url,
    createdAt: u.created_at
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

const getUserById = async (id) => {
  const result = await db.query(
    'SELECT id, full_name, email, role, phone_number, avatar_url, created_at FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404, '01');
  }

  const u = result.rows[0];
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    phoneNumber: u.phone_number,
    avatarUrl: u.avatar_url,
    createdAt: u.created_at
  };
};

const createUser = async (userData) => {
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

  const passwordHash = await hashPassword(password);

  const result = await db.query(
    `INSERT INTO users (full_name, email, password_hash, role, phone_number)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role, phone_number, created_at`,
    [fullName, email, passwordHash, role, phoneNumber || null]
  );

  const u = result.rows[0];
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    phoneNumber: u.phone_number,
    createdAt: u.created_at
  };
};

const updateUser = async (id, userData) => {
  const { fullName, role, phoneNumber } = userData;

  const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
  if (userCheck.rows.length === 0) {
    throw new AppError('User not found', 404, '01');
  }

  const result = await db.query(
    `UPDATE users 
     SET full_name = COALESCE($1, full_name), 
         role = COALESCE($2, role), 
         phone_number = COALESCE($3, phone_number)
     WHERE id = $4
     RETURNING id, full_name, email, role, phone_number, avatar_url, created_at`,
    [fullName, role, phoneNumber, id]
  );

  const u = result.rows[0];
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    phoneNumber: u.phone_number,
    avatarUrl: u.avatar_url,
    createdAt: u.created_at
  };
};

const deleteUser = async (id) => {
  const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
  if (userCheck.rows.length === 0) {
    throw new AppError('User not found', 404, '01');
  }

  await db.query('DELETE FROM users WHERE id = $1', [id]);
  return true;
};

const getProfile = async (id) => {
  return getUserById(id);
};

const updateProfile = async (id, profileData) => {
  const { fullName, phoneNumber, avatarUrl } = profileData;

  const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
  if (userCheck.rows.length === 0) {
    throw new AppError('User not found', 404, '01');
  }

  const result = await db.query(
    `UPDATE users 
     SET full_name = COALESCE($1, full_name), 
         phone_number = COALESCE($2, phone_number),
         avatar_url = COALESCE($3, avatar_url)
     WHERE id = $4
     RETURNING id, full_name, email, role, phone_number, avatar_url, created_at`,
    [fullName, phoneNumber, avatarUrl, id]
  );

  const u = result.rows[0];
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    phoneNumber: u.phone_number,
    avatarUrl: u.avatar_url,
    createdAt: u.created_at
  };
};

const changePassword = async (id, passwordData) => {
  const { oldPassword, newPassword } = passwordData;

  if (!oldPassword) throw new AppError('oldPassword tidak boleh kosong', 400, '02');
  if (!newPassword) throw new AppError('newPassword tidak boleh kosong', 400, '02');

  const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    throw new AppError('User not found', 404, '01');
  }

  const user = result.rows[0];

  const isMatch = await comparePassword(oldPassword, user.password_hash);
  if (!isMatch) {
    throw new AppError('Email/username atau password salah', 401, '05');
  }

  const newPasswordHash = await hashPassword(newPassword);
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, id]);
  return true;
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
