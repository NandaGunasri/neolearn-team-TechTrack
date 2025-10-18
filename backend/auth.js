// backend/auth.js
// Export: { signUser, authMiddleware }
// Works with file-based users (users.json) and also supports JWTs.

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const FAKE_PREFIX = 'fake-jwt-';

// Utility: find users file and read it
function usersFileCandidates() {
  return [
    path.join(__dirname, 'data', 'users.json'),
    path.join(__dirname, 'utils', 'users.json'),
    path.join(__dirname, 'users.json'),
    path.join(__dirname, '..', 'users.json'),
  ];
}

async function readUsers() {
  const candidates = usersFileCandidates();
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const raw = await fs.promises.readFile(p, 'utf8');
      try {
        return JSON.parse(raw || '[]');
      } catch (err) {
        console.error('Failed to parse users.json at', p, err);
        return [];
      }
    }
  }
  return [];
}

async function findUserById(id) {
  const users = await readUsers();
  if (!users) return null;
  return users.find(u => u.id === id || u._id === id);
}

async function findUserByEmail(email) {
  const users = await readUsers();
  if (!users) return null;
  return users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
}

// signUser: returns a token string.
// If user object has an `id` property (your file-based users), we return 'fake-jwt-<id>'.
// If you later want real JWTs, set process.env.USE_REAL_JWT = "1" to create real signed tokens.
function signUser(user) {
  if (!user) return null;
  const id = user.id || user._id || (user._id && user._id.toString && user._id.toString()) || user.id;
  const payload = { id, role: user.role || 'student' };

  // If you explicitly enable real JWTs via env var, create a signed token.
  if (process.env.USE_REAL_JWT === '1') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  // default: return the fake token your front-end already expects
  return FAKE_PREFIX + id;
}

// authMiddleware: attaches req.user = { id, role, name, email }
async function authMiddleware(req, res, next) {
  try {
    // 1) Authorization header
    const auth = (req.headers.authorization || '').trim();
    if (auth.startsWith('Bearer ')) {
      const token = auth.slice(7).trim();

      // fake-jwt token format used by your register/login
      if (token.startsWith(FAKE_PREFIX)) {
        const userId = token.replace(FAKE_PREFIX, '');
        const user = await findUserById(userId);
        if (!user) return res.status(401).json({ error: 'User not found (fake-jwt)' });
        req.user = { id: user.id || user._id, role: user.role, name: user.name, email: user.email };
        return next();
      }

      // try verify real JWT if used
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = payload.id || payload.userId || payload.sub;
        if (!userId) return res.status(401).json({ error: 'Invalid token payload' });
        const user = await findUserById(userId);
        if (user) {
          req.user = { id: user.id || user._id, role: user.role, name: user.name, email: user.email };
          return next();
        }
        // still allow payload-only info if you prefer:
        req.user = { id: userId, role: payload.role || 'student' };
        return next();
      } catch (err) {
        // invalid JWT — continue to other checks
        console.warn('JWT verify failed:', err.message);
      }
    }

    // 2) session-based (if you use express-session)
    if (req.session && req.session.userId) {
      const user = await findUserById(req.session.userId);
      if (!user) return res.status(401).json({ error: 'User not found (session)' });
      req.user = { id: user.id || user._id, role: user.role, name: user.name, email: user.email };
      return next();
    }

    // 3) x-user-id header helper (dev only)
    const headerUserId = req.headers['x-user-id'];
    if (headerUserId) {
      const user = await findUserById(headerUserId);
      if (!user) return res.status(401).json({ error: 'User not found (x-user-id)' });
      req.user = { id: user.id || user._id, role: user.role, name: user.name, email: user.email };
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized: no token/session found' });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Auth middleware error' });
  }
}

module.exports = { signUser, authMiddleware };
