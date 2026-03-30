export const USER_ROLE = {
  ADMIN: 'ADMIN',
  CONSULTANT: 'CONSULTANT',
  VISITOR: 'VISITOR',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const PROFILE_STATUS = {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProfileStatus = (typeof PROFILE_STATUS)[keyof typeof PROFILE_STATUS];

export const PROFILE_ASSET_TYPE = {
  AVATAR: 'AVATAR',
  GALLERY_IMAGE: 'GALLERY_IMAGE',
  CERTIFICATE_FILE: 'CERTIFICATE_FILE',
  SUPPORTING_DOC: 'SUPPORTING_DOC',
} as const;

export type ProfileAssetType = (typeof PROFILE_ASSET_TYPE)[keyof typeof PROFILE_ASSET_TYPE];

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
