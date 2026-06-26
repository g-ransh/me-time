import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.config'; // Reuses your Layer 2 safe environment wrapper

/**
 * Global centralized error intercepter for me-time backend channels
 */
export const errorHandler = (
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  
  // 1. Isolate technical data strictly to secure server logs
  console.error(`[SERVER ERROR] [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.error(err.stack || err.message);

  // 2. Structural Error Masking Pass
  if (env.NODE_ENV === 'production') {
    // Completely strip stack traces, query structures, and paths before client dispatch
    res.status(statusCode).json({
      status: 'error',
      message: statusCode === 500 ? 'Something went wrong.' : err.message,
    });
    return;
  }

  // 3. Fallback for Local Development Mode (Verbose details allowed)
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    stack: err.stack,
    details: err,
  });
};