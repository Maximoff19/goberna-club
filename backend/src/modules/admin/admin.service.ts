import { prisma } from '../../lib/prisma';
import { HttpError } from '../common/http-error';
import { hashPassword } from '../../lib/password';
import type { ProfileStatus, AuthenticatedUser } from '../common/types';
import { recordAudit } from '../audit/audit.service';
import { emitNotification, NOTIFICATION_EVENT } from '../notifications/notifications.service';
import type { CreateAdminUserInput } from './admin.schemas';

export async function listProfiles() {
  return prisma.consultantProfile.findMany({
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    include: {
      owner: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
      reviews: true,
      adminComments: true,
    },
  });
}

export async function getProfileById(profileId: string) {
  const profile = await prisma.consultantProfile.findUnique({
    where: { id: profileId },
    include: {
      owner: true,
      experiences: true,
      educations: true,
      languages: true,
      skills: true,
      certificates: true,
      awards: true,
      assets: true,
      reviews: true,
      adminComments: true,
    },
  });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }
  return profile;
}

export async function updateProfileStatus(
  profileId: string,
  nextStatus: ProfileStatus,
  comment: string | undefined,
  actor: AuthenticatedUser,
) {
  const profile = await prisma.consultantProfile.findUnique({
    where: { id: profileId },
    include: { owner: true },
  });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }

  const updated = await prisma.consultantProfile.update({
    where: { id: profileId },
    data: {
      status: nextStatus,
      lastReviewedAt: new Date(),
      publishedAt: nextStatus === 'PUBLISHED' ? new Date() : profile.publishedAt,
      archivedAt: nextStatus === 'ARCHIVED' ? new Date() : profile.archivedAt,
    },
  });

  await prisma.profileReview.create({
    data: {
      profileId,
      reviewerUserId: actor.id,
      fromStatus: profile.status,
      toStatus: nextStatus,
      decision: nextStatus === 'PUBLISHED' ? 'APPROVED' : nextStatus === 'REJECTED' ? 'REJECTED' : 'CHANGES_REQUESTED',
      comment,
    },
  });

  if (comment) {
    await prisma.adminComment.create({
      data: {
        profileId,
        adminUserId: actor.id,
        message: comment,
        isInternal: false,
      },
    });
  }

  const notificationEvent = nextStatus === 'PUBLISHED'
    ? NOTIFICATION_EVENT.PROFILE_APPROVED
    : nextStatus === 'REJECTED'
      ? NOTIFICATION_EVENT.PROFILE_REJECTED
      : NOTIFICATION_EVENT.PROFILE_CHANGES_REQUESTED;
  await emitNotification(notificationEvent, profile.owner.email, { profileId, status: nextStatus });
  await recordAudit({ action: 'admin.profile.status.update', resourceType: 'profile', resourceId: profileId, actor });

  return updated;
}

export async function addProfileComment(
  profileId: string,
  message: string,
  isInternal: boolean,
  actor: AuthenticatedUser,
) {
  const comment = await prisma.adminComment.create({
    data: {
      profileId,
      adminUserId: actor.id,
      message,
      isInternal,
    },
  });
  await recordAudit({ action: 'admin.profile.comment', resourceType: 'profile', resourceId: profileId, actor });
  return comment;
}

export async function createUser(input: CreateAdminUserInput, actor: AuthenticatedUser) {
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
      role: input.role,
      plan: null,
    },
  });

  await recordAudit({ action: 'admin.user.create', resourceType: 'user', resourceId: user.id, actor });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function blockUser(userId: string, actor: AuthenticatedUser) {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false, deactivatedAt: new Date() },
  });
  await recordAudit({ action: 'admin.user.block', resourceType: 'user', resourceId: userId, actor });
}

export async function unblockUser(userId: string, actor: AuthenticatedUser) {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true, deactivatedAt: null },
  });
  await recordAudit({ action: 'admin.user.unblock', resourceType: 'user', resourceId: userId, actor });
}
