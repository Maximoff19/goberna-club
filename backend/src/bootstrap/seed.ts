import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { ensureCatalogsSeeded, resolveCountryId, resolveSkillIdByName, resolveSpecialtyId } from '../modules/catalogs/catalogs.service';

export async function seedDevelopmentData() {
  await ensureCatalogsSeeded();

  const adminPasswordHash = await bcrypt.hash(env.DEMO_ADMIN_PASSWORD, 12);
  const consultantPasswordHash = await bcrypt.hash(env.DEMO_CONSULTANT_PASSWORD, 12);
  const countryId = await resolveCountryId('Peru');
  const specialtyId = await resolveSpecialtyId('Consultoria Politica');

  const admin = await prisma.user.upsert({
    where: { email: env.DEMO_ADMIN_EMAIL },
    update: {},
    create: {
      email: env.DEMO_ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      plan: null,
      firstName: 'Goberna',
      lastName: 'Admin',
    },
  });

  const consultant = await prisma.user.upsert({
    where: { email: env.DEMO_CONSULTANT_EMAIL },
    update: {},
    create: {
      email: env.DEMO_CONSULTANT_EMAIL,
      passwordHash: consultantPasswordHash,
      role: 'CONSULTANT',
      plan: 'CONSULTOR_POLITICO',
      firstName: 'Consultor',
      lastName: 'Demo',
    },
  });

  const profile = await prisma.consultantProfile.upsert({
    where: { slug: 'consultor-demo' },
    update: {},
    create: {
      userId: consultant.id,
      slug: 'consultor-demo',
      status: 'PUBLISHED',
      professionalHeadline: 'Consultor politico y estratega electoral',
      specialtyId,
      bio: 'Perfil semilla para integrar el frontend con el backend real de Goberna Club.',
      countryId,
      country: 'Peru',
      city: 'Lima',
      modalities: 'Consultoria,Freelance',
      yearsOfExperience: 8,
      publicEmail: env.DEMO_CONSULTANT_EMAIL,
      featuredFlag: true,
      publishedAt: new Date(),
      submittedForReviewAt: new Date(),
      lastReviewedAt: new Date(),
    },
  });

  await prisma.profileLanguage.deleteMany({ where: { profileId: profile.id } });
  await prisma.profileSkill.deleteMany({ where: { profileId: profile.id } });

  await prisma.profileLanguage.createMany({
    data: [
      { profileId: profile.id, languageCode: 'espanol', proficiencyLevel: 'nativo' },
      { profileId: profile.id, languageCode: 'ingles', proficiencyLevel: 'profesional' },
    ],
  });

  await prisma.profileSkill.createMany({
    data: [
      { profileId: profile.id, name: 'Estrategia Electoral', skillId: await resolveSkillIdByName('Estrategia Electoral') },
      { profileId: profile.id, name: 'War Room', skillId: await resolveSkillIdByName('War Room') },
      { profileId: profile.id, name: 'Narrativa Politica', skillId: await resolveSkillIdByName('Narrativa politica') },
    ],
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      actorRole: 'ADMIN',
      action: 'bootstrap.seed',
      resourceType: 'system',
      resourceId: 'seed',
      metadataJson: { source: 'bootstrap.seed' },
    },
  });
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDevelopmentData()
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
