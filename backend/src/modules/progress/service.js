const db = require('../../config/db');
const { AppError } = require('../../middlewares/errorHandler');

const getStudentProgress = async (studentId) => {
  const { rows } = await db.query(
    `SELECT 
       c.id AS course_id, 
       c.title AS course_title,
       (SELECT COUNT(*) FROM assignments a WHERE a.course_id = c.id)::integer AS total_assignments,
       (SELECT COUNT(*) FROM submissions s JOIN assignments a ON s.assignment_id = a.id WHERE a.course_id = c.id AND s.student_id = $1)::integer AS submitted_assignments
     FROM courses c
     ORDER BY c.title ASC`,
    [studentId]
  );

  return rows.map(r => {
    const total = r.total_assignments;
    const submitted = r.submitted_assignments;
    const progressPercentage = total === 0 ? 100 : Math.round((submitted / total) * 100);
    
    return {
      courseId: r.course_id,
      courseTitle: r.course_title,
      totalAssignments: total,
      submittedAssignments: submitted,
      progressPercentage
    };
  });
};

const getCourseProgress = async (courseId, teacherId, role) => {
  // Check if course exists and verify teacher ownership
  const courseCheck = await db.query('SELECT teacher_id FROM courses WHERE id = $1', [courseId]);
  if (courseCheck.rows.length === 0) {
    throw new AppError('Course not found', 404, '01');
  }

  if (courseCheck.rows[0].teacher_id !== teacherId && role !== 'admin') {
    throw new AppError('You do not have permission to view progress for this course', 403, '07');
  }

  // Get all students and calculate their progress for this course
  const { rows } = await db.query(
    `SELECT 
       u.id AS student_id,
       u.full_name AS student_name,
       u.email,
       (SELECT COUNT(*) FROM assignments a WHERE a.course_id = $1)::integer AS total_assignments,
       (SELECT COUNT(*) FROM submissions s JOIN assignments a ON s.assignment_id = a.id WHERE a.course_id = $1 AND s.student_id = u.id)::integer AS submitted_assignments
     FROM users u
     WHERE u.role = 'student'
     ORDER BY u.full_name ASC`,
    [courseId]
  );

  return rows.map(r => {
    const total = r.total_assignments;
    const submitted = r.submitted_assignments;
    const progressPercentage = total === 0 ? 100 : Math.round((submitted / total) * 100);

    return {
      studentId: r.student_id,
      studentName: r.student_name,
      email: r.email,
      totalAssignments: total,
      submittedAssignments: submitted,
      progressPercentage
    };
  });
};

module.exports = {
  getStudentProgress,
  getCourseProgress
};
