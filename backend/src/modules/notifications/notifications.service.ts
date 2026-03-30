export const NOTIFICATION_EVENT = {
  WELCOME: 'WELCOME',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PROFILE_SUBMITTED: 'PROFILE_SUBMITTED',
  PROFILE_APPROVED: 'PROFILE_APPROVED',
  PROFILE_REJECTED: 'PROFILE_REJECTED',
  PROFILE_CHANGES_REQUESTED: 'PROFILE_CHANGES_REQUESTED',
} as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENT)[keyof typeof NOTIFICATION_EVENT];

export async function emitNotification(event: NotificationEvent, email: string, payload: Record<string, string | number | boolean | null>) {
  console.log('[notification]', event, email, payload);
}
