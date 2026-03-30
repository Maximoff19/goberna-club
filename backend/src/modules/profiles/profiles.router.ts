import { Router } from 'express';
import { asyncHandler } from '../common/async-handler';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createProfileSchema, updateProfileSchema } from './profiles.schemas';
import { archiveProfile, createProfile, deleteProfilePermanently, getPrivateProfile, listOwnProfiles, publishProfile, submitProfileForReview, unpublishProfile, updateProfile } from './profiles.service';

export const profilesRouter = Router();

profilesRouter.get('/', requireAuth, asyncHandler(async (request, response) => {
  response.json(await listOwnProfiles(request.user!));
}));

profilesRouter.post('/', requireAuth, validateBody(createProfileSchema), asyncHandler(async (request, response) => {
  response.status(201).json(await createProfile(request.user!, request.body));
}));

profilesRouter.get('/:id', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  response.json(await getPrivateProfile(profileId, request.user!));
}));

profilesRouter.patch('/:id', requireAuth, validateBody(updateProfileSchema), asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  response.json(await updateProfile(profileId, request.user!, request.body));
}));

profilesRouter.delete('/:id', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  response.json(await archiveProfile(profileId, request.user!));
}));

profilesRouter.delete('/:id/permanent', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  response.json(await deleteProfilePermanently(profileId, request.user!));
}));

profilesRouter.post('/:id/submit-review', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  response.json(await submitProfileForReview(profileId, request.user!));
}));

profilesRouter.post('/:id/publish', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  response.json(await publishProfile(profileId, request.user!));
}));

profilesRouter.post('/:id/unpublish', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  response.json(await unpublishProfile(profileId, request.user!));
}));

profilesRouter.post('/:id/archive', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  response.json(await archiveProfile(profileId, request.user!));
}));
