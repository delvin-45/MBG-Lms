const db = require('../../config/db');
const { AppError } = require('../../middlewares/errorHandler');

const getStudentProgress = async (studentId) => {
  // Aggregate stats
  const totalCourseRes = await db.query('SELECT COUNT(*) FROM courses');
  const totalCourse = parseInt(totalCourseRes.rows[0].count, 10);

  const totalMaterialRes = await db.query('SELECT COUNT(*) FROM materials');
  const totalMaterial = parseInt(totalMaterialRes.rows[0].count, 10);

  // Since we don't have a "completed_materials" table, we just return 0 or mock it, or if it's based on some logic
  // Looking at the schema, there is no "completed_materials" table, only "submissions". 
  // Let's assume completedMaterial is 0 for now as there's no way to track it in schema.
  const completedMaterial = 0;

  const totalAssignmentRes = await db.query('SELECT COUNT(*) FROM assignments');
  const totalAssignment = parseInt(totalAssignmentRes.rows[0].count, 10);

  const completedAssignmentRes = await db.query('SELECT COUNT(DISTINCT assignment_id) FROM submissions WHERE student_id = $1', [studentId]);
  const completedAssignment = parseInt(completedAssignmentRes.rows[0].count, 10);

  let progressPercentage = 0;
  if (totalAssignment + totalMaterial > 0) {
    progressPercentage = Math.round(((completedAssignment + completedMaterial) / (totalAssignment + totalMaterial)) * 100);
  } else {
    progressPercentage = 100;
  }

  // Per course
  const { rows } = await db.query(
    `SELECT 
       c.id AS course_id, 
       c.title AS course_title,
       (SELECT COUNT(*) FROM assignments a WHERE a.course_id = c.id)::integer AS total_assignments,
       (SELECT COUNT(DISTINCT s.assignment_id) FROM submissions s JOIN assignments a ON s.assignment_id = a.id WHERE a.course_id = c.id AND s.student_id = $1)::integer AS submitted_assignments
     FROM courses c
     ORDER BY c.title ASC`,
    [studentId]
  );

  const perCourse = rows.map(r => {
    const total = r.total_assignments;
    const submitted = r.submitted_assignments;
    const pct = total === 0 ? 100 : Math.round((submitted / total) * 100);

    return {
      courseId: r.course_id,
      courseTitle: r.course_title,
      progressPercentage: pct
    };
  });

  return {
    totalCourse,
    completedMaterial,
    totalMaterial,
    completedAssignment,
    totalAssignment,
    progressPercentage,
    perCourse
  };
};

const getCourseProgress = async (courseId, teacherId, role) => {
  // Check if course exists and verify teacher ownership
  const courseCheck = await db.query('SELECT teacher_id FROM courses WHERE id = $1', [courseId]);
  if (courseCheck.rows.length === 0) {
    throw new AppError('Data tidak ditemukan', 404, '01');
  }

  if (courseCheck.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('Pengguna tidak memiliki akses untuk aksi ini', 403, '07');
  }

  // Get all students and calculate their progress for this course
  const { rows } = await db.query(
    `SELECT 
       u.id AS student_id,
       u.full_name AS student_name,
       (SELECT COUNT(*) FROM assignments a WHERE a.course_id = $1)::integer AS total_assignments,
       (SELECT COUNT(DISTINCT s.assignment_id) FROM submissions s JOIN assignments a ON s.assignment_id = a.id WHERE a.course_id = $1 AND s.student_id = u.id)::integer AS submitted_assignments,
       (SELECT AVG(s.score) FROM submissions s JOIN assignments a ON s.assignment_id = a.id WHERE a.course_id = $1 AND s.student_id = u.id)::numeric AS average_score
     FROM users u
     WHERE u.role = 'student'
     ORDER BY u.full_name ASC`,
    [courseId]
  );

  return rows.map(r => {
    const total = r.total_assignments;
    const submitted = r.submitted_assignments;
    const pct = total === 0 ? 100 : Math.round((submitted / total) * 100);
    const avgScore = r.average_score ? Math.round(r.average_score) : null;

    return {
      studentId: r.student_id,
      studentName: r.student_name,
      progressPercentage: pct,
      completedAssignment: submitted,
      totalAssignment: total,
      averageScore: avgScore
    };
  });
};

module.exports = {
  getStudentProgress,
  getCourseProgress
};
