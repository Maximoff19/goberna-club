import { Router } from 'express';
import { asyncHandler } from '../common/async-handler';
import { listConsultantCatalogs } from './catalogs.service';

export const catalogsRouter = Router();

catalogsRouter.get('/consultant-profile', asyncHandler(async (_request, response) => {
  response.json(await listConsultantCatalogs());
}));
