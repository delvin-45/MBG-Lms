const db = require('../../config/db');
const { AppError } = require('../../middlewares/errorHandler');
const { getCached, setCache, delCache, clearPattern } = require('../../middlewares/cache');

// ─── Cache Key Helpers ──────────────────────────────────────────────────────
const coursesKey = (query) => `cache:courses:${JSON.stringify(query)}`;
const courseKey  = (id)    => `cache:course:${id}`;
const matsKey    = (cId)   => `cache:materials:${cId}`;

// ─── Course Services ────────────────────────────────────────────────────────

const getAllCourses = async (query) => {
  const cKey = coursesKey(query);
  const cached = await getCached(cKey);
  if (cached) return cached;

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const { search, category } = query;

  let queryText = `
    SELECT c.id, c.title, c.description, c.category, c.teacher_id, c.created_at, u.full_name as teacher_name,
    COALESCE((
      SELECT COUNT(DISTINCT s.student_id)
      FROM assignments a
      JOIN submissions s ON s.assignment_id = a.id
      WHERE a.course_id = c.id
    ), 0)::integer AS total_student,
    COALESCE((
      SELECT COUNT(*)
      FROM materials m
      WHERE m.course_id = c.id
    ), 0)::integer AS total_material
    FROM courses c
    JOIN users u ON c.teacher_id = u.id
    WHERE 1=1
  `;
  const queryParams = [];
  let paramCount = 1;

  if (category) {
    queryText += ` AND c.category = $${paramCount}`;
    queryParams.push(category);
    paramCount++;
  }

  if (search) {
    queryText += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
    queryParams.push(`%${search}%`);
    paramCount++;
  }

  // Count query for pagination metadata
  let countQueryText = 'SELECT COUNT(*) FROM courses c WHERE 1=1';
  const countQueryParams = [];
  let countParamCount = 1;
  if (category) {
    countQueryText += ` AND c.category = $${countParamCount}`;
    countQueryParams.push(category);
    countParamCount++;
  }
  if (search) {
    countQueryText += ` AND (c.title ILIKE $${countParamCount} OR c.description ILIKE $${countParamCount})`;
    countQueryParams.push(`%${search}%`);
    countParamCount++;
  }

  const countResult = await db.query(countQueryText, countQueryParams);
  const total = parseInt(countResult.rows[0].count, 10);

  queryText += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  queryParams.push(limit, offset);

  const { rows } = await db.query(queryText, queryParams);

  const data = rows.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    teacherId: c.teacher_id,
    teacherName: c.teacher_name,
    totalMaterial: c.total_material,
    totalStudent: c.total_student,
    createdAt: c.created_at
  }));

  const totalPages = Math.ceil(total / limit);

  const result = {
    data,
    meta: { page, limit, totalData: total, totalPage: totalPages }
  };

  await setCache(cKey, result);
  return result;
};

