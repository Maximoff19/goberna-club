import { prisma } from '../../lib/prisma';

export async function checkHealth() {
  await prisma.$queryRawUnsafe('SELECT 1');
  return {
    status: 'ok' as const,
    database: 'up' as const,
    timestamp: new Date().toISOString(),
  };
}
