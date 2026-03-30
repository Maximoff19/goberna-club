import { Router } from 'express';
import { asyncHandler } from '../common/async-handler';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { forgotPasswordSchema, loginSchema, refreshSchema, registerSchema, resetPasswordSchema } from './auth.schemas';
import { forgotPassword, loginUser, logoutUser, refreshUserSession, registerUser, resetPassword } from './auth.service';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), asyncHandler(async (request, response) => {
  response.status(201).json(await registerUser(request.body));
}));

authRouter.post('/login', validateBody(loginSchema), asyncHandler(async (request, response) => {
  response.json(await loginUser(request.body));
}));

authRouter.post('/logout', requireAuth, asyncHandler(async (request, response) => {
  response.json(await logoutUser(request.user!));
}));

authRouter.post('/refresh', validateBody(refreshSchema), asyncHandler(async (request, response) => {
  response.json(await refreshUserSession(request.body));
}));

authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(async (request, response) => {
  response.json(await forgotPassword(request.body));
}));

authRouter.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(async (request, response) => {
  response.json(await resetPassword(request.body));
}));
