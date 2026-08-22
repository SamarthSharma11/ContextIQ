import pino from 'pino';
import { config } from '../config/env';

/**
 * Structured logger per TRD §11
 * Emits JSON in production for log aggregation (Datadog/CloudWatch/Railway/Grafana)
 * and formatted output in development.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (config.nodeEnv === 'production' ? 'info' : 'debug'),
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport:
    config.nodeEnv !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

/**
 * Create a child logger bound with tenant context
 */
export function getTenantLogger(tenantId: string, extra: Record<string, any> = {}) {
  return logger.child({ tenantId, ...extra });
}
