import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import pool from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/projects/:projectId/diagrams
router.get('/project/:projectId', async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.* FROM diagrams d
       JOIN projects p ON d.project_id = p.id
       WHERE d.project_id = ? AND p.user_id = ?
       ORDER BY d.updated_at DESC`,
      [req.params.projectId, req.userId]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/diagrams
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { projectId, name, diagramType } = req.body;
    if (!projectId || !name) return res.status(400).json({ error: 'projectId and name required' });
    // Verify ownership
    const [proj] = await pool.query('SELECT id FROM projects WHERE id=? AND user_id=?', [projectId, req.userId]) as any;
    if (proj.length === 0) return res.status(403).json({ error: 'Access denied' });
    const diagramId = uuid();
    const pageId = uuid();
    await pool.query(
      'INSERT INTO diagrams (id, project_id, name, diagram_type) VALUES (?,?,?,?)',
      [diagramId, projectId, name, diagramType || 'flowchart']
    );
    await pool.query(
      'INSERT INTO diagram_pages (id, diagram_id, name, page_order) VALUES (?,?,?,0)',
      [pageId, diagramId, 'Page 1']
    );
    res.status(201).json({ id: diagramId, name, diagramType: diagramType || 'flowchart' });
  } catch (err) { next(err); }
});

// GET /api/diagrams/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.* FROM diagrams d
       JOIN projects p ON d.project_id = p.id
       WHERE d.id = ? AND p.user_id = ?`,
      [req.params.id, req.userId]
    ) as any;
    if (rows.length === 0) return res.status(404).json({ error: 'Diagram not found' });
    const diagram = rows[0];
    // Get pages
    const [pages] = await pool.query(
      'SELECT * FROM diagram_pages WHERE diagram_id = ? ORDER BY page_order',
      [diagram.id]
    );
    diagram.pages = pages;
    res.json(diagram);
  } catch (err) { next(err); }
});

// PUT /api/diagrams/:id
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = req.body;
    await pool.query('UPDATE diagrams SET name=COALESCE(?,name), description=COALESCE(?,description) WHERE id=?',
      [name, description, req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/diagrams/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await pool.query(
      `DELETE d FROM diagrams d JOIN projects p ON d.project_id=p.id WHERE d.id=? AND p.user_id=?`,
      [req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/diagrams/:id/pages
router.get('/:id/pages', async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM diagram_pages WHERE diagram_id = ? ORDER BY page_order',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/diagrams/:id/pages
router.post('/:id/pages', async (req: AuthRequest, res, next) => {
  try {
    const { name } = req.body;
    const pageId = uuid();
    const [maxOrder] = await pool.query(
      'SELECT COALESCE(MAX(page_order), -1) + 1 AS next_order FROM diagram_pages WHERE diagram_id = ?',
      [req.params.id]
    ) as any;
    await pool.query(
      'INSERT INTO diagram_pages (id, diagram_id, name, page_order) VALUES (?,?,?,?)',
      [pageId, req.params.id, name || 'New Page', maxOrder[0].next_order]
    );
    res.status(201).json({ id: pageId, name: name || 'New Page' });
  } catch (err) { next(err); }
});

// DELETE /api/pages/:pageId
router.delete('/pages/:pageId', async (req: AuthRequest, res, next) => {
  try {
    await pool.query('DELETE FROM diagram_pages WHERE id = ?', [req.params.pageId]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
