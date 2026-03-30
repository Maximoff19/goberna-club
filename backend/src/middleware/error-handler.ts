import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../modules/common/http-error';

export function errorHandler(error: unknown, request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'Validation failed',
      issues: error.issues,
      path: request.path,
    });
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      message: error.message,
      details: error.details,
      path: request.path,
    });
  }

  console.error('[goberna-api] unhandled error', error);
  return response.status(500).json({
    message: 'Internal server error',
    path: request.path,
  });
}
