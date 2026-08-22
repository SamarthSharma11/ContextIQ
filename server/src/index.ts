import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { RedisRateLimitStore } from './services/rateLimitStore';
import { config } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth';
import sourceRoutes from './routes/sources';
import chatRoutes from './routes/chat';
import chatbotRoutes from './routes/chatbot';
import analyticsRoutes from './routes/analytics';
import teamRoutes from './routes/team';
import billingRoutes from './routes/billing';

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS setup (allow dashboard client and external embeds)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins for the chat widget endpoints, and clientUrl for dashboard
      callback(null, true);
    },
    credentials: true,
  })
);

// Distributed rate limiter — shared across all Railway instances via Redis.
// Falls back gracefully to in-memory when REDIS_URL is not set.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const limiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 1000,
  standardHeaders: true,  // return RateLimit-* headers per RFC 6585
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  store: new RedisRateLimitStore({ prefix: 'rl:api:', windowMs: WINDOW_MS }),
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ContextIQ API Server',
    environment: config.nodeEnv,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/billing', billingRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
async function start() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(`🚀 ContextIQ Server running on port ${config.port}`);
    console.log(`🌐 Health check: http://localhost:${config.port}/health`);
    console.log(`=========================================`);
  });
}

start();

export default app;
