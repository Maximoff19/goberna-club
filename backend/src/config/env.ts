import 'dotenv/config';

function requireValue(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  APP_NAME: requireValue('APP_NAME', 'Goberna Club API'),
  APP_URL: requireValue('APP_URL', 'http://localhost:4000'),
  FRONTEND_URL: requireValue('FRONTEND_URL', 'http://localhost:3000'),
  DATABASE_URL: requireValue('DATABASE_URL'),
  JWT_ACCESS_SECRET: requireValue('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requireValue('JWT_REFRESH_SECRET'),
  JWT_ACCESS_TTL: requireValue('JWT_ACCESS_TTL', '15m'),
  JWT_REFRESH_TTL: requireValue('JWT_REFRESH_TTL', '30d'),
  DEMO_CONSULTANT_EMAIL: requireValue('DEMO_CONSULTANT_EMAIL', 'consultant@goberna.club'),
  DEMO_CONSULTANT_PASSWORD: requireValue('DEMO_CONSULTANT_PASSWORD', 'ChangeMe123!'),
  DEMO_ADMIN_EMAIL: requireValue('DEMO_ADMIN_EMAIL', 'admin@goberna.club'),
  DEMO_ADMIN_PASSWORD: requireValue('DEMO_ADMIN_PASSWORD', 'ChangeMe123!'),
  INTEGRATION_API_KEY: requireValue('INTEGRATION_API_KEY'),
} as const;
