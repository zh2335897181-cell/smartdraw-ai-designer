import { Router } from 'express';
import pool from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/user/settings
router.get('/settings', async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.userId]) as any;
    res.json(rows[0] || {});
  } catch (err) { next(err); }
});

// PUT /api/user/settings
router.put('/settings', async (req: AuthRequest, res, next) => {
  try {
    const { theme, language, grid_enabled, snap_enabled, auto_save_interval, default_font, default_font_size } = req.body;
    await pool.query(
      `UPDATE user_settings SET
        theme=COALESCE(?,theme), language=COALESCE(?,language),
        grid_enabled=COALESCE(?,grid_enabled), snap_enabled=COALESCE(?,snap_enabled),
        auto_save_interval=COALESCE(?,auto_save_interval), default_font=COALESCE(?,default_font),
        default_font_size=COALESCE(?,default_font_size)
      WHERE user_id=?`,
      [theme, language, grid_enabled, snap_enabled, auto_save_interval, default_font, default_font_size, req.userId]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
