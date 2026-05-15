// backend/routes/notifications.js
const express = require('express');
const router = express.Router();
const { all, run } = require('../db');
const { auth } = require('../middleware/auth');

// Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [req.user.id]);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Mark as read
router.post('/read-all', auth, async (req, res) => {
  try {
    await run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
