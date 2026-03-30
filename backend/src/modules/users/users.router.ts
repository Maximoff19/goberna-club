import { Router } from 'express';
import { asyncHandler } from '../common/async-handler';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { changeEmailSchema, changePasswordSchema, updateMeSchema } from './users.schemas';
import { changeEmail, changePassword, deactivateMe, getMe, updateMe } from './users.service';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, asyncHandler(async (request, response) => {
  response.json(await getMe(request.user!.id));
}));

usersRouter.patch('/me', requireAuth, validateBody(updateMeSchema), asyncHandler(async (request, response) => {
  response.json(await updateMe(request.user!, request.body));
}));

usersRouter.patch('/me/email', requireAuth, validateBody(changeEmailSchema), asyncHandler(async (request, response) => {
  response.json(await changeEmail(request.user!, request.body));
}));

usersRouter.patch('/me/password', requireAuth, validateBody(changePasswordSchema), asyncHandler(async (request, response) => {
  response.json(await changePassword(request.user!, request.body));
}));

usersRouter.delete('/me', requireAuth, asyncHandler(async (request, response) => {
  response.json(await deactivateMe(request.user!));
}));
