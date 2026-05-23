import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import pool from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// POST /api/sync/save — save full page state
router.post('/save', async (req: AuthRequest, res, next) => {
  try {
    const { pageId, nodes, edges, viewport } = req.body;
    if (!pageId) return res.status(400).json({ error: 'pageId required' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // Clear existing
      await conn.query('DELETE FROM diagram_edges WHERE page_id = ?', [pageId]);
      await conn.query('DELETE FROM diagram_nodes WHERE page_id = ?', [pageId]);

      // Insert nodes
      if (nodes && nodes.length > 0) {
        const values: any[] = [];
        const placeholders = nodes.map((n: any) => {
          values.push(
            n.id || uuid(), pageId, n.type || 'rectangle', n.data?.label || n.label || '',
            n.position?.x || 0, n.position?.y || 0,
            n.width || n.style?.width || 120, n.height || n.style?.height || 60,
            JSON.stringify(n.style || {}), n.zIndex || 0,
            n.data?.groupId || null, JSON.stringify(n.data || {})
          );
          return '(?,?,?,?,?,?,?,?,?,?,?,?)';
        });
        await conn.query(
          `INSERT INTO diagram_nodes (id,page_id,node_type,label,position_x,position_y,width,height,style,z_index,group_id,data) VALUES ${placeholders.join(',')}`,
          values
        );
      }

      // Insert edges
      if (edges && edges.length > 0) {
        const eValues: any[] = [];
        const ePlaceholders = edges.map((e: any) => {
          eValues.push(
            e.id || uuid(), pageId, e.source, e.target,
            e.type || 'bezier',
            e.sourceHandle || null, e.targetHandle || null,
            e.data?.label || e.label || '',
            JSON.stringify(e.style || {}), e.zIndex || 0,
            JSON.stringify(e.data || {})
          );
          return '(?,?,?,?,?,?,?,?,?,?,?)';
        });
        await conn.query(
          `INSERT INTO diagram_edges (id,page_id,source_node_id,target_node_id,edge_type,source_handle,target_handle,label,style,z_index,data) VALUES ${ePlaceholders.join(',')}`,
          eValues
        );
      }

      // Update viewport
      if (viewport) {
        await conn.query('UPDATE diagram_pages SET viewport = ? WHERE id = ?', [JSON.stringify(viewport), pageId]);
      }

      await conn.commit();
      res.json({ success: true });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) { next(err); }
});

// GET /api/sync/load/:pageId — load full page state
router.get('/load/:pageId', async (req: AuthRequest, res, next) => {
  try {
    const { pageId } = req.params;
    const [nodes] = await pool.query('SELECT * FROM diagram_nodes WHERE page_id = ? ORDER BY z_index', [pageId]);
    const [edges] = await pool.query('SELECT * FROM diagram_edges WHERE page_id = ? ORDER BY z_index', [pageId]);
    const [pages] = await pool.query('SELECT viewport FROM diagram_pages WHERE id = ?', [pageId]) as any;
    const safeParse = (v: any) => {
      if (!v) return {};
      if (typeof v === 'object') return v;
      try { return JSON.parse(v); } catch { return {}; }
    };

    res.json({
      nodes: (nodes as any[]).map(n => ({
        id: n.id,
        type: n.node_type,
        position: { x: n.position_x, y: n.position_y },
        data: {
          label: n.label,
          ...safeParse(n.data),
          style: safeParse(n.style),
          groupId: n.group_id,
        },
        width: n.width,
        height: n.height,
        zIndex: n.z_index,
        selected: false,
        draggable: !n.is_locked,
        hidden: n.is_hidden,
      })),
      edges: (edges as any[]).map(e => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        type: e.edge_type,
        sourceHandle: e.source_handle,
        targetHandle: e.target_handle,
        data: { label: e.label, ...safeParse(e.data) },
        style: safeParse(e.style),
        zIndex: e.z_index,
      })),
      viewport: pages.length > 0 ? safeParse(pages[0].viewport) : { x: 0, y: 0, zoom: 1 },
    });
  } catch (err) { next(err); }
});

export default router;
