import { z } from 'zod';
import { PROFILE_STATUS } from '../common/types';

function normalizeOptionalUrl(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(normalized)) {
    return normalized;
  }

  return `https://${normalized}`;
}

const optionalUrlSchema = z.preprocess(normalizeOptionalUrl, z.url().optional());

export const createProfileSchema = z.object({
  professionalHeadline: z.string().min(1).max(180).optional(),
});

const languageSchema = z.object({
  languageCode: z.string().min(1).max(20),
  proficiencyLevel: z.string().min(1).max(40),
});

const skillSchema = z.object({
  skillId: z.string().min(1),
  years: z.coerce.number().int().min(0).max(80).optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1).max(191),
  roleTitle: z.string().min(1).max(191),
  employmentMode: z.string().max(80).optional(),
  country: z.string().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().max(4000).optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1).max(191),
  degree: z.string().max(191).optional(),
  fieldOfStudy: z.string().max(191).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().max(4000).optional(),
});

const certificateSchema = z.object({
  title: z.string().min(1).max(191),
  issuer: z.string().max(191).optional(),
  issueDate: z.string().optional(),
  credentialUrl: optionalUrlSchema,
});

const awardSchema = z.object({
  title: z.string().min(1).max(191),
  issuer: z.string().max(191).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  description: z.string().max(1000).optional(),
});

export const updateProfileSchema = z.object({
  professionalHeadline: z.string().max(180).optional(),
  specialtyId: z.string().min(1).optional(),
  bio: z.string().max(5000).optional(),
  countryId: z.string().min(1).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  modalities: z.array(z.string().min(1)).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
  publicEmail: z.email().optional(),
  publicPhone: z.string().max(40).optional(),
  websiteUrl: optionalUrlSchema,
  facebookUrl: optionalUrlSchema,
  linkedinUrl: optionalUrlSchema,
  xUrl: optionalUrlSchema,
  instagramUrl: optionalUrlSchema,
  languages: z.array(languageSchema).optional(),
  skills: z.array(skillSchema).optional(),
  experiences: z.array(experienceSchema).optional(),
  educations: z.array(educationSchema).optional(),
  certificates: z.array(certificateSchema).optional(),
  awards: z.array(awardSchema).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    PROFILE_STATUS.DRAFT,
    PROFILE_STATUS.IN_REVIEW,
    PROFILE_STATUS.PUBLISHED,
    PROFILE_STATUS.REJECTED,
    PROFILE_STATUS.ARCHIVED,
  ]),
  comment: z.string().max(1500).optional(),
});
