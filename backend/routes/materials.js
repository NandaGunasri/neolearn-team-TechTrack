// backend/routes/materials.js
const express = require('express');
const router = express.Router();
const { all, run } = require('../db');
const { auth, checkRole } = require('../middleware/auth');

// Upload material (Teacher only)
router.post('/', auth, checkRole('teacher'), async (req, res) => {
  const { courseId, title, fileUrl, type } = req.body;
  if (!courseId || !title) return res.status(400).json({ error: 'Course ID and title required' });

  try {
    await run(
      'INSERT INTO materials (course_id, title, file_url, type) VALUES (?, ?, ?, ?)',
      [courseId, title, fileUrl || '', type || 'Link']
    );

    // Notify students
    const students = await all('SELECT user_id FROM enrollments WHERE course_id = ?', [courseId]);
    for (const student of students) {
      await run(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [student.user_id, 'New Resource Available', `New material "${title}" has been added to your course.`, 'material']
      );
    }

    res.status(201).json({ message: 'Material uploaded' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get materials for a course
router.get('/:courseId', auth, async (req, res) => {
  try {
    const materials = await all('SELECT * FROM materials WHERE course_id = ? ORDER BY created_at DESC', [req.params.courseId]);
    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete material (Teacher only)
router.delete('/:id', auth, checkRole('teacher'), async (req, res) => {
  try {
    await run('DELETE FROM materials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
