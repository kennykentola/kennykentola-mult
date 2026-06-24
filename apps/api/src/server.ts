import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeDatabase } from './scripts/initAppwrite';
import { initSocketServer } from './services/socket';

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

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, true);
    }

    const isLocalhostOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    const isVercelOrigin = /\.vercel\.app$/.test(origin);
    const isAllowedOrigin = allowedOrigins.has(origin);

    if (isLocalhostOrigin || isVercelOrigin || isAllowedOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(helmet());
app.set('trust proxy', 1);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
import authRouter from './routes/auth';
import printingRouter from './routes/printing';
import academyRouter from './routes/academy';
import paymentsRouter from './routes/payments';
import adminRouter from './routes/admin';
import superAdminRouter from './routes/super-admin';
import chatRouter from './routes/chat';
import uploadRouter from './routes/upload';
import projectsRouter from './routes/projects';
import academicProjectsRouter from './routes/academicProjects';
import maintenanceRouter from './routes/maintenance';
import solarRouter from './routes/solar';
import telemetryRouter from './routes/telemetry';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/printing', printingRouter);
app.use('/api/v1/academy', academyRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/super-admin', superAdminRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/academic-projects', academicProjectsRouter);
app.use('/api/v1/maintenance', maintenanceRouter);
app.use('/api/v1/solar', solarRouter);
app.use('/api/v1/telemetry', telemetryRouter);

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'kennykentola-multi-company-api'
  });
});

const httpServer = createServer(app);
initSocketServer(httpServer);

async function startServer() {
  try {
    if (process.env.INIT_APPWRITE === 'true') {
      await initializeDatabase();
      console.log('[API] Appwrite database initialization completed.');
    } else {
      console.log('[API] Skipping Appwrite database initialization. (Set INIT_APPWRITE=true to run)');
    }
  } catch (err) {
    console.error('[API] Appwrite database initialization failed:', err);
    process.exit(1);
  }

  httpServer.listen(PORT, () => {
    console.log(`[API] Server initialized on port ${PORT}`);
  });
}

// Start Server
void startServer();
