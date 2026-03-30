import { prisma } from '../../lib/prisma';
import type { AuthenticatedUser } from '../common/types';

interface AuditInput {
  action: string;
  resourceType: string;
  resourceId: string;
  actor?: AuthenticatedUser;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function recordAudit(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actor?.id,
      actorRole: input.actor?.role,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadataJson: input.metadata,
    },
  });
}
