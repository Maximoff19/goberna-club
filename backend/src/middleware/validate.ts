import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export function validateBody<T>(schema: ZodType<T>) {
  return (request: Request, _response: Response, next: NextFunction) => {
    request.body = schema.parse(request.body);
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>) {
  return (request: Request, _response: Response, next: NextFunction) => {
    request.query = schema.parse(request.query) as Request['query'];
    next();
  };
}
