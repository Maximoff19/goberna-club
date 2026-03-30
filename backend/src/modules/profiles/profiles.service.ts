import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { createSlug, sanitizeText } from '../common/sanitize';
import { HttpError } from '../common/http-error';
import { PROFILE_STATUS, USER_ROLE, type AuthenticatedUser } from '../common/types';
import { allowAdminOrOwner } from '../../middleware/auth';
import { recordAudit } from '../audit/audit.service';
import { emitNotification, NOTIFICATION_EVENT } from '../notifications/notifications.service';
import { listConsultantCatalogs, resolveCountryId, resolveSkillRecord, resolveSpecialtyId } from '../catalogs/catalogs.service';
import type { z } from 'zod';
import type { createProfileSchema, updateProfileSchema } from './profiles.schemas';

type CreateProfileInput = z.infer<typeof createProfileSchema>;
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

function serializeAsset<T extends { sizeBytes: bigint }>(asset: T) {
  return {
    ...asset,
    sizeBytes: asset.sizeBytes.toString(),
  };
}

function serializeProfile<T extends { assets: Array<{ sizeBytes: bigint }> }>(profile: T) {
  return {
    ...profile,
    assets: profile.assets.map(serializeAsset),
  };
}

function serializeCertificate<T extends { asset: { sizeBytes: bigint } | null }>(certificate: T) {
  return {
    ...certificate,
    asset: certificate.asset ? serializeAsset(certificate.asset) : null,
  };
}

function serializeProfileWithCertificates<
  T extends { assets: Array<{ sizeBytes: bigint }>; certificates: Array<{ asset: { sizeBytes: bigint } | null }> },
>(profile: T) {
  return {
    ...serializeProfile(profile),
    certificates: profile.certificates.map(serializeCertificate),
  };
}

function hasAnyPublicContact(input: UpdateProfileInput) {
  return Boolean(
    input.publicEmail ||
      input.publicPhone ||
      input.websiteUrl ||
      input.facebookUrl ||
      input.linkedinUrl ||
      input.xUrl ||
      input.instagramUrl,
  );
}

function shouldAutoPublishProfile(
  profile: { professionalHeadline: string | null },
  input: UpdateProfileInput,
) {
  const nextHeadline = sanitizeText(input.professionalHeadline) ?? profile.professionalHeadline;
  return Boolean(nextHeadline && hasAnyPublicContact(input));
}

function assertReadyForReview(
  profile: { professionalHeadline: string | null; bio: string | null; countryId: string | null; specialtyId: string | null },
  languages: Array<{ languageCode: string }>,
  skills: Array<{ name: string }>,
) {
  const missingFields: string[] = [];

  if (!profile.professionalHeadline) missingFields.push('professionalHeadline');
  if (!profile.bio || profile.bio.length < 40) missingFields.push('bio');
  if (!profile.countryId) missingFields.push('countryId');
  if (!profile.specialtyId) missingFields.push('specialtyId');
  if (languages.length === 0) missingFields.push('languages');
  if (skills.length === 0) missingFields.push('skills');

  if (missingFields.length > 0) {
    throw new HttpError(400, 'Profile is incomplete for review', { missingFields });
  }
}

async function createUniqueSlug(source: string, currentProfileId?: string) {
  const baseSlug = createSlug(source) || 'consultor';
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.consultantProfile.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === currentProfileId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

function includeProfileRelations() {
  return {
    owner: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    },
    specialty: true,
    countryRef: true,
    experiences: true,
    educations: true,
    languages: true,
    skills: {
      include: {
        skill: true,
      },
    },
    certificates: {
      include: {
        asset: true,
      },
    },
    awards: true,
    assets: true,
    reviews: true,
    adminComments: true,
  } as const;
}

export async function listOwnProfiles(user: AuthenticatedUser) {
  const profiles = await prisma.consultantProfile.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: includeProfileRelations(),
  });

  return profiles.map(serializeProfile);
}

export async function getPrivateProfile(id: string, user: AuthenticatedUser) {
  const profile = await prisma.consultantProfile.findUnique({ where: { id }, include: includeProfileRelations() });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }

  allowAdminOrOwner(profile.userId, user);
  return serializeProfileWithCertificates(profile);
}

export async function createProfile(user: AuthenticatedUser, input: CreateProfileInput) {
  const baseHeadline = input.professionalHeadline ?? `${user.email.split('@')[0]} perfil`;
  const slug = await createUniqueSlug(baseHeadline);
  const profile = await prisma.consultantProfile.create({
    data: {
      userId: user.id,
      slug,
      professionalHeadline: sanitizeText(input.professionalHeadline),
    },
    include: includeProfileRelations(),
  });
  await recordAudit({ action: 'profile.create', resourceType: 'profile', resourceId: profile.id, actor: user });
  return serializeProfile(profile);
}

