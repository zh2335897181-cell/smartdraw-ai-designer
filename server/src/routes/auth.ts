import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import pool from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, password are required' });
    }
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    ) as any;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const id = uuid();
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (id, username, email, password_hash, display_name) VALUES (?,?,?,?,?)',
      [id, username, email, passwordHash, displayName || username]
    );
    // Create default settings
    await pool.query(
      'INSERT INTO user_settings (id, user_id) VALUES (?,?)',
      [uuid(), id]
    );
    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
    res.status(201).json({
      token,
      user: { id, username, email, displayName: displayName || username },
    });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash, display_name, avatar_url FROM users WHERE email = ?',
      [email]
    ) as any;
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, display_name, avatar_url, created_at FROM users WHERE id = ?',
      [req.userId]
    ) as any;
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const u = rows[0];
    res.json({
      id: u.id,
      username: u.username,
      email: u.email,
      displayName: u.display_name,
      avatarUrl: u.avatar_url,
      createdAt: u.created_at,
    });
  } catch (err) { next(err); }
});

export default router;
