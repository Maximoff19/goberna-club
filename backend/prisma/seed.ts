import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@goberna.club' },
    update: {},
    create: {
      email: 'admin@goberna.club',
      passwordHash,
      role: 'ADMIN',
      firstName: 'Goberna',
      lastName: 'Admin',
    },
  });

  const consultant = await prisma.user.upsert({
    where: { email: 'consultant@goberna.club' },
    update: {},
    create: {
      email: 'consultant@goberna.club',
      passwordHash,
      role: 'CONSULTANT',
      firstName: 'Consultor',
      lastName: 'Demo',
    },
  });

  await prisma.consultantProfile.upsert({
    where: { slug: 'consultor-demo' },
    update: {},
    create: {
      userId: consultant.id,
      slug: 'consultor-demo',
      status: 'PUBLISHED',
      professionalHeadline: 'Consultor politico y estratega electoral',
      bio: 'Perfil semilla para desarrollo local del backend.',
      country: 'Peru',
      city: 'Lima',
      modalities: 'Freelance,Consultoria',
      yearsOfExperience: 8,
      featuredFlag: true,
      publishedAt: new Date(),
      publicEmail: 'consultant@goberna.club',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      actorRole: 'ADMIN',
      action: 'seed.run',
      resourceType: 'system',
      resourceId: 'seed',
      metadataJson: { source: 'prisma/seed.ts' },
    },
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