const getCourseById = async (id) => {
  const cKey = courseKey(id);
  const cached = await getCached(cKey);
  if (cached) return cached;

  const result = await db.query(
    `SELECT c.id, c.title, c.description, c.category, u.full_name as teacher_name,
     COALESCE((
       SELECT COUNT(*)
       FROM materials m
       WHERE m.course_id = c.id
     ), 0)::integer AS total_material,
     COALESCE((
       SELECT COUNT(*)
       FROM assignments a
       WHERE a.course_id = c.id
     ), 0)::integer AS total_assignment
     FROM courses c
     JOIN users u ON c.teacher_id = u.id
     WHERE c.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  const c = result.rows[0];
  const data = {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    teacherName: c.teacher_name,
    totalMaterial: c.total_material,
    totalAssignment: c.total_assignment
  };

  await setCache(cKey, data);
  return data;
};

const createCourse = async (courseData, teacherId) => {
  const { title, description, category } = courseData;

  if (!title) throw new AppError('title tidak boleh kosong', 400, '02');

  const result = await db.query(
    `INSERT INTO courses (title, description, category, teacher_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, category, teacher_id, created_at`,
    [title, description || null, category || null, teacherId]
  );

  // Invalidate course list caches
  await clearPattern('cache:courses:*');

  const c = result.rows[0];
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    teacherId: c.teacher_id,
    createdAt: c.created_at
  };
};

const updateCourse = async (id, courseData, teacherId, role) => {
  const { title, description, category } = courseData;

  const check = await db.query('SELECT teacher_id FROM courses WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  const result = await db.query(
    `UPDATE courses
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         category = COALESCE($3, category)
     WHERE id = $4
     RETURNING id, title, category`,
    [title, description, category, id]
  );

  // Invalidate both this course's cache and all course list caches
  await Promise.all([
    delCache(courseKey(id)),
    clearPattern('cache:courses:*')
  ]);

  const c = result.rows[0];
  return {
    id: c.id,
    title: c.title,
    category: c.category
  };
};

const deleteCourse = async (id, teacherId, role) => {
  const check = await db.query('SELECT teacher_id FROM courses WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  await db.query('DELETE FROM courses WHERE id = $1', [id]);

  // Invalidate all related caches
  await Promise.all([
    delCache(courseKey(id)),
    clearPattern('cache:courses:*')
  ]);

  return true;
};

// ─── Material Services ───────────────────────────────────────────────────────

const getMaterialsByCourse = async (courseId) => {
  const cKey = matsKey(courseId);
  const cached = await getCached(cKey);
  if (cached) return cached;

  const courseCheck = await db.query('SELECT id FROM courses WHERE id = $1', [courseId]);
  if (courseCheck.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  const result = await db.query(
    `SELECT id, course_id, title, type, content, created_at
     FROM materials
     WHERE course_id = $1
     ORDER BY created_at ASC`,
    [courseId]
  );

  const data = result.rows.map(m => ({
    id: m.id,
    courseId: m.course_id,
    title: m.title,
    type: m.type,
    content: m.content,
    createdAt: m.created_at
  }));

  await setCache(cKey, data);
  return data;
};

const createMaterial = async (courseId, materialData, teacherId, role) => {
  const { title, type, content, description } = materialData;

  const courseCheck = await db.query('SELECT teacher_id FROM courses WHERE id = $1', [courseId]);
  if (courseCheck.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (courseCheck.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  if (!title) throw new AppError('title tidak boleh kosong', 400, '02');
  if (!type) throw new AppError('type tidak boleh kosong', 400, '02');

  const result = await db.query(
    `INSERT INTO materials (course_id, title, type, content, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, course_id, title, type, content, created_at`,
    [courseId, title, type, content || null, description || null]
  );

  await delCache(matsKey(courseId));

  const m = result.rows[0];
  return {
    id: m.id,
    courseId: m.course_id,
    title: m.title,
    type: m.type,
    content: m.content,
    createdAt: m.created_at
  };
};

const updateMaterial = async (id, materialData, teacherId, role) => {
  const { title, type, content, description } = materialData;

  const check = await db.query(
    `SELECT m.id, m.course_id, c.teacher_id
     FROM materials m
     JOIN courses c ON m.course_id = c.id
     WHERE m.id = $1`,
    [id]
  );
  if (check.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  const result = await db.query(
    `UPDATE materials
     SET title = COALESCE($1, title),
         type = COALESCE($2, type),
         content = COALESCE($3, content),
         description = COALESCE($4, description)
     WHERE id = $5
     RETURNING id, title, type`,
    [title, type, content, description, id]
  );

  await delCache(matsKey(check.rows[0].course_id));

  const m = result.rows[0];
  return {
    id: m.id,
    title: m.title,
    type: m.type
  };
};

const deleteMaterial = async (id, teacherId, role) => {
  const check = await db.query(
    `SELECT m.id, m.course_id, c.teacher_id
     FROM materials m
     JOIN courses c ON m.course_id = c.id
     WHERE m.id = $1`,
    [id]
  );
  if (check.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  await db.query('DELETE FROM materials WHERE id = $1', [id]);
  await delCache(matsKey(check.rows[0].course_id));
  return true;
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMaterialsByCourse,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
