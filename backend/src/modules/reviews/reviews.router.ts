import { Router } from 'express';
import { requireAuth, allowAdminOrOwner } from '../../middleware/auth';
import { asyncHandler } from '../common/async-handler';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../common/http-error';

export const reviewsRouter = Router();

reviewsRouter.get('/:profileId/reviews', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.profileId);
  const profile = await prisma.consultantProfile.findUnique({ where: { id: profileId } });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }

  allowAdminOrOwner(profile.userId, request.user!);

  const reviews = await prisma.profileReview.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
  });

  response.json(reviews);
}));
