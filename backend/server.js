// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// === Basic middleware (always before routes) ===
app.use(cors());
app.use(express.json());

// === Ensure DB/tables exist BEFORE mounting routers ===
const { initDb } = require('./db');
initDb()
  .then(() => console.log('Database initialized.'))
  .catch(err => {
    console.error('Failed to initialize DB:', err);
    process.exit(1);
  });

// === Mount routers ===
const authRouter = require('./routes/auth');
const coursesRouter = require('./routes/courses');
const assignmentsRouter = require('./routes/assignments');
const gradesRouter = require('./routes/grades');
const discussionsRouter = require('./routes/discussions');
const materialsRouter = require('./routes/materials');
const notificationsRouter = require('./routes/notifications');

app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/discussions', discussionsRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/notifications', notificationsRouter);

// === Health check ===
app.get('/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// === Serve React frontend in production (optional) ===
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(buildPath));

  // For any route not handled by API, send index.html (SPA fallback)
  app.get('*', (req, res) => {
    // avoid catching API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });

  console.log('Configured to serve frontend from', buildPath);
}

// === Start server (after routers are mounted) ===
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running on ${HOST}:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
});

// === Handle startup errors like EADDRINUSE ===
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the other process or change PORT.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// === Graceful shutdown ===
function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    // if you have DB connections, close them here
    process.exit(0);
  });

  // if graceful shutdown takes too long, force exit
  setTimeout(() => {
    console.warn('Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Export app for testing or serverless adapters
module.exports = app;
