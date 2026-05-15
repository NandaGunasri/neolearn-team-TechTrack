// backend/routes/assignments.js
const express = require('express');
const router = express.Router();
const { all, run, get } = require('../db');
const { auth, checkRole } = require('../middleware/auth');

// Create assignment (Teachers only)
router.post('/create', auth, checkRole('teacher'), async (req, res) => {
  const { courseId, title, description, deadline, max_marks } = req.body;
  if (!courseId || !title) return res.status(400).json({ error: 'Course ID and title are required' });

  try {
    // Verify course ownership
    const course = await get('SELECT id FROM courses WHERE id = ? AND teacher_id = ?', [courseId, req.user.id]);
    if (!course) return res.status(403).json({ error: 'Access denied' });

    const result = await run(
      'INSERT INTO assignments (course_id, title, description, deadline, max_marks) VALUES (?, ?, ?, ?, ?)',
      [courseId, title, description || '', deadline || null, max_marks || 100]
    );

    // Notify all enrolled students
    const students = await all('SELECT user_id FROM enrollments WHERE course_id = ?', [courseId]);
    for (const student of students) {
      await run(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [student.user_id, 'New Assignment', `A new challenge "${title}" has been posted in your course.`, 'assignment']
      );
    }

    res.status(201).json({ message: 'Assignment created', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update assignment (Teachers only)
router.put('/:id', auth, checkRole('teacher'), async (req, res) => {
  const { title, description, deadline, max_marks } = req.body;
  try {
    const assignment = await get('SELECT course_id FROM assignments WHERE id = ?', [req.params.id]);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Verify course ownership
    const course = await get('SELECT id FROM courses WHERE id = ? AND teacher_id = ?', [assignment.course_id, req.user.id]);
    if (!course) return res.status(403).json({ error: 'Access denied' });

    await run(
      'UPDATE assignments SET title = ?, description = ?, deadline = ?, max_marks = ? WHERE id = ?',
      [title, description, deadline, max_marks, req.params.id]
    );
    res.json({ message: 'Assignment updated' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete assignment (Teachers only)
router.delete('/:id', auth, checkRole('teacher'), async (req, res) => {
  try {
    const assignment = await get('SELECT course_id FROM assignments WHERE id = ?', [req.params.id]);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Verify course ownership
    const course = await get('SELECT id FROM courses WHERE id = ? AND teacher_id = ?', [assignment.course_id, req.user.id]);
    if (!course) return res.status(403).json({ error: 'Access denied' });

    await run('DELETE FROM assignments WHERE id = ?', [req.params.id]);
    await run('DELETE FROM submissions WHERE assignment_id = ?', [req.params.id]);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get assignments for a course
router.get('/:courseId', auth, async (req, res) => {
  try {
    const assignments = await all('SELECT * FROM assignments WHERE course_id = ? ORDER BY created_at DESC', [req.params.courseId]);
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Submit assignment (Students only)
router.post('/:id/submit', auth, checkRole('student'), async (req, res) => {
  const assignmentId = req.params.id;
  const { content } = req.body;
  const studentId = req.user.id;

  try {
    const assignment = await get('SELECT * FROM assignments WHERE id = ?', [assignmentId]);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Check if already submitted
    const existing = await get('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?', [assignmentId, studentId]);
    if (existing) return res.status(409).json({ error: 'Assignment already submitted' });

    // Insert submission
    await run(
      'INSERT INTO submissions (assignment_id, student_id, content) VALUES (?, ?, ?)',
      [assignmentId, studentId, content || '']
    );

    // Update user points and streak
    const user = await get('SELECT last_activity_date, streak, points FROM users WHERE id = ?', [studentId]);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let newStreak = user.streak || 0;
    if (user.last_activity_date) {
      const last = new Date(user.last_activity_date);
      const diffHours = (now - last) / (1000 * 60 * 60);
      if (diffHours <= 24) {
        newStreak += 1;
      } else if (diffHours > 48) {
        newStreak = 1; // Reset if more than 2 days
      }
    } else {
      newStreak = 1;
    }

    await run(
      'UPDATE users SET points = points + 10, streak = ?, last_activity_date = ? WHERE id = ?',
      [newStreak, now.toISOString(), studentId]
    );

    res.status(201).json({ message: 'Assignment submitted successfully', streak: newStreak, pointsAdded: 10 });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// View submissions for an assignment (Teachers only)
router.get('/submissions/:assignmentId', auth, checkRole('teacher'), async (req, res) => {
  try {
    const submissions = await all(`
      SELECT s.*, u.name as studentName, u.email as studentEmail 
      FROM submissions s 
      JOIN users u ON s.student_id = u.id 
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
    `, [req.params.assignmentId]);
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Review/Mark status (Teachers only)
router.post('/submissions/:id/review', auth, checkRole('teacher'), async (req, res) => {
  const { status, feedback } = req.body;
  try {
    await run(
      'UPDATE submissions SET status = ?, feedback = ? WHERE id = ?',
      [status || 'Reviewed', feedback || '', req.params.id]
    );
    res.json({ message: 'Submission updated' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// View all submissions for all assignments in a course (Teachers only)
router.get('/all-submissions/:courseId', auth, checkRole('teacher'), async (req, res) => {
  try {
    const submissions = await all(`
      SELECT s.*, u.name as studentName, a.title as assignmentTitle, a.max_marks
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE a.course_id = ?
      ORDER BY s.submitted_at DESC
    `, [req.params.courseId]);
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
