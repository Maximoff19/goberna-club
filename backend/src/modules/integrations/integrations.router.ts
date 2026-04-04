// Integration endpoints for external systems (WordPress, etc.) — v2
// Kept minimal on purpose so external clients can create users safely via API key.
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../common/async-handler';
import { requireApiKey } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createIntegrationUser } from './integrations.service';

export const integrationsRouter = Router();

integrationsRouter.use(requireApiKey);

const createUserSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'CONSULTANT', 'VISITOR']).default('CONSULTANT'),
});

integrationsRouter.post('/users', validateBody(createUserSchema), asyncHandler(async (request, response) => {
  const user = await createIntegrationUser(request.body);
  response.status(201).json(user);
}));
