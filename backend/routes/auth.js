// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get } = require('../db'); // adjust if your db helper is different

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password and role required' });
    }

    const exists = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (exists) return res.status(409).json({ error: 'email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    );

    const userId = result.lastID;
    const user = { id: userId, name, email, role };
    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ message: 'Registered', token, user });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const userRow = await get('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
    if (!userRow) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, userRow.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const user = { id: userRow.id, name: userRow.name, email: userRow.email, role: userRow.role };
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ message: 'Logged in', token, user });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
