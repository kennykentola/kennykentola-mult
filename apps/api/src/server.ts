import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './scripts/initAppwrite';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL_2,
    process.env.CLIENT_URL_3
  ].filter((value): value is string => Boolean(value))
);

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isLocalhostOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    const isAllowedOrigin = allowedOrigins.has(origin);

    if (isLocalhostOrigin || isAllowedOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
import authRouter from './routes/auth';
import printingRouter from './routes/printing';
import academyRouter from './routes/academy';
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/printing', printingRouter);
app.use('/api/v1/academy', academyRouter);

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'kennykentola-multi-company-api'
  });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('[API] Appwrite database initialization completed.');
  } catch (err) {
    console.error('[API] Appwrite database initialization failed:', err);
  }

  app.listen(PORT, () => {
    console.log(`[API] Server initialized on port ${PORT}`);
  });
}

// Start Server
void startServer();
