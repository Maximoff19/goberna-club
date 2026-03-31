// Integration endpoints for external systems (WordPress, etc.)
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../common/async-handler';
import { requireApiKey } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/password';
import { HttpError } from '../common/http-error';

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
  const { email, password, firstName, lastName, role } = request.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, 'Email already in use');
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      role,
      plan: null,
    },
  });

  response.status(201).json({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
}));
