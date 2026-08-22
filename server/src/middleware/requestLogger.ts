import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../services/logger';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

/**
 * Structured HTTP Request Logger Middleware per TRD §11
 * Attaches X-Request-Id and logs structured JSON containing:
 * - requestId
 * - tenantId (if present in auth or params)
 * - userId (if authenticated)
 * - method & route
 * - statusCode
 * - latencyMs
 * - userAgent & client IP
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // 1. Assign or propagate Request ID
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  // 2. Mark start time
  const startTime = Date.now();
  req.startTime = startTime;

  // 3. Hook into response finish event
  res.on('finish', () => {
    const latencyMs = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Extract tenant context if available (set by auth middleware or route)
    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] || undefined;
    const userId = (req as any).user?.userId || undefined;

    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode,
      latencyMs,
      tenantId: tenantId ? String(tenantId) : undefined,
      userId: userId ? String(userId) : undefined,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    if (statusCode >= 500) {
      logger.error(logData, `HTTP ${req.method} ${req.originalUrl} -> ${statusCode} (${latencyMs}ms)`);
    } else if (statusCode >= 400) {
      logger.warn(logData, `HTTP ${req.method} ${req.originalUrl} -> ${statusCode} (${latencyMs}ms)`);
    } else {
      logger.info(logData, `HTTP ${req.method} ${req.originalUrl} -> ${statusCode} (${latencyMs}ms)`);
    }
  });

  next();
}
