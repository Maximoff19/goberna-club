import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../../lib/prisma';
import { hashPassword, verifyPassword } from '../../lib/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { HttpError } from '../common/http-error';
import type { AuthenticatedUser } from '../common/types';
import { emitNotification, NOTIFICATION_EVENT } from '../notifications/notifications.service';
import { recordAudit } from '../audit/audit.service';
import type { ForgotPasswordInput, LoginInput, RefreshInput, RegisterInput, ResetPasswordInput } from './auth.schemas';

function hashToken(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function buildSession(user: AuthenticatedUser) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role });
  return { accessToken, refreshToken };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(400, 'Email already in use');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      plan: input.plan,
      role: 'CONSULTANT',
    },
  });

  const actor = { id: user.id, email: user.email, role: user.role } as AuthenticatedUser;
  const tokens = buildSession(actor);
  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });
  await emitNotification(NOTIFICATION_EVENT.WELCOME, user.email, { firstName: user.firstName });
  await recordAudit({ action: 'auth.register', resourceType: 'user', resourceId: user.id, actor });

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const matches = await verifyPassword(input.password, user.passwordHash);
  if (!matches) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const actor = { id: user.id, email: user.email, role: user.role } as AuthenticatedUser;
  const tokens = buildSession(actor);
  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await recordAudit({ action: 'auth.login', resourceType: 'user', resourceId: user.id, actor });

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
}

export async function logoutUser(user: AuthenticatedUser) {
  await prisma.refreshSession.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await recordAudit({ action: 'auth.logout', resourceType: 'user', resourceId: user.id, actor: user });
  return { success: true };
}

export async function refreshUserSession(input: RefreshInput) {
  const payload = verifyRefreshToken(input.refreshToken);
  const session = await prisma.refreshSession.findFirst({
    where: {
      userId: payload.sub,
      tokenHash: hashToken(input.refreshToken),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session || !session.user.isActive) {
    throw new HttpError(401, 'Refresh session is invalid');
  }

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  const actor = { id: session.user.id, email: session.user.email, role: session.user.role } as AuthenticatedUser;
  const tokens = buildSession(actor);
  await prisma.refreshSession.create({
    data: {
      userId: actor.id,
      tokenHash: hashToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  return {
    ...tokens,
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      plan: session.user.plan,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
    },
  };
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    return { success: true };
  }

  const rawToken = randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });
  await emitNotification(NOTIFICATION_EVENT.PASSWORD_RESET, user.email, { resetToken: rawToken });
  return { success: true };
}

export async function resetPassword(input: ResetPasswordInput) {
  const token = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: hashToken(input.token),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!token) {
    throw new HttpError(404, 'Reset token not found or expired');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash: await hashPassword(input.newPassword) },
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshSession.updateMany({
      where: { userId: token.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  const actor = { id: token.user.id, email: token.user.email, role: token.user.role } as AuthenticatedUser;
  await recordAudit({ action: 'auth.password.reset', resourceType: 'user', resourceId: token.userId, actor });
  return { success: true };
}
