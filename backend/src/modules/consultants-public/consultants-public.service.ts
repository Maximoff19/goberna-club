import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { PROFILE_STATUS } from '../common/types';
import type { z } from 'zod';
import type { consultantsQuerySchema } from './consultants-public.schemas';
import { HttpError } from '../common/http-error';

type ConsultantsQuery = z.infer<typeof consultantsQuerySchema>;

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

export async function listConsultants(query: ConsultantsQuery) {
  const where: Prisma.ConsultantProfileWhereInput = {
    status: PROFILE_STATUS.PUBLISHED,
    archivedAt: null,
  };
  const andFilters: Prisma.ConsultantProfileWhereInput[] = [];

  if (query.q) {
    andFilters.push({
      OR: [
      { professionalHeadline: { contains: query.q } },
      { bio: { contains: query.q } },
      ],
    });
  }

  if (query.countries.length > 0) {
    andFilters.push({
      OR: query.countries.flatMap((country) => ([
        { countryRef: { slug: country } },
        { countryRef: { code: country.toUpperCase() } },
        { countryRef: { name: { contains: country } } },
        { country: { contains: country } },
      ])),
    });
  }

  if (query.modality) {
    where.modalities = { contains: query.modality };
  }

  if (query.minExperience !== undefined) {
    where.yearsOfExperience = { gte: query.minExperience };
  }

  if (query.featured === 'true') {
    where.featuredFlag = true;
  }

  if (query.languages.length > 0) {
    andFilters.push({
      languages: {
        some: {
          OR: query.languages.map((language) => ({ languageCode: { contains: language } })),
        },
      },
    });
  }

  if (query.specialties.length > 0) {
    andFilters.push({
      OR: query.specialties.flatMap((specialty) => ([
        { specialty: { slug: specialty } },
        { specialty: { name: { contains: specialty } } },
        { professionalHeadline: { contains: specialty } },
      ])),
    });
  }

  if (query.skills.length > 0) {
    andFilters.push({
      skills: {
        some: {
          OR: query.skills.flatMap((skill) => ([
            { name: { contains: skill } },
            { skill: { name: { contains: skill } } },
            { skill: { slug: skill } },
          ])),
        },
      },
    });
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const orderBy: Prisma.ConsultantProfileOrderByWithRelationInput = query.sort === 'experience'
    ? { yearsOfExperience: 'desc' }
    : query.sort === 'publishedAt'
      ? { publishedAt: 'desc' }
      : { featuredFlag: 'desc' };

  const [items, total] = await prisma.$transaction([
    prisma.consultantProfile.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy,
        include: {
          owner: {
            select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
          },
          specialty: true,
          countryRef: true,
          languages: true,
          skills: {
            include: {
              skill: true,
            },
          },
          assets: true,
        },
    }),
    prisma.consultantProfile.count({ where }),
  ]);

  return {
    items: items.map(serializeProfile),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
      hasMore: query.page * query.limit < total,
    },
    filters: query,
  };
}

export async function getConsultantBySlug(slug: string) {
  const consultant = await prisma.consultantProfile.findFirst({
    where: {
      slug,
      status: PROFILE_STATUS.PUBLISHED,
      archivedAt: null,
    },
    include: {
      owner: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
          email: true,
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
    },
  });

  if (!consultant) {
    throw new HttpError(404, 'Consultant not found');
  }

  return serializeProfileWithCertificates(consultant);
}
