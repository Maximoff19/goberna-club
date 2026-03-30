import { z } from 'zod';

export const CONSULTANT_PLAN = {
  CONSULTOR_POLITICO: 'CONSULTOR_POLITICO',
  CONSULTOR_POLITICO_SENIOR: 'CONSULTOR_POLITICO_SENIOR',
  CONSULTOR_POLITICO_MASTER: 'CONSULTOR_POLITICO_MASTER',
  CONSULTOR_POLITICO_INTERNACIONAL: 'CONSULTOR_POLITICO_INTERNACIONAL',
} as const;

export const consultantPlanSchema = z.string().refine(
  (value) => Object.values(CONSULTANT_PLAN).includes(value as (typeof CONSULTANT_PLAN)[keyof typeof CONSULTANT_PLAN]),
  'Invalid consultant plan',
);

export const registerSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  plan: consultantPlanSchema,
});

export const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(72),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

export const forgotPasswordSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(8).max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
