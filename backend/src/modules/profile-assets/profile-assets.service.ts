import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../common/http-error';
import { allowAdminOrOwner } from '../../middleware/auth';
import { recordAudit } from '../audit/audit.service';
import type { AuthenticatedUser } from '../common/types';

const GENERATED_DIR = path.resolve(process.cwd(), 'generated', 'profile-assets');
const PUBLIC_BASE_URL = '/generated/profile-assets';

const AVATAR_MAX_SIZE = 320;
const GALLERY_MAX_SIZE = 1600;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function generateFilename(): string {
  return crypto.randomBytes(12).toString('base64url');
}

async function ensureDirectory(): Promise<void> {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
}

async function convertToWebp(buffer: Buffer, maxSize: number): Promise<Buffer> {
  return sharp(buffer)
    .resize(maxSize, maxSize, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

function serializeAsset<T extends { sizeBytes: bigint }>(asset: T) {
  return {
    ...asset,
    sizeBytes: asset.sizeBytes.toString(),
  };
}

export async function uploadAvatar(
  profileId: string,
  user: AuthenticatedUser,
  file: Express.Multer.File,
) {
  const profile = await prisma.consultantProfile.findUnique({ where: { id: profileId } });
  if (!profile) throw new HttpError(404, 'Profile not found');
  allowAdminOrOwner(profile.userId, user);

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new HttpError(400, 'File exceeds 10 MB limit');
  }

  await ensureDirectory();
  const webpBuffer = await convertToWebp(file.buffer, AVATAR_MAX_SIZE);
  const filename = `${generateFilename()}.webp`;
  const filePath = path.join(GENERATED_DIR, filename);
  await fs.writeFile(filePath, webpBuffer);

  const publicUrl = `${PUBLIC_BASE_URL}/${filename}`;

  // Soft-delete previous avatars
  await prisma.profileMediaAsset.updateMany({
    where: { profileId, type: 'AVATAR', deletedAt: null },
    data: { deletedAt: new Date() },
  });

  const asset = await prisma.profileMediaAsset.create({
    data: {
      profileId,
      type: 'AVATAR',
      storageKey: filename,
      mimeType: 'image/webp',
      sizeBytes: webpBuffer.length,
      originalFilename: file.originalname || 'avatar.webp',
      publicUrl,
    },
  });

  // Also update user.avatarUrl for quick access
  await prisma.user.update({
    where: { id: profile.userId },
    data: { avatarUrl: publicUrl },
  });

  await recordAudit({
    action: 'profile.avatar.upload',
    resourceType: 'profile',
    resourceId: profileId,
    actor: user,
  });

  return serializeAsset(asset);
}

export async function uploadGalleryImage(
  profileId: string,
  user: AuthenticatedUser,
  file: Express.Multer.File,
) {
  const profile = await prisma.consultantProfile.findUnique({ where: { id: profileId } });
  if (!profile) throw new HttpError(404, 'Profile not found');
  allowAdminOrOwner(profile.userId, user);

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new HttpError(400, 'File exceeds 10 MB limit');
  }

  await ensureDirectory();
  const webpBuffer = await convertToWebp(file.buffer, GALLERY_MAX_SIZE);
  const filename = `${generateFilename()}.webp`;
  const filePath = path.join(GENERATED_DIR, filename);
  await fs.writeFile(filePath, webpBuffer);

  const publicUrl = `${PUBLIC_BASE_URL}/${filename}`;

  const asset = await prisma.profileMediaAsset.create({
    data: {
      profileId,
      type: 'GALLERY_IMAGE',
      storageKey: filename,
      mimeType: 'image/webp',
      sizeBytes: webpBuffer.length,
      originalFilename: file.originalname || 'gallery.webp',
      publicUrl,
    },
  });

  await recordAudit({
    action: 'profile.gallery.upload',
    resourceType: 'profile',
    resourceId: profileId,
    actor: user,
  });

  return serializeAsset(asset);
}

export async function deleteAsset(
  profileId: string,
  assetId: string,
  user: AuthenticatedUser,
) {
  const profile = await prisma.consultantProfile.findUnique({ where: { id: profileId } });
  if (!profile) throw new HttpError(404, 'Profile not found');
  allowAdminOrOwner(profile.userId, user);

  const asset = await prisma.profileMediaAsset.findUnique({ where: { id: assetId } });
  if (!asset || asset.profileId !== profileId) {
    throw new HttpError(404, 'Asset not found');
  }

  // Soft-delete in DB
  await prisma.profileMediaAsset.update({
    where: { id: assetId },
    data: { deletedAt: new Date() },
  });

  // If it was avatar, clear user.avatarUrl
  if (asset.type === 'AVATAR') {
    await prisma.user.update({
      where: { id: profile.userId },
      data: { avatarUrl: null },
    });
  }

  // Try to remove physical file (best-effort)
  try {
    const filePath = path.join(GENERATED_DIR, asset.storageKey);
    await fs.unlink(filePath);
  } catch {
    // File may already be gone, that's fine
  }

  await recordAudit({
    action: 'profile.asset.delete',
    resourceType: 'profile',
    resourceId: profileId,
    actor: user,
  });

  return { success: true, assetId };
}
