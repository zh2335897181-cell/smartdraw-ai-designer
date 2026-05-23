import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import diagramRoutes from './routes/diagrams';
import syncRoutes from './routes/sync';
import userRoutes from './routes/user';
import { errorHandler } from './middleware/errorHandler';
import { setupCollaboration } from './socket/collaboration';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Error handling
app.use(errorHandler);

// Socket.IO
setupCollaboration(io);

const PORT = parseInt(process.env.PORT || '3001');
server.listen(PORT, () => {
  console.log(`[Server] SmartDraw API running on port ${PORT}`);
});

export default server;
