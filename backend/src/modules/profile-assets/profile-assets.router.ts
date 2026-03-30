import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../common/async-handler';
import { uploadAvatar, uploadGalleryImage, deleteAsset } from './profile-assets.service';
import { HttpError } from '../common/http-error';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new HttpError(400, 'Only image files are allowed'));
      return;
    }
    callback(null, true);
  },
});

const singleFile = upload.single('file') as unknown as RequestHandler;

export const profileAssetsRouter = Router();

profileAssetsRouter.post('/:id/avatar', requireAuth, singleFile, asyncHandler(async (request, response) => {
  if (!request.file) {
    throw new HttpError(400, 'No image file provided');
  }
  const profileId = String(request.params.id);
  const asset = await uploadAvatar(profileId, request.user!, request.file);
  response.status(201).json(asset);
}));

profileAssetsRouter.post('/:id/gallery', requireAuth, singleFile, asyncHandler(async (request, response) => {
  if (!request.file) {
    throw new HttpError(400, 'No image file provided');
  }
  const profileId = String(request.params.id);
  const asset = await uploadGalleryImage(profileId, request.user!, request.file);
  response.status(201).json(asset);
}));

profileAssetsRouter.post('/:id/certificates', requireAuth, asyncHandler(async (_request, response) => {
  response.status(501).json({ message: 'Certificate upload flow pending.' });
}));

profileAssetsRouter.delete('/:id/gallery/:assetId', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  const assetId = String(request.params.assetId);
  response.json(await deleteAsset(profileId, assetId, request.user!));
}));

profileAssetsRouter.delete('/:id/assets/:assetId', requireAuth, asyncHandler(async (request, response) => {
  const profileId = String(request.params.id);
  const assetId = String(request.params.assetId);
  response.json(await deleteAsset(profileId, assetId, request.user!));
}));
