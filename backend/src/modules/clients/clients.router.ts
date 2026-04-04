import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../common/async-handler';
import { createClient } from './clients.service';

const createClientSchema = z.object({
  fullName: z.string().min(1).max(191),
  email: z.string().email().max(191),
  phone: z.string().min(1).max(60),
  country: z.string().min(1).max(100),
  message: z.string().max(2000).optional(),
});

export const clientsRouter = Router();

clientsRouter.post(
  '/',
  asyncHandler(async (request, response) => {
    const data = createClientSchema.parse(request.body);
    const result = await createClient(data);
    response.status(201).json(result);
  }),
);
