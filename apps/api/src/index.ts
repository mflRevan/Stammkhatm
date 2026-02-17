import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import cycleRoutes from './routes/cycles.js';
import adminRoutes from './routes/admin.js';
import { startCron } from './cron.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
const appUrl = process.env.APP_URL || 'http://localhost:5173';
const appUrls = (process.env.APP_URLS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowAllOrigins = appUrl === '*';
const allowedOrigins = [appUrl, ...appUrls].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowAllOrigins) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/cycles', cycleRoutes);
app.use('/segments', cycleRoutes); // POST /segments/:id/claim
app.use('/claims', cycleRoutes); // POST /claims/:id/complete
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API running on http://0.0.0.0:${PORT}`);
  startCron();
});
