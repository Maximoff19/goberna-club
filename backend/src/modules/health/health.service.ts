import { prisma } from '../../lib/prisma';

export async function checkHealth() {
  // Use Prisma's built-in method instead of raw SQL
  await prisma.$queryRaw`SELECT 1`;
  return {
    status: 'ok' as const,
    database: 'up' as const,
    timestamp: new Date().toISOString(),
  };
}
