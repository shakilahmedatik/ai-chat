// src/middleware/error-handler.ts
import type { Request, Response, NextFunction } from 'express'
import { logger } from '../lib/logger'

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    err.message || 'Unhandled error'
  )

  const status = err.status || 500
  res.status(status).json({
    message:
      status === 500
        ? 'Internal server error'
        : err.message || 'Request failed',
  })
}
