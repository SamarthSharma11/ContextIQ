import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../services/logger';

let isConnecting = false;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1 || isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    const uri = config.mongoUri;
    if (!uri || uri.includes('localhost') && config.nodeEnv === 'production') {
      logger.warn(
        `[Database] Warning: Running in production but MONGODB_URI is pointing to ${uri}. Ensure MONGODB_URI is set in your Railway Environment Variables.`
      );
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    logger.info(`[Database] MongoDB connected successfully to ${uri.replace(/\/\/.*@/, '//***:***@')}`);
    isConnecting = false;
  } catch (error: any) {
    isConnecting = false;
    logger.error({ err: error.message }, '[Database] MongoDB connection error');

    // Retry connection after 5 seconds instead of hard-crashing container
    setTimeout(() => {
      logger.info('[Database] Retrying MongoDB connection...');
      connectDB().catch(() => {});
    }, 5000);
  }
}
