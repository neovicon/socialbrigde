import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import socialRoutes from './routes/social.routes.js';
import { errorHandler } from './middleware/error.js';

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/auth', socialRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'SocialBridge API is running' });
});

// ── Error handler (must be last) ────────────────────────────
app.use(errorHandler);

export default app;
