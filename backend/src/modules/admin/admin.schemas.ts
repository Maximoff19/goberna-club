import { z } from 'zod';
import { PROFILE_STATUS } from '../common/types';

export const createAdminUserSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'CONSULTANT', 'VISITOR']).default('ADMIN'),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;

export const updateAdminStatusSchema = z.object({
  status: z.enum([
    PROFILE_STATUS.DRAFT,
    PROFILE_STATUS.IN_REVIEW,
    PROFILE_STATUS.PUBLISHED,
    PROFILE_STATUS.REJECTED,
    PROFILE_STATUS.ARCHIVED,
  ]),
  comment: z.string().max(1500).optional(),
});

export const adminCommentSchema = z.object({
  message: z.string().min(1).max(1500),
  isInternal: z.boolean().optional(),
});
