import cors from 'cors';
import express, { type RequestHandler, type Response } from 'express';
import helmet from 'helmet';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { buildSwaggerDocument } from './lib/swagger';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { profilesRouter } from './modules/profiles/profiles.router';
import { profileAssetsRouter } from './modules/profile-assets/profile-assets.router';
import { consultantsPublicRouter } from './modules/consultants-public/consultants-public.router';
import { catalogsRouter } from './modules/catalogs/catalogs.router';
import { reviewsRouter } from './modules/reviews/reviews.router';
import { adminRouter } from './modules/admin/admin.router';
import { healthRouter } from './modules/health/health.router';
import { billingRouter } from './modules/billing/billing.router';
import { clientsRouter } from './modules/clients/clients.router';
import { integrationsRouter } from './modules/integrations/integrations.router';

// Main Express application
export const app = express();
const generatedAssetsDirectory = path.resolve(process.cwd(), 'generated');
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
}) as unknown as RequestHandler;
const swaggerServe = swaggerUi.serve as unknown as RequestHandler;
const swaggerSetup = swaggerUi.setup(buildSwaggerDocument()) as unknown as RequestHandler;
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'https://grupogoberna.com',
  'https://www.grupogoberna.com',
];

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use('/generated', express.static(generatedAssetsDirectory, {
  setHeaders: (response: Response) => {
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    response.setHeader('Access-Control-Allow-Origin', '*');
  },
}));
app.use('/api/auth', authLimiter);
app.use('/api/docs', swaggerServe, swaggerSetup);
app.use('/api/auth', authRouter);
app.use('/api', usersRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/profiles', profileAssetsRouter);
app.use('/api/consultants', consultantsPublicRouter);
app.use('/api/catalogs', catalogsRouter);
app.use('/api/profiles', reviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/health', healthRouter);
app.use('/api/billing', billingRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/integrations', integrationsRouter);
app.use(errorHandler);
