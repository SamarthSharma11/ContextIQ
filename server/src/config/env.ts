import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Critical Security Validation: Enforce strong JWT_SECRET in production
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (isProduction) {
    if (!secret || secret.trim() === '') {
      throw new Error(
        '[FATAL SECURITY ERROR] JWT_SECRET environment variable is missing in production! ' +
        'Refusing to start server with an insecure fallback. Set JWT_SECRET in your production environment variables.'
      );
    }
    if (secret.length < 32) {
      throw new Error(
        '[FATAL SECURITY ERROR] JWT_SECRET must be at least 32 characters long in production for cryptographic safety.'
      );
    }
    if (
      secret === 'contextiq_jwt_super_secret_default_key_32chars' ||
      secret === 'contextiq_jwt_super_secret_change_in_production_32chars_min'
    ) {
      throw new Error(
        '[FATAL SECURITY ERROR] JWT_SECRET is set to a publicly known default key! ' +
        'Generate a unique secret (e.g., using `openssl rand -hex 32`) and set it in your production environment variables.'
      );
    }
    return secret;
  }

  // Development/Test fallback with warning
  if (!secret) {
    console.warn(
      '[SECURITY WARNING] JWT_SECRET is not set in environment. Using dev-only fallback. DO NOT USE IN PRODUCTION.'
    );
    return 'dev_only_contextiq_jwt_secret_do_not_use_in_production_32char';
  }

  return secret;
};

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/contextiq',
  jwtSecret: getJwtSecret(),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  pineconeApiKey: process.env.PINECONE_API_KEY || '',
  pineconeIndex: process.env.PINECONE_INDEX || 'contextiq',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  redisUrl: process.env.REDIS_URL || '',
};
