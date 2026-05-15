// backend/routes/discussions.js
const express = require('express');
const router = express.Router();
const { all, run, get } = require('../db');
const { auth } = require('../middleware/auth');

// Post a comment
router.post('/', auth, async (req, res) => {
  const { courseId, content, parentId } = req.body;
  if (!courseId || !content) return res.status(400).json({ error: 'Course ID and content required' });

  try {
    const result = await run(
      'INSERT INTO discussions (course_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [courseId, req.user.id, content, parentId || null]
    );
    res.status(201).json({ message: 'Comment posted', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get discussions for a course
router.get('/:courseId', auth, async (req, res) => {
  try {
    const comments = await all(`
      SELECT d.*, u.name as userName, u.role as userRole 
      FROM discussions d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.course_id = ? 
      ORDER BY d.created_at ASC
    `, [req.params.courseId]);
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
