// backend/routes/courses.js
const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// DB helper
const DB_PATH = path.join(__dirname, '..', 'database.sqlite');
function getDb() {
  return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error('Failed to open DB', DB_PATH, err.message);
  });
}

// List all courses (public) — note alias teacher_id -> teacherId
router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT id, title, description, teacher_id AS teacherId, created_at, duration FROM courses ORDER BY created_at DESC', [], (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    return res.json({ courses: rows || [] });
  });
});

// Create a course (teachers)
router.post('/', (req, res) => {
  const { title, description, teacher_id, teacherId, duration } = req.body || {};
  // Accept either teacher_id (snake) or teacherId (camel)
  const teacherIdToUse = teacher_id || teacherId || null;

  if (!title) return res.status(400).json({ message: 'title required' });

  const db = getDb();
  db.run('INSERT INTO courses (title, description, teacher_id, duration) VALUES (?, ?, ?, ?)', [title, description || '', teacherIdToUse, duration || null], function (err) {
    if (err) {
      db.close();
      return res.status(500).json({ message: 'DB insert error', error: err.message });
    }

    const created = {
      id: this.lastID,
      title,
      description,
      teacherId: teacherIdToUse,
      duration: duration || null
    };

    db.close();
    return res.status(201).json({ message: 'Course created', course: created });
  });
});

// Enroll a user into a course
router.post('/:courseId/enroll', (req, res) => {
  const courseId = req.params.courseId;
  const { user_id, userId } = req.body || {};
  const userIdToUse = user_id || userId;
  if (!userIdToUse) return res.status(400).json({ message: 'user_id (or userId) required to enroll' });

  const db = getDb();
  db.run('INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)', [userIdToUse, courseId], function (err) {
    db.close();
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    if (this.changes === 0) return res.status(409).json({ message: 'Already enrolled' });
    return res.status(201).json({ message: 'Enrolled', enrollment: { id: this.lastID, user_id: userIdToUse, course_id: courseId } });
  });
});

// List courses the user is enrolled in
router.get('/enrolled/:userId', (req, res) => {
  const userId = req.params.userId;
  const db = getDb();
  db.all(`
    SELECT c.id, c.title, c.description, c.teacher_id AS teacherId, e.enrolled_at
    FROM courses c
    JOIN enrollments e ON e.course_id = c.id
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC
  `, [userId], (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    return res.json({ courses: rows || [] });
  });
});

module.exports = router;
