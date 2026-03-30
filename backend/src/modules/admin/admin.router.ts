import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { asyncHandler } from '../common/async-handler';
import { USER_ROLE, type ProfileStatus } from '../common/types';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../common/http-error';
import { validateBody } from '../../middleware/validate';
import { adminCommentSchema, updateAdminStatusSchema } from './admin.schemas';
import { recordAudit } from '../audit/audit.service';
import { emitNotification, NOTIFICATION_EVENT } from '../notifications/notifications.service';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(USER_ROLE.ADMIN));

adminRouter.get('/profiles', asyncHandler(async (_request, response) => {
  const profiles = await prisma.consultantProfile.findMany({
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    include: {
      owner: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
      reviews: true,
      adminComments: true,
    },
  });
  response.json(profiles);
}));

adminRouter.get('/profiles/:id', asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
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
  response.json(profile);
}));

adminRouter.patch('/profiles/:id/status', validateBody(updateAdminStatusSchema), asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  const nextStatus = request.body.status as ProfileStatus;
  const comment = typeof request.body.comment === 'string' ? request.body.comment : undefined;

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
      reviewerUserId: request.user!.id,
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
        adminUserId: request.user!.id,
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
  await recordAudit({ action: 'admin.profile.status.update', resourceType: 'profile', resourceId: profileId, actor: request.user! });
  response.json(updated);
}));

adminRouter.post('/profiles/:id/comment', validateBody(adminCommentSchema), asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  const message = String(request.body.message);
  const isInternal = typeof request.body.isInternal === 'boolean' ? request.body.isInternal : true;

  const comment = await prisma.adminComment.create({
    data: {
      profileId,
      adminUserId: request.user!.id,
      message,
      isInternal,
    },
  });
  await recordAudit({ action: 'admin.profile.comment', resourceType: 'profile', resourceId: profileId, actor: request.user! });
  response.status(201).json(comment);
}));

adminRouter.patch('/users/:id/block', asyncHandler(async (request, response) => {
  const userId = String(request.params.id);
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false, deactivatedAt: new Date() },
  });
  await recordAudit({ action: 'admin.user.block', resourceType: 'user', resourceId: userId, actor: request.user! });
  response.json({ success: true });
}));

adminRouter.patch('/users/:id/unblock', asyncHandler(async (request, response) => {
  const userId = String(request.params.id);
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true, deactivatedAt: null },
  });
  await recordAudit({ action: 'admin.user.unblock', resourceType: 'user', resourceId: userId, actor: request.user! });
  response.json({ success: true });
}));
