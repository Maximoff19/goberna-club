import dotenv from 'dotenv';
import { app } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

dotenv.config();

async function bootstrap() {
  // Ensure the database exists and schema is up-to-date.
  // Safe for all environments — CREATE DATABASE IF NOT EXISTS is idempotent,
  // migrations only apply pending ones, and seeding only runs in development.
  const { prepareDatabase } = await import('./bootstrap/prepare-database.js');
  await prepareDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`[goberna-api] running on ${env.APP_URL}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(async (error) => {
  console.error('[goberna-api] bootstrap failed', error);
  await prisma.$disconnect();
  process.exit(1);
});
