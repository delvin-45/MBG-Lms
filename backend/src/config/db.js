const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                   // match k6 VU count for stress tests
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on('connect', () => {
  console.log('PostgreSQL database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error', err);
});

// Schema definition
const initDb = async (retries = 5, delay = 2000) => {
  let client;
  while (retries > 0) {
    try {
      client = await pool.connect();
      break;
    } catch (err) {
      console.error(`PostgreSQL connection failed. Retries left: ${retries - 1}. Error: ${err.message}`);
      retries--;
      if (retries === 0) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }

  try {
    console.log('Initializing PostgreSQL database schema...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
        phone_number VARCHAR(50),
        avatar_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        thumbnail_url VARCHAR(255),
        teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create materials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        content VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deadline TIMESTAMP NOT NULL,
        max_score INTEGER NOT NULL DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create submissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        file_url VARCHAR(255) NOT NULL,
        note TEXT,
        score INTEGER DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Performance: strategic indexes for JOIN-heavy queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_courses_teacher_id        ON courses(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_courses_category          ON courses(category);
      CREATE INDEX IF NOT EXISTS idx_materials_course_id       ON materials(course_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_course_id     ON assignments(course_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_student_id    ON submissions(student_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_student_assign ON submissions(student_id, assignment_id);
    `);

    // Seed default users if empty
    const { rows } = await client.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(rows[0].count, 10);

    if (userCount === 0) {
      console.log('Seeding default users...');
      const defaultPasswordHash = bcrypt.hashSync('password123', 10);

      await client.query(`
        INSERT INTO users (full_name, email, password_hash, role) VALUES
        ('System Administrator', 'admin@mbg.com', $1, 'admin'),
        ('John Teacher', 'teacher@mbg.com', $1, 'teacher'),
        ('Jane Student', 'student@mbg.com', $1, 'student')
      `, [defaultPasswordHash]);

      console.log('Default users seeded: admin@mbg.com, teacher@mbg.com, student@mbg.com (password: password123)');
    }

    console.log('Database schema initialization complete.');
  } catch (error) {
    console.error('Error initializing database schema:', error);
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDb
};
