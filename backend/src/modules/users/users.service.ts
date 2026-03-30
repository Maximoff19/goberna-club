import { prisma } from '../../lib/prisma';
import { hashPassword, verifyPassword } from '../../lib/password';
import { HttpError } from '../common/http-error';
import type { AuthenticatedUser } from '../common/types';
import { recordAudit } from '../audit/audit.service';
import type { z } from 'zod';
import type { changeEmailSchema, changePasswordSchema, updateMeSchema } from './users.schemas';

type UpdateMeInput = z.infer<typeof updateMeSchema>;
type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      plan: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
}

export async function updateMe(user: AuthenticatedUser, input: UpdateMeInput) {
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: input,
  });
  await recordAudit({ action: 'user.update', resourceType: 'user', resourceId: user.id, actor: user });
  return updated;
}

export async function changeEmail(user: AuthenticatedUser, input: ChangeEmailInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing && existing.id !== user.id) {
    throw new HttpError(400, 'Email already in use');
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { email: input.email },
    select: { id: true, email: true },
  });
  await recordAudit({ action: 'user.email.change', resourceType: 'user', resourceId: user.id, actor: user });
  return updated;
}

export async function changePassword(user: AuthenticatedUser, input: ChangePasswordInput) {
  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  if (!existing) {
    throw new HttpError(404, 'User not found');
  }

  const matches = await verifyPassword(input.currentPassword, existing.passwordHash);
  if (!matches) {
    throw new HttpError(400, 'Current password is invalid');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });
  await recordAudit({ action: 'user.password.change', resourceType: 'user', resourceId: user.id, actor: user });
  return { success: true };
}

export async function deactivateMe(user: AuthenticatedUser) {
  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: false, deactivatedAt: new Date() },
  });
  await recordAudit({ action: 'user.deactivate', resourceType: 'user', resourceId: user.id, actor: user });
  return { success: true };
}
