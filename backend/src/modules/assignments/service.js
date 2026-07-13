const db = require('../../config/db');
const { AppError } = require('../../middlewares/errorHandler');
const fs = require('fs');
const path = require('path');

// Helper to parse deadline string: YYYY-MM-DD HH:mm to Date object
const parseDeadline = (deadlineStr) => {
  if (!deadlineStr) return null;

  // Try direct parsing if ISO format
  if (deadlineStr.includes('T')) {
    const d = new Date(deadlineStr);
    return isNaN(d.getTime()) ? null : d;
  }

  // Handle YYYY-MM-DD HH:mm
  const parts = deadlineStr.trim().split(/\s+/);
  if (parts.length !== 2) return null;

  const dateParts = parts[0].split('-');
  const timeParts = parts[1].split(':');

  if (dateParts.length !== 3 || timeParts.length !== 2) return null;

  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
  const day = parseInt(dateParts[2], 10);
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);

  const date = new Date(year, month, day, hour, minute);
  return isNaN(date.getTime()) ? null : date;
};

// Course assignments listing
const getAssignmentsByCourse = async (courseId) => {
  // Check if course exists
  const courseCheck = await db.query('SELECT id FROM courses WHERE id = $1', [courseId]);
  if (courseCheck.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  const { rows } = await db.query(
    `SELECT a.id, a.course_id, a.title, a.description, a.deadline, a.max_score,
     COALESCE((
       SELECT COUNT(*)
       FROM submissions s
       WHERE s.assignment_id = a.id
     ), 0)::integer AS total_submission
     FROM assignments a 
     WHERE a.course_id = $1 
     ORDER BY a.deadline ASC`,
    [courseId]
  );

  return rows.map(a => ({
    id: a.id,
    courseId: a.course_id,
    title: a.title,
    description: a.description,
    deadline: a.deadline,
    maxScore: a.max_score,
    totalSubmission: a.total_submission
  }));
};

// Create assignment
const createAssignment = async (courseId, assignmentData, teacherId, role) => {
  const { title, description, deadline, maxScore } = assignmentData;

  const courseCheck = await db.query('SELECT teacher_id FROM courses WHERE id = $1', [courseId]);
  if (courseCheck.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (courseCheck.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  if (!title) throw new AppError('title tidak boleh kosong', 400, '02');
  if (!deadline) throw new AppError('deadline tidak boleh kosong', 400, '02');

  const parsedDeadline = parseDeadline(deadline);
  if (!parsedDeadline) {
    throw new AppError('Format tanggal tidak valid', 400, '08');
  }

  const scoreLimit = maxScore !== undefined ? parseInt(maxScore, 10) : 100;

  const result = await db.query(
    `INSERT INTO assignments (course_id, title, description, deadline, max_score)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, course_id, title, deadline, max_score`,
    [courseId, title, description || null, parsedDeadline, scoreLimit]
  );

  const a = result.rows[0];
  return {
    id: a.id,
    courseId: a.course_id,
    title: a.title,
    deadline: a.deadline,
    maxScore: a.max_score
  };
};

// Update assignment
const updateAssignment = async (id, assignmentData, teacherId, role) => {
  const { title, description, deadline, maxScore } = assignmentData;

  const check = await db.query(
    `SELECT a.id, c.teacher_id 
     FROM assignments a
     JOIN courses c ON a.course_id = c.id
     WHERE a.id = $1`,
    [id]
  );
  if (check.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  let parsedDeadline = undefined;
  if (deadline) {
    parsedDeadline = parseDeadline(deadline);
    if (!parsedDeadline) {
      throw new AppError('Format tanggal tidak valid', 400, '08');
    }
  }

  const result = await db.query(
    `UPDATE assignments
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         deadline = COALESCE($3, deadline),
         max_score = COALESCE($4, max_score)
     WHERE id = $5
     RETURNING id, title, deadline`,
    [title, description, parsedDeadline, maxScore, id]
  );

  const a = result.rows[0];
  return {
    id: a.id,
    title: a.title,
    deadline: a.deadline
  };
};

// Delete assignment
const deleteAssignment = async (id, teacherId, role) => {
  const check = await db.query(
    `SELECT a.id, c.teacher_id 
     FROM assignments a
     JOIN courses c ON a.course_id = c.id
     WHERE a.id = $1`,
    [id]
  );
  if (check.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  await db.query('DELETE FROM assignments WHERE id = $1', [id]);
  return true;
};

// Student submit assignment with file uploads
const submitAssignment = async (assignmentId, studentId, file, note) => {
  if (!file) {
    throw new AppError('file tidak boleh kosong', 400, '02');
  }

  const filePath = file.path;

  try {
    // 1. Get assignment details
    const assignResult = await db.query(
      'SELECT deadline FROM assignments WHERE id = $1',
      [assignmentId]
    );

    if (assignResult.rows.length === 0) {
      throw new AppError('Data tidak ditemukan', 404, '01');
    }

    const deadline = new Date(assignResult.rows[0].deadline);
    const now = new Date();

    // 2. Check assignment deadline (Error code 11)
    if (now > deadline) {
      throw new AppError('Deadline pengumpulan tugas sudah berakhir', 400, '11');
    }

    // 3. Check file size (10MB limit - Error code 09)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new AppError('Ukuran file > 10MB', 422, '09');
    }

    // 4. Check file type (Error code 10)
    const allowedExts = ['.pdf', '.doc', '.docx', '.zip', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      throw new AppError('Format file tidak didukung', 422, '10');
    }

    // 5. Generate file URL
    const fileUrl = `/uploads/${path.basename(filePath)}`;

    // 6. Check if student already submitted (resubmission)
    const existingCheck = await db.query(
      'SELECT id, file_url FROM submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignmentId, studentId]
    );

    let submission;
    if (existingCheck.rows.length > 0) {
      // Delete old file from disk
      const oldFileUrl = existingCheck.rows[0].file_url;
      const oldFileName = path.basename(oldFileUrl);
      const oldFilePath = path.join(__dirname, '../../../uploads', oldFileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      const result = await db.query(
        `UPDATE submissions
         SET file_url = $1, note = $2, score = NULL, status = 'submitted', submitted_at = CURRENT_TIMESTAMP
         WHERE assignment_id = $3 AND student_id = $4
         RETURNING id, assignment_id, student_id, file_url, status, submitted_at`,
        [fileUrl, note || null, assignmentId, studentId]
      );
      submission = result.rows[0];
    } else {
      const result = await db.query(
        `INSERT INTO submissions (assignment_id, student_id, file_url, note, score, status)
         VALUES ($1, $2, $3, $4, NULL, 'submitted')
         RETURNING id, assignment_id, student_id, file_url, status, submitted_at`,
        [assignmentId, studentId, fileUrl, note || null]
      );
      submission = result.rows[0];
    }

    return {
      id: submission.id,
      assignmentId: submission.assignment_id,
      studentId: submission.student_id,
      fileUrl: submission.file_url,
      status: submission.status,
      submittedAt: submission.submitted_at
    };
  } catch (error) {
    // Delete uploaded file if error occurs during validation/save
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

// Teacher list submissions
const getSubmissions = async (assignmentId, teacherId, role) => {
  // Check ownership
  const check = await db.query(
    `SELECT a.id, c.teacher_id 
     FROM assignments a
     JOIN courses c ON a.course_id = c.id
     WHERE a.id = $1`,
    [assignmentId]
  );
  if (check.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (check.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  const { rows } = await db.query(
    `SELECT s.id, s.student_id, u.full_name as student_name, s.file_url, s.score, s.submitted_at
     FROM submissions s
     JOIN users u ON s.student_id = u.id
     WHERE s.assignment_id = $1
     ORDER BY s.submitted_at DESC`,
    [assignmentId]
  );

  return rows.map(s => ({
    id: s.id,
    studentId: s.student_id,
    studentName: s.student_name,
    fileUrl: s.file_url,
    score: s.score,
    submittedAt: s.submitted_at
  }));
};

const gradeSubmission = async (submissionId, score, teacherId, role) => {
  if (score === undefined || score === null) {
    throw new AppError('Score is required', 400, '02');
  }

  const scoreNum = parseInt(score, 10);
  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
    throw new AppError('Score must be a number between 0 and 100', 400, '08');
  }

  const subCheck = await db.query(
    `SELECT s.id, a.max_score, c.teacher_id
     FROM submissions s
     JOIN assignments a ON s.assignment_id = a.id
     JOIN courses c ON a.course_id = c.id
     WHERE s.id = $1`,
    [submissionId]
  );

  if (subCheck.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  const { max_score, teacher_id } = subCheck.rows[0];

  if (teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  if (scoreNum > max_score) {
    throw new AppError(`Score cannot exceed maximum score of ${max_score}`, 400, '08');
  }

  const result = await db.query(
    `UPDATE submissions
     SET score = $1, status = 'graded'
     WHERE id = $2
     RETURNING id, assignment_id, student_id, file_url, note, score, status, submitted_at`,
    [scoreNum, submissionId]
  );

  const s = result.rows[0];
  return {
    id: s.id,
    assignmentId: s.assignment_id,
    studentId: s.student_id,
    fileUrl: s.file_url,
    note: s.note,
    score: s.score,
    status: s.status,
    submittedAt: s.submitted_at
  };
};

const getMySubmission = async (assignmentId, studentId) => {
  const { rows } = await db.query(
    `SELECT id, assignment_id, student_id, file_url, note, score, status, submitted_at
     FROM submissions
     WHERE assignment_id = $1 AND student_id = $2`,
    [assignmentId, studentId]
  );
  if (rows.length === 0) return null;
  const s = rows[0];
  return {
    id: s.id,
    assignmentId: s.assignment_id,
    studentId: s.student_id,
    fileUrl: s.file_url,
    note: s.note,
    score: s.score,
    status: s.status,
    submittedAt: s.submitted_at
  };
};

module.exports = {
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  getMySubmission
};
