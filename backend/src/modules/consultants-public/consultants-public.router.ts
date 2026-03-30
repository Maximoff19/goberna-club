import { Router } from 'express';
import { asyncHandler } from '../common/async-handler';
import { validateQuery } from '../../middleware/validate';
import { consultantsQuerySchema } from './consultants-public.schemas';
import { getConsultantBySlug, listConsultants } from './consultants-public.service';

export const consultantsPublicRouter = Router();

consultantsPublicRouter.get('/', validateQuery(consultantsQuerySchema), asyncHandler(async (request, response) => {
  response.json(await listConsultants(request.query as unknown as Parameters<typeof listConsultants>[0]));
}));

consultantsPublicRouter.get('/:slug', asyncHandler(async (request, response) => {
  const slug = String(request.params.slug);
  response.json(await getConsultantBySlug(slug));
}));
