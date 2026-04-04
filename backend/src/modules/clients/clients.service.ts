import { prisma } from '../../lib/prisma';

interface CreateClientInput {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  message?: string;
}

export async function createClient(data: CreateClientInput) {
  const client = await prisma.client.create({ data });
  return { id: client.id };
}
