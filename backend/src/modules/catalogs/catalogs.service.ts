import { prisma } from '../../lib/prisma';
import { createSlug, sanitizeText } from '../common/sanitize';
import { COUNTRY_CATALOG, SKILL_CATALOG, SPECIALTY_CATALOG } from './catalogs.data';

const COUNTRY_ALIAS = {
  estadosunidos: 'US',
  eeuu: 'US',
  usa: 'US',
  unitedstates: 'US',
  republicadominicana: 'DO',
  dominicanrepublic: 'DO',
  espana: 'ES',
  méxico: 'MX',
  mexico: 'MX',
} as const;

const SPECIALTY_KEYWORD = {
  CONSULTORIA_POLITICA: ['consultor', 'consultoria', 'consultoría'],
  ESTRATEGIA_POLITICA_ELECTORAL: ['electoral', 'campana', 'campaña'],
  ESTRATEGIA_POLITICA_PARLAMENTARIA: ['parlament'],
  ESTRATEGIA_POLITICA_GUBERNAMENTAL: ['gubernamental', 'gobierno'],
  MARKETING_POLITICO: ['marketing'],
  COMUNICACION_POLITICA: ['comunicacion', 'comunicación'],
  COMUNICACION_DE_CRISIS: ['crisis'],
  OPINION_PUBLICA: ['opinion publica', 'opinión pública'],
  TECNOPOLITICA: ['tecnopolit', 'ciber'],
  WAR_ROOM: ['war room'],
  TERRITORIAL: ['territorial'],
  ORATORIA_POLITICA: ['oratoria'],
  INTELIGENCIA_Y_CONTRAINTELIGENCIA: ['inteligencia', 'contrainteligencia'],
  OPERACIONES_PSICOLOGICAS_Y_PSICOSOCIALES: ['psicologica', 'psicosocial'],
  IMAGEN_PUBLICA: ['imagen'],
} as const;

function normalizeKey(value: string | undefined | null) {
  return createSlug(sanitizeText(value) || '').replace(/-/g, '');
}

function specialtyCode(name: string) {
  return createSlug(name).replace(/-/g, '_').toUpperCase();
}

export async function ensureCatalogsSeeded() {
  await prisma.$transaction([
    ...COUNTRY_CATALOG.map((country) =>
      prisma.country.upsert({
        where: { code: country.code },
        update: { name: country.name, slug: createSlug(country.name), isActive: true },
        create: { code: country.code, name: country.name, slug: createSlug(country.name) },
      }),
    ),
    ...SPECIALTY_CATALOG.map((name) =>
      prisma.specialty.upsert({
        where: { slug: createSlug(name) },
        update: { name, isActive: true },
        create: { name, slug: createSlug(name) },
      }),
    ),
    ...SKILL_CATALOG.map((name) =>
      prisma.skill.upsert({
        where: { slug: createSlug(name) },
        update: { name, isActive: true },
        create: { name, slug: createSlug(name) },
      }),
    ),
  ]);
}

export async function listConsultantCatalogs() {
  await ensureCatalogsSeeded();

  const [countries, skills, specialties] = await prisma.$transaction([
    prisma.country.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.skill.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.specialty.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return { countries, skills, specialties };
}

export async function resolveCountryId(value: string | undefined | null) {
  await ensureCatalogsSeeded();

  const key = normalizeKey(value);
  if (!key) {
    return undefined;
  }

  const byAliasCode = COUNTRY_ALIAS[key as keyof typeof COUNTRY_ALIAS];
  if (byAliasCode) {
    const country = await prisma.country.findUnique({ where: { code: byAliasCode } });
    return country?.id;
  }

  const country = await prisma.country.findFirst({
    where: {
      OR: [{ slug: createSlug(value || '') }, { name: sanitizeText(value) || '' }],
    },
  });

  return country?.id;
}

export async function resolveSpecialtyId(value: string | undefined | null) {
  await ensureCatalogsSeeded();

  const normalizedValue = sanitizeText(value)?.toLowerCase();
  if (!normalizedValue) {
    return undefined;
  }

  const exactMatch = await prisma.specialty.findFirst({
    where: {
      OR: [{ slug: createSlug(normalizedValue) }, { name: sanitizeText(value) || '' }],
    },
  });
  if (exactMatch) {
    return exactMatch.id;
  }

  const matchedCode = Object.entries(SPECIALTY_KEYWORD).find(([, keywords]) =>
    keywords.some((keyword) => normalizedValue.includes(keyword)),
  )?.[0];

  if (!matchedCode) {
    const fallback = await prisma.specialty.findUnique({ where: { slug: createSlug('Consultoria Politica') } });
    return fallback?.id;
  }

  const specialty = await prisma.specialty.findUnique({ where: { slug: createSlug(matchedCode.replace(/_/g, ' ')) } });
  if (specialty) {
    return specialty.id;
  }

  const byName = await prisma.specialty.findFirst({
    where: { slug: createSlug(SPECIALTY_CATALOG.find((item) => specialtyCode(item) === matchedCode) || 'Consultoria Politica') },
  });
  return byName?.id;
}

export async function resolveSkillRecord(skillId: string | undefined | null) {
  await ensureCatalogsSeeded();

  if (!skillId) {
    return null;
  }

  return prisma.skill.findUnique({ where: { id: skillId } });
}

export async function resolveSkillIdByName(name: string | undefined | null) {
  await ensureCatalogsSeeded();

  const normalizedName = sanitizeText(name);
  if (!normalizedName) {
    return undefined;
  }

  const existing = await prisma.skill.findFirst({
    where: {
      OR: [{ slug: createSlug(normalizedName) }, { name: normalizedName }],
    },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.skill.create({
    data: {
      name: normalizedName.slice(0, 120),
      slug: createSlug(normalizedName).slice(0, 120),
    },
  });

  return created.id;
}