export async function updateProfile(id: string, user: AuthenticatedUser, input: UpdateProfileInput) {
  const profile = await prisma.consultantProfile.findUnique({ where: { id } });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }

  allowAdminOrOwner(profile.userId, user);

  const { countries } = await listConsultantCatalogs();
  const resolvedCountryId = input.countryId ?? await resolveCountryId(input.country ?? profile.country);
  const resolvedSpecialtyId = input.specialtyId ?? await resolveSpecialtyId(input.professionalHeadline ?? profile.professionalHeadline);
  const resolvedCountry = countries.find((country) => country.id === resolvedCountryId);
  const resolvedSkills = input.skills
    ? await Promise.all(
        input.skills.map(async (skill) => {
          const skillId = skill.skillId;
          const skillRecord = skillId ? await resolveSkillRecord(skillId) : null;
          if (!skillId || !skillRecord) {
            throw new HttpError(400, 'Invalid skill selection');
          }

          return {
            skillId,
            name: skillRecord.name,
            years: skill.years,
          };
        }),
      )
    : undefined;

  const updateData = {
    professionalHeadline: sanitizeText(input.professionalHeadline),
    specialtyId: resolvedSpecialtyId,
    bio: sanitizeText(input.bio),
    countryId: resolvedCountryId,
    country: resolvedCountry?.name ?? input.country,
    city: input.city,
    modalities: input.modalities?.join(','),
    yearsOfExperience: input.yearsOfExperience,
    publicEmail: input.publicEmail,
    publicPhone: input.publicPhone,
    websiteUrl: input.websiteUrl,
    facebookUrl: input.facebookUrl,
    linkedinUrl: input.linkedinUrl,
    xUrl: input.xUrl,
    instagramUrl: input.instagramUrl,
    status: shouldAutoPublishProfile(profile, input) ? PROFILE_STATUS.PUBLISHED : undefined,
    publishedAt: shouldAutoPublishProfile(profile, input)
      ? profile.publishedAt ?? new Date()
      : undefined,
    slug: undefined as string | undefined,
  };

  if (input.professionalHeadline && input.professionalHeadline !== profile.professionalHeadline) {
    updateData.slug = await createUniqueSlug(input.professionalHeadline, profile.id);
  }

  await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    await transaction.consultantProfile.update({ where: { id }, data: updateData });

    if (input.languages) {
      await transaction.profileLanguage.deleteMany({ where: { profileId: id } });
      if (input.languages.length > 0) {
        await transaction.profileLanguage.createMany({
          data: input.languages.map((language) => ({
            profileId: id,
            languageCode: language.languageCode,
            proficiencyLevel: language.proficiencyLevel,
          })),
        });
      }
    }

    if (input.skills) {
      await transaction.profileSkill.deleteMany({ where: { profileId: id } });
      if (resolvedSkills && resolvedSkills.length > 0) {
        await transaction.profileSkill.createMany({
          data: resolvedSkills.map((skill) => ({
            profileId: id,
            skillId: skill.skillId,
            name: skill.name,
            years: skill.years,
          })),
        });
      }
    }

    if (input.experiences) {
      await transaction.profileExperience.deleteMany({ where: { profileId: id } });
      if (input.experiences.length > 0) {
        await transaction.profileExperience.createMany({
          data: input.experiences.map((experience, index) => ({
            profileId: id,
            company: experience.company,
            roleTitle: experience.roleTitle,
            employmentMode: experience.employmentMode,
            country: experience.country,
            startDate: experience.startDate ? new Date(experience.startDate) : null,
            endDate: experience.endDate ? new Date(experience.endDate) : null,
            isCurrent: experience.isCurrent ?? false,
            description: experience.description,
            orderIndex: index,
          })),
        });
      }
    }

    if (input.educations) {
      await transaction.profileEducation.deleteMany({ where: { profileId: id } });
      if (input.educations.length > 0) {
        await transaction.profileEducation.createMany({
          data: input.educations.map((education, index) => ({
            profileId: id,
            institution: education.institution,
            degree: education.degree,
            fieldOfStudy: education.fieldOfStudy,
            startDate: education.startDate ? new Date(education.startDate) : null,
            endDate: education.endDate ? new Date(education.endDate) : null,
            description: education.description,
            orderIndex: index,
          })),
        });
      }
    }

    if (input.certificates) {
      await transaction.profileCertificate.deleteMany({ where: { profileId: id } });
      if (input.certificates.length > 0) {
        await transaction.profileCertificate.createMany({
          data: input.certificates.map((certificate) => ({
            profileId: id,
            title: certificate.title,
            issuer: certificate.issuer,
            issueDate: certificate.issueDate ? new Date(certificate.issueDate) : null,
            credentialUrl: certificate.credentialUrl,
          })),
        });
      }
    }

    if (input.awards) {
      await transaction.profileAward.deleteMany({ where: { profileId: id } });
      if (input.awards.length > 0) {
        await transaction.profileAward.createMany({
          data: input.awards.map((award) => ({
            profileId: id,
            title: award.title,
            issuer: award.issuer,
            year: award.year,
            description: award.description,
          })),
        });
      }
    }
  });

  await recordAudit({ action: 'profile.update', resourceType: 'profile', resourceId: id, actor: user });
  return getPrivateProfile(id, user);
}

