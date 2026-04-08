import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { createConnection } from 'mysql2/promise';
import { env } from '../config/env';
import { seedDevelopmentData } from './seed';

const isProduction = env.NODE_ENV === 'production';

function readDatabaseName() {
  const url = new URL(env.DATABASE_URL);
  return url.pathname.replace(/^\//, '');
}

/**
 * Ensures the MySQL database exists (CREATE DATABASE IF NOT EXISTS).
 * Runs in ALL environments — safe because it's idempotent.
 */
async function ensureDatabaseExists() {
  const url = new URL(env.DATABASE_URL);
  const databaseName = readDatabaseName();

  const connection = await createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    multipleStatements: false,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.end();
}

export async function prepareDatabase() {
  // Always ensure the database exists — idempotent and safe for all envs.
  await ensureDatabaseExists();

  const migrationsPath = `${process.cwd()}/prisma/migrations`;
  const hasMigrations = existsSync(migrationsPath) && readdirSync(migrationsPath).length > 0;

  if (hasMigrations) {
    execSync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  } else if (!isProduction) {
    // db push is unsafe for production — only use in development
    execSync('npx prisma db push --accept-data-loss', {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  }

  // Seed demo data only in development
  if (!isProduction) {
    await seedDevelopmentData();
  }
}
