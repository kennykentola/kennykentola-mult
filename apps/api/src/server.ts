import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initializeDatabase } from './scripts/initAppwrite';
import { initSocketServer } from './services/socket';
import { initCronJobs } from './services/cronService';

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

    const isLocalhostOrigin = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+):\d+$/.test(origin);
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
app.use(cookieParser());

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
import academicIdeasRouter from './routes/academicIdeas';
import portfolioRouter from './routes/portfolio';
import thesisSamplesRouter from './routes/thesisSamples';
import designPortfolioRouter from './routes/designPortfolio';
import maintenanceRouter from './routes/maintenance';
import solarRouter from './routes/solar';
import telemetryRouter from './routes/telemetry';
import learningPathsRouter from './routes/learningPaths';
import ticketsRouter from './routes/tickets';
import executeRouter from './routes/execute';
import aiRouter from './routes/ai';
import inventoryRouter from './routes/inventory';
import { contactRoutes } from './routes/contact';
import { newsletterRouter } from './routes/newsletter';
import { agencyRouter } from './routes/agency';
import { teamRouter } from './routes/team';
import dashboardRouter from './routes/dashboard';
import blogRouter from './routes/blog';
import orchestratorRouter from './routes/orchestrator';
import notificationsRouter from './routes/notifications';
import promptsRouter from './routes/prompts';
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/orchestrator', orchestratorRouter);
app.use('/api/v1/prompts', promptsRouter);
app.use('/api/v1/printing', printingRouter);
app.use('/api/v1/academy', academyRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/super-admin', superAdminRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/academic-projects', academicProjectsRouter);
app.use('/api/v1/academic-ideas', academicIdeasRouter);
app.use('/api/v1/portfolio', portfolioRouter);
app.use('/api/v1/thesis-samples', thesisSamplesRouter);
app.use('/api/v1/design-portfolio', designPortfolioRouter);
app.use('/api/v1/maintenance', maintenanceRouter);
app.use('/api/v1/solar', solarRouter);
app.use('/api/v1/telemetry', telemetryRouter);
app.use('/api/v1/learning-paths', learningPathsRouter);
app.use('/api/v1/tickets', ticketsRouter);
app.use('/api/v1/execute', executeRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/newsletter', newsletterRouter);
app.use('/api/v1/agency', agencyRouter);
app.use('/api/v1/team', teamRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/notifications', notificationsRouter);

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

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[API] Server initialized on port ${PORT} (0.0.0.0)`);
    initCronJobs();
  });
}

// Start Server
void startServer();
