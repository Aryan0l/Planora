import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.routes';
import planRoutes from '../modules/studyPlans/studyPlan.routes';
import followRoutes from '../modules/studyPlans/follow.routes';
import progressRoutes from '../modules/studyPlans/progress.routes';
import ratingRoutes from '../modules/studyPlans/rating.routes';
import pool, { getDatabaseConnectionInfo } from '../database/pool';

import { rateLimiter } from './middleware/requestLimiter';
import { errorHandler } from './middleware/errorResponder';

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(rateLimiter);

app.get('/api/health', async (req, res) => {
  const databaseInfo = getDatabaseConnectionInfo();

  try {
    await pool.query('SELECT 1');

    res.json({
      success: true,
      status: 'ok',
      database: {
        ...databaseInfo,
        connected: true,
      },
    });
  } catch (error) {
    const connectionError = error as { code?: string; errors?: Array<{ code?: string }> };
    const codes = [
      connectionError.code,
      ...(connectionError.errors || []).map((nestedError) => nestedError.code),
    ].filter(Boolean);

    res.status(503).json({
      success: false,
      status: 'degraded',
      message: databaseInfo.configured
        ? 'Database connection failed. Check the backend DATABASE_URL and DATABASE_SSL settings on Render.'
        : 'Database connection is not configured. Add DATABASE_URL to the backend service environment on Render.',
      database: {
        ...databaseInfo,
        connected: false,
        errorCodes: [...new Set(codes)],
      },
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/rating', ratingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

export default app;
