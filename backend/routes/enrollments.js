// backend/routes/enrollments.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// helpers from your server (if these aren't globally available, require them)
// Adjust paths if needed. The simplest is to import your db helper functions
// If you put runAsync/allAsync/getAsync in another module you can require them; otherwise
// we will require the sqlite3 db instance directly and implement small helpers here.

const db = require('../db');

// small promise helpers (same style as server.js)
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Use your existing auth middleware (adjust path)
const { authMiddleware } = require('../auth'); // ensure auth.js exports authMiddleware

// POST /api/enroll  — student enrolls in course
router.post('/enroll', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user && (req.user.id || req.user._id); // support both styles

    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });
    if (!courseId) return res.status(400).json({ error: 'Missing courseId' });

    // check course exists
    const course = await getAsync('SELECT id, teacherId FROM courses WHERE id = ?', [courseId]);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // optional: only students can enroll (comment out to allow teachers/enrollments)
    if (!req.user.role || req.user.role.toLowerCase() !== 'student') {
      return res.status(403).json({ error: 'Only students can enroll' });
    }

    // prevent duplicate
    const existing = await getAsync(
      'SELECT id FROM enrollments WHERE studentId = ? AND courseId = ?',
      [studentId, courseId]
    );
    if (existing) return res.status(400).json({ error: 'Already enrolled' });

    const id = 'enr-' + uuidv4();
    await runAsync(
      'INSERT INTO enrollments (id, studentId, courseId, enrolledAt) VALUES (?,?,?,?)',
      [id, studentId, courseId, new Date().toISOString()]
    );

    // notify socket if you use it
    if (global.io) global.io.emit('enrollment', { id, courseId, studentId });

    return res.json({ message: 'Enrolled successfully', enrollmentId: id });
  } catch (err) {
    console.error('Enroll route error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/my-courses  — list courses the logged-in student enrolled in
router.get('/my-courses', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user && (req.user.id || req.user._id);
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    const rows = await allAsync(
      `SELECT c.* FROM courses c
       JOIN enrollments e ON c.id = e.courseId
       WHERE e.studentId = ?
       ORDER BY e.enrolledAt DESC`,
      [studentId]
    );

    return res.json(rows);
  } catch (err) {
    console.error('My-courses route error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/courses/:courseId/students  — teacher views enrolled students
router.get('/courses/:courseId/students', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user && (req.user.id || req.user._id);

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const course = await getAsync('SELECT id, teacherId FROM courses WHERE id = ?', [courseId]);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (req.user.role !== 'teacher' || course.teacherId !== userId) {
      return res.status(403).json({ error: 'Only course teacher can view students' });
    }

    const students = await allAsync(
      `SELECT u.id, u.name, u.email, e.enrolledAt
       FROM enrollments e
       JOIN users u ON e.studentId = u.id
       WHERE e.courseId = ?
       ORDER BY e.enrolledAt DESC`,
      [courseId]
    );

    return res.json({ students });
  } catch (err) {
    console.error('Course students route error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
