import { z } from 'zod';
import { PROFILE_STATUS } from '../common/types';

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
