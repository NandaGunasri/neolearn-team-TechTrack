// db.js — simple sqlite helper (synchronous-ish)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const DB_PATH = path.join(DATA_DIR, 'lms.db');


const db = new sqlite3.Database(DB_PATH);

// initialize schema
const initSql = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  teacherId TEXT,
  FOREIGN KEY (teacherId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  courseId TEXT,
  enrolledAt TEXT,
  FOREIGN KEY (studentId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  courseId TEXT,
  title TEXT,
  description TEXT,
  dueDate TEXT,
  teacherId TEXT
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  assignmentId TEXT,
  studentId TEXT,
  content TEXT,
  filePath TEXT,
  submittedAt TEXT
);
`;

db.exec(initSql);

module.exports = db;
