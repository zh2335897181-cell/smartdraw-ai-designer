import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import pool from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

interface UserSocket {
  userId: string;
  username: string;
  diagramId: string | null;
}

const userSockets = new Map<string, UserSocket>();

export function setupCollaboration(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`[Socket] User connected: ${userId}`);

    // Fetch username
    let username = 'Unknown';
    try {
      const [rows] = await pool.query('SELECT username FROM users WHERE id = ?', [userId]) as any;
      if (rows.length > 0) username = rows[0].username;
    } catch {}

    userSockets.set(socket.id, { userId, username, diagramId: null });

    // Join diagram room
    socket.on('join-diagram', (diagramId: string) => {
      socket.join(`diagram:${diagramId}`);
      const entry = userSockets.get(socket.id);
      if (entry) entry.diagramId = diagramId;

      // Track in DB
      pool.query(
        'INSERT INTO collaboration_sessions (id, diagram_id, user_id, socket_id) VALUES (UUID(), ?, ?, ?) ON DUPLICATE KEY UPDATE socket_id=?, is_active=TRUE',
        [diagramId, userId, socket.id, socket.id]
      ).catch(() => {});

      // Broadcast user list
      broadcastUsers(io, diagramId);

      socket.to(`diagram:${diagramId}`).emit('user-joined', {
        userId, username, socketId: socket.id,
      });
    });

    // Leave diagram
    socket.on('leave-diagram', (diagramId: string) => {
      socket.leave(`diagram:${diagramId}`);
      if (userSockets.has(socket.id)) userSockets.get(socket.id)!.diagramId = null;

      socket.to(`diagram:${diagramId}`).emit('user-left', { userId, username });
      broadcastUsers(io, diagramId);
    });

    // Node/Edge operations sync
    socket.on('op', (data: { diagramId: string; op: any }) => {
      socket.to(`diagram:${data.diagramId}`).emit('op', {
        op: data.op,
        userId,
        username,
        timestamp: Date.now(),
      });
    });

    // Cursor position
    socket.on('cursor-move', (data: { diagramId: string; position: { x: number; y: number; pageId?: string } }) => {
      socket.to(`diagram:${data.diagramId}`).emit('cursor-move', {
        userId, username, position: data.position,
      });
    });

    // Mouse pointer position (for showing remote cursors)
    socket.on('pointer', (data: { diagramId: string; x: number; y: number }) => {
      socket.to(`diagram:${data.diagramId}`).emit('pointer', {
        userId, username, x: data.x, y: data.y,
      });
    });

    // Selection broadcast
    socket.on('selection-change', (data: { diagramId: string; selectedIds: string[] }) => {
      socket.to(`diagram:${data.diagramId}`).emit('selection-change', {
        userId, username, selectedIds: data.selectedIds,
      });
    });

    socket.on('disconnect', async () => {
      const entry = userSockets.get(socket.id);
      if (entry?.diagramId) {
        socket.to(`diagram:${entry.diagramId}`).emit('user-left', { userId, username });
        broadcastUsers(io, entry.diagramId);
        pool.query(
          'UPDATE collaboration_sessions SET is_active=FALSE, left_at=NOW() WHERE user_id=? AND diagram_id=?',
          [userId, entry.diagramId]
        ).catch(() => {});
      }
      userSockets.delete(socket.id);
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });
}

async function broadcastUsers(io: Server, diagramId: string) {
  const users: { userId: string; username: string; socketId: string }[] = [];
  for (const [sid, entry] of userSockets) {
    if (entry.diagramId === diagramId) {
      users.push({ userId: entry.userId, username: entry.username, socketId: sid });
    }
  }
  io.to(`diagram:${diagramId}`).emit('users-online', users);
}
