const db = require('../../config/db');
const { AppError } = require('../../middlewares/errorHandler');

// Course services
const getAllCourses = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const { search, category } = query;

  let queryText = `
    SELECT c.id, c.title, c.description, c.category, c.thumbnail_url, c.teacher_id, c.created_at, u.full_name as teacher_name,
    COALESCE((
      SELECT COUNT(DISTINCT s.student_id) 
      FROM assignments a 
      JOIN submissions s ON s.assignment_id = a.id 
      WHERE a.course_id = c.id
    ), 0)::integer AS total_student
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

  // Add sorting and pagination limit
  queryText += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  queryParams.push(limit, offset);

  const { rows } = await db.query(queryText, queryParams);

  const data = rows.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    thumbnailUrl: c.thumbnail_url,
    teacherId: c.teacher_id,
    teacherName: c.teacher_name,
    totalStudent: c.total_student,
    createdAt: c.created_at
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

const getCourseById = async (id) => {
  const result = await db.query(
    `SELECT c.id, c.title, c.description, c.category, c.thumbnail_url, c.teacher_id, c.created_at, u.full_name as teacher_name,
     COALESCE((
       SELECT COUNT(DISTINCT s.student_id) 
       FROM assignments a 
       JOIN submissions s ON s.assignment_id = a.id 
       WHERE a.course_id = c.id
     ), 0)::integer AS total_student
     FROM courses c
     JOIN users u ON c.teacher_id = u.id
     WHERE c.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Course not found', 404, '01');
  }

  const c = result.rows[0];
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    thumbnailUrl: c.thumbnail_url,
    teacherId: c.teacher_id,
    teacherName: c.teacher_name,
    totalStudent: c.total_student,
    createdAt: c.created_at
  };
};

const createCourse = async (courseData, teacherId) => {
  const { title, description, category, thumbnail_url } = courseData;

  if (!title) throw new AppError('title tidak boleh kosong', 400, '02');

  const result = await db.query(
    `INSERT INTO courses (title, description, category, thumbnail_url, teacher_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, description, category, thumbnail_url, teacher_id, created_at`,
    [title, description || null, category || null, thumbnail_url || null, teacherId]
  );

  const c = result.rows[0];
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    thumbnailUrl: c.thumbnail_url,
    teacherId: c.teacher_id,
    createdAt: c.created_at
  };
};

const updateCourse = async (id, courseData, teacherId, role) => {
  const { title, description, category, thumbnail_url } = courseData;

  const check = await db.query('SELECT teacher_id FROM courses WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    throw new AppError('Course not found', 404, '01');
  }

  // Enforce Teacher Owner check (Admins can bypass if needed, but per rules: "hanya teacher pemilik")
  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('You do not have permission to update this course', 403, '07');
  }

  const result = await db.query(
    `UPDATE courses
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         category = COALESCE($3, category),
         thumbnail_url = COALESCE($4, thumbnail_url)
     WHERE id = $5
     RETURNING id, title, description, category, thumbnail_url, teacher_id, created_at`,
    [title, description, category, thumbnail_url, id]
  );

  const c = result.rows[0];
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    thumbnailUrl: c.thumbnail_url,
    teacherId: c.teacher_id,
    createdAt: c.created_at
  };
};

const deleteCourse = async (id, teacherId, role) => {
  const check = await db.query('SELECT teacher_id FROM courses WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    throw new AppError('Course not found', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('You do not have permission to delete this course', 403, '07');
  }

  await db.query('DELETE FROM courses WHERE id = $1', [id]);
  return true;
};

// Material services
const getMaterialsByCourse = async (courseId) => {
  // Verify course exists
  const courseCheck = await db.query('SELECT id FROM courses WHERE id = $1', [courseId]);
  if (courseCheck.rows.length === 0) {
    throw new AppError('Course not found', 404, '01');
  }

  const result = await db.query(
    `SELECT id, course_id, title, type, content, description, created_at 
     FROM materials 
     WHERE course_id = $1 
     ORDER BY created_at ASC`,
    [courseId]
  );

  return result.rows.map(m => ({
    id: m.id,
    courseId: m.course_id,
    title: m.title,
    type: m.type,
    content: m.content,
    description: m.description,
    createdAt: m.created_at
  }));
};

const createMaterial = async (courseId, materialData, teacherId, role) => {
  const { title, type, content, description } = materialData;

  const courseCheck = await db.query('SELECT teacher_id FROM courses WHERE id = $1', [courseId]);
  if (courseCheck.rows.length === 0) {
    throw new AppError('Course not found', 404, '01');
  }

  if (courseCheck.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('You do not have permission to add materials to this course', 403, '07');
  }

  if (!title) throw new AppError('title tidak boleh kosong', 400, '02');
  if (!type) throw new AppError('type tidak boleh kosong', 400, '02');

  const result = await db.query(
    `INSERT INTO materials (course_id, title, type, content, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, course_id, title, type, content, description, created_at`,
    [courseId, title, type, content || null, description || null]
  );

  const m = result.rows[0];
  return {
    id: m.id,
    courseId: m.course_id,
    title: m.title,
    type: m.type,
    content: m.content,
    description: m.description,
    createdAt: m.created_at
  };
};

const updateMaterial = async (id, materialData, teacherId, role) => {
  const { title, type, content, description } = materialData;

  const check = await db.query(
    `SELECT m.id, c.teacher_id 
     FROM materials m
     JOIN courses c ON m.course_id = c.id
     WHERE m.id = $1`,
    [id]
  );
  if (check.rows.length === 0) {
    throw new AppError('Material not found', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('You do not have permission to update this material', 403, '07');
  }

  const result = await db.query(
    `UPDATE materials
     SET title = COALESCE($1, title),
         type = COALESCE($2, type),
         content = COALESCE($3, content),
         description = COALESCE($4, description)
     WHERE id = $5
     RETURNING id, course_id, title, type, content, description, created_at`,
    [title, type, content, description, id]
  );

  const m = result.rows[0];
  return {
    id: m.id,
    courseId: m.course_id,
    title: m.title,
    type: m.type,
    content: m.content,
    description: m.description,
    createdAt: m.created_at
  };
};

const deleteMaterial = async (id, teacherId, role) => {
  const check = await db.query(
    `SELECT m.id, c.teacher_id 
     FROM materials m
     JOIN courses c ON m.course_id = c.id
     WHERE m.id = $1`,
    [id]
  );
  if (check.rows.length === 0) {
    throw new AppError('Material not found', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('You do not have permission to delete this material', 403, '07');
  }

  await db.query('DELETE FROM materials WHERE id = $1', [id]);
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
