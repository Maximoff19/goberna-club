import { prisma } from '../../lib/prisma';
import { HttpError } from '../common/http-error';
import { hashPassword } from '../../lib/password';

interface CreateIntegrationUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CONSULTANT' | 'VISITOR';
}

export async function createIntegrationUser(input: CreateIntegrationUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, 'Email already in use');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      plan: null,
    },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
