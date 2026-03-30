import dotenv from 'dotenv';
import { app } from './app';
import { env } from './config/env';
import { prepareDatabase } from './bootstrap/prepare-database';
import { prisma } from './lib/prisma';

dotenv.config();

async function bootstrap() {
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
