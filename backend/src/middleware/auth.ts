import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { env } from '../config/env';
import { HttpError } from '../modules/common/http-error';
import { USER_ROLE, type AuthenticatedUser, type UserRole } from '../modules/common/types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authentication required');
  }

  const token = authorization.replace('Bearer ', '');
  const payload = verifyAccessToken(token);
  request.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      throw new HttpError(401, 'Authentication required');
    }

    if (!roles.includes(request.user.role)) {
      throw new HttpError(403, 'Forbidden');
    }

    next();
  };
}

export function allowAdminOrOwner(ownerId: string | null | undefined, user: AuthenticatedUser) {
  if (user.role === USER_ROLE.ADMIN) {
    return;
  }

  if (!ownerId || ownerId != user.id) {
    throw new HttpError(403, 'Forbidden');
  }
}

export function requireApiKey(request: Request, _response: Response, next: NextFunction) {
  const apiKey = request.header('x-api-key');
  if (!apiKey || apiKey !== env.INTEGRATION_API_KEY) {
    throw new HttpError(401, 'Invalid or missing API key');
  }

  next();
}
