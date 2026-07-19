const db = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/hash');
const { AppError } = require('../../middlewares/errorHandler');

const getAllUsers = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const { role, search, status } = query;

  let queryText = 'SELECT id, full_name, email, role, avatar_url, status, created_at FROM users WHERE 1=1';
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

  if (status) {
    queryText += ` AND status = $${paramCount}`;
    queryParams.push(status);
    paramCount++;
  }

  // Get total count for pagination meta
  let countQueryText = 'SELECT COUNT(*) FROM users WHERE 1=1';
  if (role) {
    countQueryText += ` AND role = $${queryParams.indexOf(role) + 1}`;
  }
  if (search) {
    const searchIdx = queryParams.indexOf(`%${search}%`) + 1;
    countQueryText += ` AND (full_name ILIKE $${searchIdx} OR email ILIKE $${searchIdx})`;
  }
  if (status) {
    countQueryText += ` AND status = $${queryParams.indexOf(status) + 1}`;
  }

  const countResult = await db.query(countQueryText, queryParams);
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
    avatarUrl: u.avatar_url,
    status: u.status,
    createdAt: u.created_at
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      totalData: total,
      totalPage: totalPages
    }
  };
};

const getUserById = async (id) => {
  const result = await db.query(
    'SELECT id, full_name, email, role, avatar_url, status, created_at FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  const u = result.rows[0];
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatar_url,
    status: u.status,
    createdAt: u.created_at
  };
};

const createUser = async (userData) => {
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

  const passwordHash = await hashPassword(password);

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

const updateUser = async (id, userData) => {
  const { fullName, email, role, avatarUrl, status } = userData;

  if (avatarUrl === undefined) throw new AppError('avatarUrl wajib dikirim (bisa diisi null)', 400, '02');
  if (status === undefined) throw new AppError('status wajib dikirim', 400, '02');

  const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
  if (userCheck.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  const result = await db.query(
    `UPDATE users 
     SET full_name = $1, 
         email = $2,
         role = $3,
         avatar_url = $4,
         status = $5
     WHERE id = $6
     RETURNING id, full_name, email, role, avatar_url, status, created_at`,
    [fullName, email, role, avatarUrl, status, id]
  );

  const u = result.rows[0];
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatar_url,
    status: u.status
  };
};

const deleteUser = async (id) => {
  const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
  if (userCheck.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  await db.query('DELETE FROM users WHERE id = $1', [id]);
  return true;
};

const getProfile = async (id) => {
  const result = await db.query(
    'SELECT id, full_name, email, role, avatar_url, created_at FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }
  const u = result.rows[0];
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatar_url,
  };
};

const updateProfile = async (id, profileData) => {
  const { fullName, avatarUrl } = profileData;

  if (fullName !== undefined && !fullName) {
    throw new AppError('fullName tidak boleh kosong', 400, '02');
  }

  const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
  if (userCheck.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  const result = await db.query(
    `UPDATE users 
     SET full_name = COALESCE($1, full_name), 
         avatar_url = COALESCE($2, avatar_url)
     WHERE id = $3
     RETURNING id, full_name, email, role, avatar_url, created_at`,
    [fullName, avatarUrl, id]
  );

  const u = result.rows[0];
  return {
    fullName: u.full_name,
    avatarUrl: u.avatar_url
  };
};

const changePassword = async (id, passwordData) => {
  const { oldPassword, newPassword } = passwordData;

  if (!oldPassword) throw new AppError('oldPassword tidak boleh kosong', 400, '02');
  if (!newPassword) throw new AppError('newPassword tidak boleh kosong', 400, '02');

  const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
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
