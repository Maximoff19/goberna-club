import { z } from 'zod';

export const updateMeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().max(400000).optional(),
});

export const changeEmailSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(72),
  newPassword: z.string().min(8).max(72),
});
