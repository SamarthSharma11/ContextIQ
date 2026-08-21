import mongoose from 'mongoose';
import { config } from './env';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB connected successfully to ${config.mongoUri}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    // Allow process to run in local dev without hard-crashing if mongo isn't up immediately
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
}
