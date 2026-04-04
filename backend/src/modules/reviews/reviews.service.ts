import { prisma } from '../../lib/prisma';
import { HttpError } from '../common/http-error';

export async function listProfileReviews(profileId: string) {
  const profile = await prisma.consultantProfile.findUnique({ where: { id: profileId } });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }

  return {
    userId: profile.userId,
    reviews: await prisma.profileReview.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
    }),
  };
}
