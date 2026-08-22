import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Structured Error Tracking per TRD §11
  logger.error(
    {
      requestId: req.requestId,
      tenantId: (req as any).tenantId,
      userId: (req as any).user?.userId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      err: {
        message: err.message,
        name: err.name,
        stack: err.stack,
        code: err.code,
      },
    },
    `[Unhandled Error] ${req.method} ${req.originalUrl}: ${message}`
  );

  res.status(statusCode).json({
    error: message,
    requestId: req.requestId,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
