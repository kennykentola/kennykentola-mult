import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
import authRouter from './routes/auth';
import printingRouter from './routes/printing';
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/printing', printingRouter);

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'kennykentola-multi-company-api'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[API] Server initialized on port ${PORT}`);
});
