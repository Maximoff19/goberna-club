import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../common/async-handler';

export const profileAssetsRouter = Router();

profileAssetsRouter.post('/:id/avatar', requireAuth, asyncHandler(async (_request, response) => {
  response.status(501).json({ message: 'Avatar upload flow pending real S3 integration.' });
}));

profileAssetsRouter.post('/:id/gallery', requireAuth, asyncHandler(async (_request, response) => {
  response.status(501).json({ message: 'Gallery upload flow pending real S3 integration.' });
}));

profileAssetsRouter.post('/:id/certificates', requireAuth, asyncHandler(async (_request, response) => {
  response.status(501).json({ message: 'Certificate upload flow pending real S3 integration.' });
}));

profileAssetsRouter.delete('/:id/gallery/:assetId', requireAuth, asyncHandler(async (_request, response) => {
  response.status(501).json({ message: 'Gallery asset deletion pending real S3 integration.' });
}));

profileAssetsRouter.delete('/:id/assets/:assetId', requireAuth, asyncHandler(async (_request, response) => {
  response.status(501).json({ message: 'Asset deletion pending real S3 integration.' });
}));
