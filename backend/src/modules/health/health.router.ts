import { Router } from 'express';
import { asyncHandler } from '../common/async-handler';
import { checkHealth } from './health.service';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_request, response) => {
    const result = await checkHealth();
    response.json(result);
  }),
);
