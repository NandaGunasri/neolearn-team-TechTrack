// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const DB_PATH = path.join(DATA_DIR, 'neolearn.db');
const db = new sqlite3.Database(DB_PATH);

// Simple promise wrappers
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const addColumnIfNotExists = async (table, column, type, defaultValue) => {
  try {
    const info = await all(`PRAGMA table_info(${table})`);
    if (!info.some(col => col.name === column)) {
      await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type} DEFAULT ${defaultValue}`);
      console.log(`Added column ${column} to table ${table}`);
    }
  } catch (err) {
    console.error(`Error adding column ${column} to ${table}:`, err.message);
  }
};

// Initialize schema
const initDb = async () => {
  // --- Core Tables ---
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      skill_level TEXT DEFAULT 'Beginner',
      points INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_activity_date TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      teacher_id INTEGER,
      duration TEXT,
      category TEXT DEFAULT 'General',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      deadline DATETIME,
      max_marks INTEGER DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      content TEXT,
      status TEXT DEFAULT 'Submitted', 
      feedback TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  // --- Platinum Tables ---
  await run(`
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      assignment_id INTEGER NOT NULL,
      marks INTEGER NOT NULL,
      feedback TEXT,
      graded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES submissions(id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (assignment_id) REFERENCES assignments(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS discussions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      parent_id INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      file_url TEXT,
      type TEXT DEFAULT 'Link', -- PDF, PPT, Link
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      type TEXT, -- assignment, grade, enrollment
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- high_scorer, consistent, streak, teacher_excellence
      title TEXT NOT NULL,
      awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Migrations for existing tables
  await addColumnIfNotExists('users', 'skill_level', 'TEXT', "'Beginner'");
  await addColumnIfNotExists('users', 'points', 'INTEGER', '0');
  await addColumnIfNotExists('users', 'streak', 'INTEGER', '0');
  await addColumnIfNotExists('users', 'last_activity_date', 'TEXT', 'NULL');
  await addColumnIfNotExists('courses', 'category', 'TEXT', "'General'");
  await addColumnIfNotExists('assignments', 'max_marks', 'INTEGER', '100');
  
  console.log('Database initialized successfully with Platinum tables at', DB_PATH);
};

module.exports = {
  db,
  run,
  get,
  all,
  initDb
};
