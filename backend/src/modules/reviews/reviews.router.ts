import { Router } from 'express';
import { requireAuth, allowAdminOrOwner } from '../../middleware/auth';
import { asyncHandler } from '../common/async-handler';
import { listProfileReviews } from './reviews.service';

export const reviewsRouter = Router();

reviewsRouter.get('/:profileId/reviews', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.profileId);
  const { userId, reviews } = await listProfileReviews(profileId);

  allowAdminOrOwner(userId, request.user!);

  response.json(reviews);
}));
