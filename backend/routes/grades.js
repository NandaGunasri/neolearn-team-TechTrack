// backend/routes/grades.js
const express = require('express');
const router = express.Router();
const { all, run, get } = require('../db');
const { auth, checkRole } = require('../middleware/auth');

// Post a grade (Teacher only)
router.post('/', auth, checkRole('teacher'), async (req, res) => {
  const { submissionId, marks, feedback } = req.body;
  if (!submissionId || marks === undefined) return res.status(400).json({ error: 'Submission ID and marks required' });

  try {
    const submission = await get('SELECT * FROM submissions WHERE id = ?', [submissionId]);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Insert or update grade
    const existingGrade = await get('SELECT id FROM grades WHERE submission_id = ?', [submissionId]);
    if (existingGrade) {
      await run('UPDATE grades SET marks = ?, feedback = ? WHERE id = ?', [marks, feedback || '', existingGrade.id]);
    } else {
      await run(
        'INSERT INTO grades (submission_id, student_id, assignment_id, marks, feedback) VALUES (?, ?, ?, ?, ?)',
        [submissionId, submission.student_id, submission.assignment_id, marks, feedback || '']
      );
    }

    // Update submission status
    await run('UPDATE submissions SET status = ? WHERE id = ?', ['Reviewed', submissionId]);

    // AWARD POINTS: Student gets marks as points
    await run('UPDATE users SET points = points + ? WHERE id = ?', [marks, submission.student_id]);

    // CHECK ACHIEVEMENTS
    const user = await get('SELECT points FROM users WHERE id = ?', [submission.student_id]);
    const milestones = [
      { min: 100, title: 'Rising Star', type: 'milestone' },
      { min: 300, title: 'Knowledge Master', type: 'excellence' },
      { min: 500, title: 'Platinum Elite', type: 'platinum' }
    ];

    for (const m of milestones) {
      if (user.points >= m.min) {
        const existing = await get('SELECT id FROM achievements WHERE user_id = ? AND title = ?', [submission.student_id, m.title]);
        if (!existing) {
          await run('INSERT INTO achievements (user_id, title, type) VALUES (?, ?, ?)', [submission.student_id, m.title, m.type]);
          await run('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', 
            [submission.student_id, 'New Achievement!', `Congratulations! You've earned the "${m.title}" badge!`, 'achievement']);
        }
      }
    }

    // Create notification for student
    await run(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [submission.student_id, 'Grade Released', `Your assignment has been graded. Marks: ${marks}. You earned ${marks} XP!`, 'grade']
    );

    res.status(201).json({ message: 'Grade saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get grades for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const grades = await all(`
      SELECT g.*, a.title as assignmentTitle 
      FROM grades g 
      JOIN assignments a ON g.assignment_id = a.id 
      WHERE g.student_id = ?
    `, [req.params.studentId]);
    res.json({ grades });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get overall performance for current student
router.get('/my-performance', auth, async (req, res) => {
  try {
    const stats = await get(`
      SELECT AVG(marks) as avgScore, COUNT(*) as gradedCount 
      FROM grades 
      WHERE student_id = ?
    `, [req.user.id]);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get grades for current student in a specific course
router.get('/student-course/:courseId', auth, async (req, res) => {
  try {
    const grades = await all(`
      SELECT g.*, a.title as assignmentTitle 
      FROM grades g 
      JOIN assignments a ON g.assignment_id = a.id 
      WHERE g.student_id = ? AND a.course_id = ?
    `, [req.user.id, req.params.courseId]);
    res.json({ grades });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
