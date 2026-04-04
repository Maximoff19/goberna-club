import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { asyncHandler } from '../common/async-handler';
import { USER_ROLE, type ProfileStatus } from '../common/types';
import { validateBody } from '../../middleware/validate';
import { adminCommentSchema, createAdminUserSchema, updateAdminStatusSchema } from './admin.schemas';
import {
  listProfiles,
  getProfileById,
  updateProfileStatus,
  addProfileComment,
  createUser,
  blockUser,
  unblockUser,
} from './admin.service';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(USER_ROLE.ADMIN));

adminRouter.get('/profiles', asyncHandler(async (_request, response) => {
  const profiles = await listProfiles();
  response.json(profiles);
}));

adminRouter.get('/profiles/:id', asyncHandler(async (request, response) => {
  const profile = await getProfileById(String(request.params.id));
  response.json(profile);
}));

adminRouter.patch('/profiles/:id/status', validateBody(updateAdminStatusSchema), asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  const nextStatus = request.body.status as ProfileStatus;
  const comment = typeof request.body.comment === 'string' ? request.body.comment : undefined;

  const updated = await updateProfileStatus(profileId, nextStatus, comment, request.user!);
  response.json(updated);
}));

adminRouter.post('/profiles/:id/comment', validateBody(adminCommentSchema), asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  const message = String(request.body.message);
  const isInternal = typeof request.body.isInternal === 'boolean' ? request.body.isInternal : true;

  const created = await addProfileComment(profileId, message, isInternal, request.user!);
  response.status(201).json(created);
}));

adminRouter.post('/users', validateBody(createAdminUserSchema), asyncHandler(async (request, response) => {
  const user = await createUser(request.body, request.user!);
  response.status(201).json(user);
}));

adminRouter.patch('/users/:id/block', asyncHandler(async (request, response) => {
  await blockUser(String(request.params.id), request.user!);
  response.json({ success: true });
}));

adminRouter.patch('/users/:id/unblock', asyncHandler(async (request, response) => {
  await unblockUser(String(request.params.id), request.user!);
  response.json({ success: true });
}));
