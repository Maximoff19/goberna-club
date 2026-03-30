import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '../modules/common/types';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

const accessOptions: SignOptions = {
  expiresIn: env.JWT_ACCESS_TTL as SignOptions['expiresIn'],
};

const refreshOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_TTL as SignOptions['expiresIn'],
};

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOptions);
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