export async function archiveProfile(id: string, user: AuthenticatedUser) {
  const profile = await prisma.consultantProfile.findUnique({ where: { id } });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }
  allowAdminOrOwner(profile.userId, user);
  await prisma.consultantProfile.update({
    where: { id },
    data: { status: PROFILE_STATUS.ARCHIVED, archivedAt: new Date() },
  });
  await recordAudit({ action: 'profile.archive', resourceType: 'profile', resourceId: id, actor: user });
  return { success: true };
}

export async function deleteProfilePermanently(id: string, actor: AuthenticatedUser) {
  if (actor.role !== USER_ROLE.ADMIN) {
    throw new HttpError(403, 'Only admins can permanently delete profiles');
  }

  const profile = await prisma.consultantProfile.findUnique({ where: { id } });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }

  await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    await transaction.profileReview.deleteMany({ where: { profileId: id } });
    await transaction.adminComment.deleteMany({ where: { profileId: id } });
    await transaction.profileCertificate.deleteMany({ where: { profileId: id } });
    await transaction.profileMediaAsset.deleteMany({ where: { profileId: id } });
    await transaction.profileAward.deleteMany({ where: { profileId: id } });
    await transaction.profileExperience.deleteMany({ where: { profileId: id } });
    await transaction.profileEducation.deleteMany({ where: { profileId: id } });
    await transaction.profileLanguage.deleteMany({ where: { profileId: id } });
    await transaction.profileSkill.deleteMany({ where: { profileId: id } });
    await transaction.consultantProfile.delete({ where: { id } });
  });

  await recordAudit({ action: 'profile.delete_permanent', resourceType: 'profile', resourceId: id, actor });
  return { success: true, deleted: true, profileId: id };
}

export async function submitProfileForReview(id: string, user: AuthenticatedUser) {
  const profile = await prisma.consultantProfile.findUnique({
    where: { id },
    include: { languages: true, skills: true },
  });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }
  allowAdminOrOwner(profile.userId, user);
  if (profile.status !== PROFILE_STATUS.DRAFT && profile.status !== PROFILE_STATUS.REJECTED) {
    throw new HttpError(400, 'Profile cannot be sent to review from current status');
  }
  assertReadyForReview(profile, profile.languages, profile.skills);

  await prisma.$transaction([
    prisma.consultantProfile.update({
      where: { id },
      data: { status: PROFILE_STATUS.IN_REVIEW, submittedForReviewAt: new Date() },
    }),
    prisma.profileReview.create({
      data: {
        profileId: id,
        fromStatus: profile.status,
        toStatus: PROFILE_STATUS.IN_REVIEW,
        decision: 'SUBMITTED',
      },
    }),
  ]);

  const owner = await prisma.user.findUnique({ where: { id: profile.userId } });
  if (owner) {
    await emitNotification(NOTIFICATION_EVENT.PROFILE_SUBMITTED, owner.email, { profileId: id });
  }
  await recordAudit({ action: 'profile.submit_review', resourceType: 'profile', resourceId: id, actor: user });
  return getPrivateProfile(id, user);
}

export async function publishProfile(id: string, actor: AuthenticatedUser) {
  if (actor.role !== USER_ROLE.ADMIN) {
    throw new HttpError(403, 'Only admins can publish profiles');
  }
  const profile = await prisma.consultantProfile.findUnique({ where: { id }, include: { owner: true } });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }
  if (profile.status !== PROFILE_STATUS.IN_REVIEW) {
    throw new HttpError(400, 'Profile must be in review to publish');
  }

  await prisma.$transaction([
    prisma.consultantProfile.update({
      where: { id },
      data: { status: PROFILE_STATUS.PUBLISHED, publishedAt: new Date(), lastReviewedAt: new Date() },
    }),
    prisma.profileReview.create({
      data: {
        profileId: id,
        reviewerUserId: actor.id,
        fromStatus: profile.status,
        toStatus: PROFILE_STATUS.PUBLISHED,
        decision: 'APPROVED',
      },
    }),
  ]);
  await emitNotification(NOTIFICATION_EVENT.PROFILE_APPROVED, profile.owner.email, { profileId: id });
  await recordAudit({ action: 'profile.publish', resourceType: 'profile', resourceId: id, actor });
  return getPrivateProfile(id, actor);
}

export async function unpublishProfile(id: string, actor: AuthenticatedUser) {
  const profile = await prisma.consultantProfile.findUnique({ where: { id } });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }
  allowAdminOrOwner(profile.userId, actor);
  await prisma.$transaction([
    prisma.consultantProfile.update({
      where: { id },
      data: { status: PROFILE_STATUS.DRAFT, publishedAt: null },
    }),
    prisma.profileReview.create({
      data: {
        profileId: id,
        reviewerUserId: actor.role === USER_ROLE.ADMIN ? actor.id : null,
        fromStatus: profile.status,
        toStatus: PROFILE_STATUS.DRAFT,
        decision: 'UNPUBLISHED',
      },
    }),
  ]);
  await recordAudit({ action: 'profile.unpublish', resourceType: 'profile', resourceId: id, actor });
  return getPrivateProfile(id, actor);
}
