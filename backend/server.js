// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// === Basic middleware (always before routes) ===
app.use(cors());
app.use(express.json());

// === Ensure DB/tables exist BEFORE mounting routers ===
try {
  require('./db-init'); // safe to require on every start
  console.log('Database initialized (db-init loaded).');
} catch (err) {
  console.error('Failed to initialize DB (db-init):', err);
  // don't exit here if you want the server to still try to start;
  // but consider failing fast in production if DB is critical.
}

// === Mount routers ===
const authRouter = require('./routes/auth');
const coursesRouter = require('./routes/courses');

app.use('/api/auth', authRouter);
console.log('Mounted auth router at /api/auth');

app.use('/api/courses', coursesRouter);
console.log('Mounted courses router at /api/courses');

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

// === Utility: list registered routes (for debugging) ===
function listRoutes(appInstance) {
  const routes = [];
  const stack = (appInstance._router && appInstance._router.stack) || [];

  stack.forEach((middleware) => {
    if (middleware.route) {
      // direct route
      const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(',');
      routes.push(`${methods} ${middleware.route.path}`);
    } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
      // router mounted on a path (express >=4)
      const mountPath = middleware.regexp && middleware.regexp.source
        ? regexpToPath(middleware.regexp)
        : '<router>';
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase()).join(',');
          routes.push(`${methods} ${mountPath}${handler.route.path}`);
        }
      });
    }
  });

  console.log('Registered routes:\n' + routes.join('\n'));
}

// helper to convert a mounted router regexp to a readable path (best-effort)
function regexpToPath(re) {
  // e.g. /^\/api\/auth\/?(?=\/|$)/i  -> /api/auth
  try {
    const s = re.toString();
    const m = s.match(/^\/\^\\\/(.+)\\\/\?\(\?=\\\/\|\$\)\/i$/);
    if (m && m[1]) {
      return '/' + m[1].replace(/\\\//g, '/');
    }
  } catch (e) { /* ignore */ }
  return '<router>';
}

listRoutes(app);

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
