const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/fileDb');
const router = express.Router();

// Teacher creates assignment (simple object attached to course)
router.post('/:courseId/create', async (req,res) => {
  const { title, description, dueDate, teacherId } = req.body;
  const courses = await readJSON('courses.json');
  const course = courses.find(c=>c.id===req.params.courseId);
  if(!course) return res.status(404).json({error:'no course'});
  course.assignments = course.assignments || [];
  const asg = { id: uuidv4(), title, description, dueDate, teacherId };
  course.assignments.push(asg);
  await writeJSON('courses.json', courses);
  res.json(asg);
});

// Student submit assignment
router.post('/:courseId/submit', async (req,res) => {
  const { studentId, assignmentId, content } = req.body;
  const subs = await readJSON('submissions.json');
  const sub = { id: uuidv4(), courseId: req.params.courseId, assignmentId, studentId, content, grade: null, feedback: null, submittedAt: new Date().toISOString() };
  subs.push(sub);
  await writeJSON('submissions.json', subs);
  res.json(sub);
});

// Get submissions for a course
router.get('/:courseId/submissions', async (req,res) => {
  const subs = await readJSON('submissions.json');
  res.json(subs.filter(s=>s.courseId===req.params.courseId));
});

// Grade a submission
router.post('/grade/:submissionId', async (req,res) => {
  const { grade, feedback } = req.body;
  const subs = await readJSON('submissions.json');
  const s = subs.find(x=>x.id===req.params.submissionId);
  if(!s) return res.status(404).json({error:'not found'});
  s.grade = grade; s.feedback = feedback;
  await writeJSON('submissions.json', subs);
  res.json(s);
});

module.exports = router;
