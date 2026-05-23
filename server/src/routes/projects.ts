import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import pool from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/projects
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, thumbnail_url, is_archived, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/projects
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = uuid();
    await pool.query(
      'INSERT INTO projects (id, user_id, name, description) VALUES (?,?,?,?)',
      [id, req.userId, name, description || null]
    );
    res.status(201).json({ id, name, description });
  } catch (err) { next(err); }
});

// GET /api/projects/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    ) as any;
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/projects/:id
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { name, description, is_archived } = req.body;
    await pool.query(
      'UPDATE projects SET name=COALESCE(?,name), description=COALESCE(?,description), is_archived=COALESCE(?,is_archived) WHERE id=? AND user_id=?',
      [name, description, is_archived, req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await pool.query('DELETE FROM projects WHERE id=? AND user_id=?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
