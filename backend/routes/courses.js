// backend/routes/courses.js
const express = require('express');
const router = express.Router();
const { all, run, get } = require('../db');
const { auth, checkRole } = require('../middleware/auth');

// List all courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await all('SELECT id, title, description, teacher_id AS teacherId, created_at, duration, category FROM courses ORDER BY created_at DESC');
    
    // Add assignments for each course (optional, but good for summary)
    for (let course of courses) {
      course.assignments = await all('SELECT id, title, deadline FROM assignments WHERE course_id = ?', [course.id]);
    }
    
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// List courses the user is enrolled in (MUST BE BEFORE /:id)
router.get('/enrolled', auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const courses = await all(`
      SELECT c.id, c.title, c.description, c.teacher_id AS teacherId, e.enrolled_at, c.duration, c.category
      FROM courses c
      JOIN enrollments e ON e.course_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `, [userId]);

    for (let course of courses) {
      course.assignments = await all('SELECT id, title, deadline FROM assignments WHERE course_id = ?', [course.id]);
    }

    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// List courses owned by the teacher
router.get('/owned', auth, checkRole('teacher'), async (req, res) => {
  try {
    const courses = await all('SELECT id, title, description, category, duration FROM courses WHERE teacher_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get single course (public)
router.get('/:id', async (req, res) => {
  try {
    const course = await get(`
      SELECT c.id, c.title, c.description, c.teacher_id AS teacherId, c.created_at, c.duration, u.name as teacherName 
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `, [req.params.id]);
    
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Create a course (teachers)
router.post('/', auth, checkRole('teacher'), async (req, res) => {
  const { title, description, duration, category } = req.body || {};
  const teacherId = req.user.id;

  if (!title) return res.status(400).json({ error: 'title required' });

  try {
    const result = await run(
      'INSERT INTO courses (title, description, teacher_id, duration, category) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', teacherId, duration || null, category || 'General']
    );

    const course = {
      id: result.lastID,
      title,
      description,
      teacherId,
      duration: duration || null,
      category: category || 'General'
    };

    res.status(201).json({ message: 'Course created', course });
  } catch (err) {
    res.status(500).json({ error: 'DB insert error', details: err.message });
  }
});

// Enroll a user into a course (students)
router.post('/:courseId/enroll', auth, async (req, res) => {
  const courseId = req.params.courseId;
  const userId = req.user.id;

  try {
    // Check if course exists
    const course = await get('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Enroll
    const result = await run(
      'INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );

    if (result.changes === 0) return res.status(409).json({ error: 'Already enrolled' });

    // Create notification for student
    await run(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, 'Enrollment Successful', `You've successfully enrolled in "${course.title || 'the course'}". Start learning now!`, 'enrollment']
    );

    res.status(201).json({ message: 'Enrolled', enrollment: { user_id: userId, course_id: courseId } });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// List students enrolled in a course (for teachers)
router.get('/:courseId/students', auth, checkRole('teacher'), async (req, res) => {
  const { courseId } = req.params;
  const teacherId = req.user.id;

  try {
    // Verify course ownership
    const course = await get('SELECT id FROM courses WHERE id = ? AND teacher_id = ?', [courseId, teacherId]);
    if (!course) return res.status(403).json({ error: 'Access denied: You are not the instructor of this course' });

    const students = await all(`
      SELECT u.id, u.name, u.email, e.enrolled_at
      FROM users u
      JOIN enrollments e ON e.user_id = u.id
      WHERE e.course_id = ?
    `, [courseId]);

    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
