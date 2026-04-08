import {
  apiRequest,
  getStoredSession,
  hasStoredSession,
  loginWithCredentials,
  registerWithCredentials,
  resetApiSession,
  uploadFile,
} from './client';

import type { Session, LoginCredentials, RegisterCredentials } from './client';

// --- Raw API shape interfaces (what the backend returns) ---

interface RawOwner {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface RawCountryRef {
  id?: string;
  code?: string;
  slug?: string;
  name?: string;
}

interface RawSpecialty {
  id?: string;
  name?: string;
}

interface RawSkillEntry {
  skill?: { id: string; name: string };
  skillId?: string;
  name?: string;
}

interface RawLanguageEntry {
  languageCode: string;
}

interface RawExperience {
  company: string;
  roleTitle: string;
  employmentMode?: string;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
  country?: string;
  description?: string;
}

interface RawEducation {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

interface RawAward {
  title: string;
}

interface RawAsset {
  type: string;
  deletedAt?: string | null;
  publicUrl?: string;
}

interface RawCertificateAsset {
  publicUrl?: string;
}

interface RawCertificate {
  id: string;
  title: string;
  issuer?: string;
  credentialUrl?: string;
  apiPdfDownloadUrl?: string;
  asset?: RawCertificateAsset;
}

interface RawProfile {
  id: string;
  slug: string;
  owner?: RawOwner;
  countryRef?: RawCountryRef;
  country?: string;
  specialty?: RawSpecialty;
  professionalHeadline?: string;
  bio?: string;
  publicPhone?: string;
  publicEmail?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  skills?: RawSkillEntry[];
  languages?: RawLanguageEntry[];
  experiences?: RawExperience[];
  educations?: RawEducation[];
  awards?: RawAward[];
  certificates?: RawCertificate[];
  assets?: RawAsset[];
  featuredFlag?: boolean;
  status?: string;
}

// --- Normalized output interfaces ---

interface SocialLink {
  network: string;
  url: string;
}

interface NormalizedExperience {
  company: string;
  role: string;
  mode: string;
  period: string;
  country: string;
  summary: string;
}

interface NormalizedEducation {
  institution: string;
  program: string;
  period: string;
}

interface NormalizedCertificate {
  id: string;
  title: string;
  imageSrc: string;
  description: string;
  downloadUrl: string;
}

interface NormalizedProfile {
  id: string;
  slug: string;
  ownerId: string;
  ownerEmail: string;
  name: string;
  specialization: string;
  specialtyId: string;
  imageSrc: string;
  avatarSrc: string;
  hasRealPhoto: boolean;
  hasUploadedPhoto: boolean;
  summary: string;
  countryId: string;
  country: string;
  countryKey: string;
  countryFlag: string;
  countryCode: string;
  countryLabel: string;
  phone: string;
  email: string;
  website: string;
  socials: SocialLink[];
  languages: string;
  languagesList: string[];
  skills: string;
  skillsList: string[];
  skillIds: string[];
  experiences: NormalizedExperience[];
  educations: NormalizedEducation[];
  medals: string[];
  certificates: NormalizedCertificate[];
  gallery: string[];
  followers: string;
  clicks: string;
  featured: boolean;
  status: string | undefined;
}

interface PublicConsultant extends Omit<NormalizedProfile, 'skills' | 'languages'> {
  skills: string[];
  languages: string[];
}

interface CatalogOption {
  id: string;
  code: string;
  slug: string;
  label: string;
}

interface RawCatalogOption {
  id: string;
  code?: string;
  slug?: string;
  name?: string;
  label?: string;
}

interface CatalogPayload {
  countries: CatalogOption[];
  specialties: CatalogOption[];
  skills: CatalogOption[];
}

interface RawCatalogPayload {
  countries?: RawCatalogOption[];
  specialties?: RawCatalogOption[];
  skills?: RawCatalogOption[];
}

interface ConsultantQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  countries?: string[];
  languages?: string[];
  specialties?: string[];
  skills?: string[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface ConsultantsPageResponse {
  items: PublicConsultant[];
  pagination: PaginationInfo;
}

interface ProfileFormSocials {
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
}

interface ProfileFormExperience {
  company?: string;
  role?: string;
  mode?: string;
  country?: string;
  periodStart?: string;
  periodEnd?: string;
  summary?: string;
}

interface ProfileFormEducation {
  institution?: string;
  program?: string;
  periodStart?: string;
  periodEnd?: string;
}

interface ProfileFormData {
  name?: string;
  specialization?: string;
  specializationLabel?: string;
  summary?: string;
  country?: string;
  countryLabel?: string;
  email?: string;
  phone?: string;
  website?: string;
  socials?: ProfileFormSocials;
  languages?: string;
  skills?: string[];
  experiences?: ProfileFormExperience[];
  educations?: ProfileFormEducation[];
}

interface BackendProfilePayload {
  professionalHeadline?: string;
  specialtyId?: string;
  bio?: string;
  countryId?: string;
  country?: string;
  publicEmail?: string;
  publicPhone?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  languages: LanguagePayload[];
  skills: SkillPayload[];
  experiences: ExperiencePayload[];
  educations: EducationPayload[];
  certificates?: ExternalCertificatePayload[];
}

interface LanguagePayload {
  languageCode: string;
  proficiencyLevel: string;
}

interface SkillPayload {
  skillId: string;
}

interface ExperiencePayload {
  company: string;
  roleTitle: string;
  employmentMode?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

interface EducationPayload {
  institution: string;
  degree: string;
  startDate?: string;
  endDate?: string;
}

interface ExternalCertificatePayload {
  title: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

interface PeriodRange {
  startDate: string | undefined;
  endDate: string | undefined;
  isCurrent: boolean;
}

interface SplitName {
  firstName: string | undefined;
  lastName: string | undefined;
}

interface NormalizedSocials {
  network: string;
  url: string;
}

// --- Utility helpers ---

function formatDateRange(startDate: string | undefined, endDate: string | undefined, isCurrent: boolean): string {
  const formatDate = (value: string | undefined): string => {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('es', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const start = formatDate(startDate);
  const end = isCurrent ? 'Actualidad' : formatDate(endDate);

  if (!start && !end) {
    return '';
  }

  return [start, end].filter(Boolean).join(' - ');
}

function normalizeTextKey(value: string | undefined): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeCatalogOption(option: RawCatalogOption): CatalogOption {
  return {
    id: option.id,
    code: option.code || '',
    slug: option.slug || '',
    label: option.name || option.label || '',
  };
}

function countryCodeToFlag(code: string | undefined): string {
  const normalized = String(code || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return '';
  }

  return String.fromCodePoint(...normalized.split('').map((character) => 127397 + character.charCodeAt(0)));
}

function normalizeCatalogPayload(payload: RawCatalogPayload | null): CatalogPayload {
  return {
    countries: Array.isArray(payload?.countries) ? payload!.countries!.map(normalizeCatalogOption) : [],
    specialties: Array.isArray(payload?.specialties) ? payload!.specialties!.map(normalizeCatalogOption) : [],
    skills: Array.isArray(payload?.skills) ? payload!.skills!.map(normalizeCatalogOption) : [],
  };
}

function getSkillLabel(skill: RawSkillEntry): string {
  return skill?.skill?.name || skill?.name || '';
}

function getSkillId(skill: RawSkillEntry): string {
  return skill?.skill?.id || skill?.skillId || '';
}

function buildSocials(profile: RawProfile): SocialLink[] {
  return [
    profile.websiteUrl ? { network: 'website', url: profile.websiteUrl } : null,
    profile.facebookUrl ? { network: 'facebook', url: profile.facebookUrl } : null,
    profile.linkedinUrl ? { network: 'linkedin', url: profile.linkedinUrl } : null,
    profile.instagramUrl ? { network: 'instagram', url: profile.instagramUrl } : null,
    profile.xUrl ? { network: 'twitter', url: profile.xUrl } : null,
  ].filter((item): item is SocialLink => item !== null);
}

function getAvatarInitials(profile: RawProfile): string {
  const fullName = [profile.owner?.firstName, profile.owner?.lastName].filter(Boolean).join(' ').trim();
  if (!fullName) {
    return 'GC';
  }

  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return (parts[0][0] || 'G').toUpperCase();
  }

  return `${parts[0][0] || 'G'}${parts[parts.length - 1][0] || 'C'}`.toUpperCase();
}

function hashString(value: string | undefined): number {
  return String(value || 'goberna-club').split('').reduce((accumulator, character) => {
    return accumulator * 31 + character.charCodeAt(0);
  }, 7);
}

function createFallbackAvatar(profile: RawProfile): string {
  const initials = getAvatarInitials(profile);
  const palette: [string, string][] = [
    ['#0f766e', '#14b8a6'],
    ['#1d4ed8', '#60a5fa'],
    ['#b45309', '#f59e0b'],
    ['#be123c', '#fb7185'],
    ['#4338ca', '#818cf8'],
  ];
  const fullName = [profile.owner?.firstName, profile.owner?.lastName].filter(Boolean).join(' ').trim();
  const [startColor, endColor] = palette[Math.abs(hashString(fullName || profile.slug)) % palette.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-label="Avatar de ${initials}">
      <defs>
        <linearGradient id="avatar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="160" fill="url(#avatar-gradient)" />
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-family="Montserrat, Arial, sans-serif" font-size="112" font-weight="700" fill="#ffffff">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function hasRealAvatar(profile: RawProfile): boolean {
  const avatarAsset = Array.isArray(profile.assets)
    ? profile.assets.find((asset) => asset.type === 'AVATAR' && !asset.deletedAt && asset.publicUrl)
    : null;

  return Boolean(avatarAsset?.publicUrl || profile.owner?.avatarUrl);
}

function extractAvatar(profile: RawProfile): string {
  const avatarAsset = Array.isArray(profile.assets)
    ? profile.assets.find((asset) => asset.type === 'AVATAR' && !asset.deletedAt && asset.publicUrl)
    : null;

  return avatarAsset?.publicUrl || profile.owner?.avatarUrl || createFallbackAvatar(profile);
}

function extractGallery(profile: RawProfile): string[] {
  if (!Array.isArray(profile.assets)) {
    return [];
  }

  return profile.assets
    .filter((asset) => asset.type === 'GALLERY_IMAGE' && !asset.deletedAt && asset.publicUrl)
    .map((asset) => asset.publicUrl!);
}

function extractCertificatePreview(_profile: RawProfile, certificate: RawCertificate): string {
  if (certificate?.asset?.publicUrl) {
    return certificate.asset.publicUrl;
  }

  return '';
}

function isCampusCertificate(certificate: RawCertificate): boolean {
  const credentialUrl = String(certificate?.credentialUrl || '');
  const assetUrl = String(certificate?.asset?.publicUrl || '');

  return credentialUrl.includes('campus.grupogoberna.com/mod/customcert/verify_certificate.php')
    || assetUrl.includes('/generated/certificates/');
}

function normalizeSharedProfile(profile: RawProfile): NormalizedProfile {
  const fullName = [profile.owner?.firstName, profile.owner?.lastName].filter(Boolean).join(' ').trim() || 'Consultor Goberna';
  const skillsList = Array.isArray(profile.skills) ? profile.skills.map(getSkillLabel).filter(Boolean) : [];
  const skillIds = Array.isArray(profile.skills) ? profile.skills.map(getSkillId).filter(Boolean) : [];
  const languagesList = Array.isArray(profile.languages) ? profile.languages.map((language) => language.languageCode).filter(Boolean) : [];
  const gallery = extractGallery(profile);
  const avatar = extractAvatar(profile);
  const countryValue = profile.countryRef?.name || profile.country || '';
  const countryKey = normalizeTextKey(profile.countryRef?.code || profile.countryRef?.slug || countryValue);
  const countryFlag = countryCodeToFlag(profile.countryRef?.code);
  const countryCode = (profile.countryRef?.code || '').toUpperCase();
  const specialtyLabel = profile.specialty?.name || profile.professionalHeadline || 'Consultor politico';

  return {
    id: profile.id,
    slug: profile.slug,
    ownerId: profile.owner?.id || '',
    ownerEmail: profile.owner?.email || '',
    name: fullName,
    specialization: specialtyLabel,
    specialtyId: profile.specialty?.id || '',
    imageSrc: avatar,
    avatarSrc: avatar,
    hasRealPhoto: hasRealAvatar(profile),
    hasUploadedPhoto: Boolean(Array.isArray(profile.assets) && profile.assets.find((asset) => asset.type === 'AVATAR' && !asset.deletedAt && asset.publicUrl)),
    summary: profile.bio || '',
    countryId: profile.countryRef?.id || '',
    country: countryValue,
    countryKey,
    countryFlag,
    countryCode,
    countryLabel: countryValue || 'Internacional',
    phone: profile.publicPhone || '',
    email: profile.publicEmail || '',
    website: profile.websiteUrl || '',
    socials: buildSocials(profile),
    languages: languagesList.join(', '),
    languagesList,
    skills: skillsList.join(', '),
    skillsList,
    skillIds,
    experiences: Array.isArray(profile.experiences)
        ? profile.experiences.map((experience) => ({
            company: experience.company,
            role: experience.roleTitle,
            mode: experience.employmentMode || (experience.isCurrent ? 'Actualidad' : 'Consultoria'),
            period: formatDateRange(experience.startDate, experience.endDate, experience.isCurrent ?? false),
            country: experience.country || countryValue,
            summary: experience.description || '',
          }))
      : [],
    educations: Array.isArray(profile.educations)
      ? profile.educations.map((education) => ({
          institution: education.institution,
          program: [education.degree, education.fieldOfStudy].filter(Boolean).join(' - '),
          period: formatDateRange(education.startDate, education.endDate, false),
        }))
      : [],
    medals: Array.isArray(profile.awards) ? profile.awards.map((award) => award.title).filter(Boolean) : [],
    certificates: Array.isArray(profile.certificates)
        ? profile.certificates.filter(isCampusCertificate).map((certificate) => ({
            id: certificate.id,
            title: certificate.title,
            imageSrc: extractCertificatePreview(profile, certificate),
            description: certificate.issuer || 'Certificacion profesional de Goberna Club.',
            downloadUrl: certificate.apiPdfDownloadUrl || certificate.credentialUrl || '',
          }))
      : [],
    gallery,
    followers: `${10 + ((profile.slug?.length || 1) % 25)}k`,
    clicks: `${15 + ((profile.id?.length || 1) % 35)}k`,
    featured: Boolean(profile.featuredFlag),
    status: profile.status,
  };
}

function normalizePublicConsultant(profile: RawProfile): PublicConsultant {
  const normalized = normalizeSharedProfile(profile);
  return {
    ...normalized,
    skills: normalized.skillsList,
    languages: normalized.languagesList,
  };
}

function toLanguageCodeList(value: string): LanguagePayload[] {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({
      languageCode: item.toLowerCase(),
      proficiencyLevel: 'professional',
    }));
}

function toSkillsList(value: unknown): SkillPayload[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .map((skillId) => ({
      skillId,
    }));
}

const SOCIAL_NETWORK_FIELD = {
  facebook: 'facebookUrl',
  instagram: 'instagramUrl',
  linkedin: 'linkedinUrl',
  twitter: 'xUrl',
  website: 'websiteUrl',
} as const;

type SocialNetwork = keyof typeof SOCIAL_NETWORK_FIELD;
type SocialFieldName = (typeof SOCIAL_NETWORK_FIELD)[SocialNetwork];

const SPANISH_MONTH_NUMBER: Record<string, string> = {
  ene: '01',
  feb: '02',
  mar: '03',
  abr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  ago: '08',
  sep: '09',
  set: '09',
  oct: '10',
  nov: '11',
  dic: '12',
};

function parseMonthYearLabel(value: string | undefined): string | undefined {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '');

  if (!normalized || normalized === 'actualidad' || normalized === 'en curso') {
    return undefined;
  }

  const [monthLabel, yearLabel] = normalized.split(/\s+/);
  const month = SPANISH_MONTH_NUMBER[monthLabel];
  if (!month || !/^\d{4}$/.test(yearLabel || '')) {
    return undefined;
  }

  return `${yearLabel}-${month}-15T12:00:00.000Z`;
}

function parsePeriodRange(period: string | undefined): PeriodRange {
  const [startLabel, endLabel] = String(period || '').split(' - ').map((item) => item.trim());
  const startDate = parseMonthYearLabel(startLabel);
  const endDate = parseMonthYearLabel(endLabel);
  const isCurrent = /actualidad|en curso/i.test(endLabel || '');

  return {
    startDate,
    endDate,
    isCurrent,
  };
}

function normalizeSocialsForPayload(socials: NormalizedSocials[] | undefined): Record<SocialFieldName, string | undefined> {
  const mapped: Record<SocialFieldName, string | undefined> = {
    facebookUrl: undefined,
    instagramUrl: undefined,
    linkedinUrl: undefined,
    xUrl: undefined,
    websiteUrl: undefined,
  };

  if (!Array.isArray(socials)) {
    return mapped;
  }

  socials.forEach((social) => {
    const network = typeof social === 'string' ? undefined : social?.network;
    const url = typeof social === 'string' ? social : social?.url;
    const field = SOCIAL_NETWORK_FIELD[network as SocialNetwork];
    if (field && url) {
      mapped[field] = optionalUrl(url);
    }
  });

  return mapped;
}

function mapNormalizedProfileToBackend(profile: NormalizedProfile): BackendProfilePayload {
  return {
    professionalHeadline: optionalText(profile.specialization),
    specialtyId: optionalText(profile.specialtyId),
    bio: optionalText(profile.summary),
    countryId: optionalText(profile.countryId),
    country: optionalText(profile.countryLabel || profile.country),
    publicEmail: optionalText(profile.email),
    publicPhone: optionalText(profile.phone),
    ...((): Pick<BackendProfilePayload, 'websiteUrl' | 'facebookUrl' | 'instagramUrl' | 'linkedinUrl' | 'xUrl'> => {
      const socials = normalizeSocialsForPayload(profile.socials);
      return { ...socials, websiteUrl: socials.websiteUrl ?? optionalUrl(profile.website) };
    })(),
    languages: toLanguageCodeList(profile.languagesList?.join(', ') || profile.languages),
    skills: toSkillsList(profile.skillIds || []),
    experiences: Array.isArray(profile.experiences)
      ? profile.experiences
          .filter((experience) => experience.company || experience.role || experience.summary)
          .map((experience) => {
            const parsedPeriod = parsePeriodRange(experience.period);
            return {
              company: experience.company || 'Experiencia profesional',
              roleTitle: experience.role || 'Consultor',
              employmentMode: optionalText(experience.mode),
              country: optionalText(experience.country),
              startDate: parsedPeriod.startDate,
              endDate: parsedPeriod.endDate,
              isCurrent: parsedPeriod.isCurrent,
              description: experience.summary || '',
            };
          })
      : [],
    educations: Array.isArray(profile.educations)
      ? profile.educations
          .filter((education) => education.institution || education.program || education.period)
          .map((education) => {
            const parsedPeriod = parsePeriodRange(education.period);
            return {
              institution: education.institution || 'Institucion',
              degree: education.program || '',
              startDate: parsedPeriod.startDate,
              endDate: parsedPeriod.endDate,
            };
          })
      : [],
  };
}

// --- Exported API functions ---

export async function loginConsultant(credentials: LoginCredentials): Promise<Session> {
  return loginWithCredentials(credentials);
}

export async function registerConsultant(credentials: RegisterCredentials): Promise<Session> {
  return registerWithCredentials(credentials);
}

export async function updateMyAvatar(avatarUrl: string): Promise<void> {
  await apiRequest('/me', {
    method: 'PATCH',
    auth: true,
    body: {
      avatarUrl,
    },
  });
}

export async function uploadProfileAvatar(profileId: string, file: File): Promise<unknown> {
  return uploadFile(`/profiles/${profileId}/avatar`, file);
}

export async function uploadProfileGalleryImage(profileId: string, file: File): Promise<unknown> {
  return uploadFile(`/profiles/${profileId}/gallery`, file);
}

export async function deleteProfileAsset(profileId: string, assetId: string): Promise<unknown> {
  return apiRequest(`/profiles/${profileId}/assets/${assetId}`, {
    method: 'DELETE',
    auth: true,
  });
}

export function getCurrentSession(): Session | null {
  return getStoredSession();
}

export function isAdminSession(session: Session | null = getStoredSession()): boolean {
  return session?.user?.role === 'ADMIN';
}

export function isAuthenticated(): boolean {
  return hasStoredSession();
}

export function logoutConsultant(): void {
  resetApiSession();
}

function optionalText(value: string | undefined): string | undefined {
  const normalized = String(value || '').trim();
  return normalized ? normalized : undefined;
}

function optionalUrl(value: string | undefined): string | undefined {
  const normalized = optionalText(value);
  return normalized || undefined;
}

function normalizeMonthInput(value: string | undefined): string | undefined {
  const normalized = String(value || '').trim();
  if (!/^\d{4}-\d{2}$/.test(normalized)) {
    return undefined;
  }

  return `${normalized}-15T12:00:00.000Z`;
}

function splitFullName(fullName: string | undefined): SplitName {
  const normalized = String(fullName || '').trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return {
      firstName: undefined,
      lastName: undefined,
    };
  }

  const parts = normalized.split(' ');
  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: parts[0],
    };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1),
  };
}

export function mapProfileFormToBackend(formData: ProfileFormData): BackendProfilePayload {
  return {
    professionalHeadline: optionalText(formData.specializationLabel || formData.specialization),
    specialtyId: optionalText(formData.specialization),
    bio: optionalText(formData.summary),
    countryId: optionalText(formData.country),
    country: optionalText(formData.countryLabel),
    publicEmail: optionalText(formData.email),
    publicPhone: optionalText(formData.phone),
    websiteUrl: optionalUrl(formData.website),
    facebookUrl: optionalUrl(formData.socials?.facebook),
    linkedinUrl: optionalUrl(formData.socials?.linkedin),
    instagramUrl: optionalUrl(formData.socials?.instagram),
    xUrl: optionalUrl(formData.socials?.twitter),
    languages: toLanguageCodeList(formData.languages || ''),
    skills: toSkillsList(formData.skills),
    experiences: Array.isArray(formData.experiences)
      ? formData.experiences
          .filter((experience) => experience.company || experience.role)
          .map((experience) => ({
            company: experience.company || 'Experiencia profesional',
            roleTitle: experience.role || 'Consultor',
            employmentMode: optionalText(experience.mode),
            country: optionalText(experience.country),
            startDate: normalizeMonthInput(experience.periodStart),
            endDate: normalizeMonthInput(experience.periodEnd),
            isCurrent: !experience.periodEnd,
            description: experience.summary || '',
          }))
      : [],
    educations: Array.isArray(formData.educations)
      ? formData.educations
          .filter((education) => education.institution || education.program)
          .map((education) => ({
            institution: education.institution || 'Institucion',
            degree: education.program || '',
            startDate: normalizeMonthInput(education.periodStart),
            endDate: normalizeMonthInput(education.periodEnd),
          }))
      : [],
  };
}

export async function fetchOwnProfiles(): Promise<NormalizedProfile[]> {
  const profiles = await apiRequest('/profiles', { auth: true });
  return Array.isArray(profiles) ? profiles.map((p) => normalizeSharedProfile(p as RawProfile)) : [];
}

export async function fetchOwnProfileById(profileId: string): Promise<NormalizedProfile | null> {
  const profile = await apiRequest(`/profiles/${profileId}`, { auth: true });
  return profile ? normalizeSharedProfile(profile as RawProfile) : null;
}

function profileContainsSubmission(profile: RawProfile | null, payload: BackendProfilePayload, expectedHeadline: string | undefined): boolean {
  if (!profile) {
    return false;
  }

  const headlineMatches = (profile.professionalHeadline || '') === (expectedHeadline || '');
  const bioMatches = (profile.bio || '') === (payload.bio || '');
  const emailMatches = (profile.publicEmail || '') === (payload.publicEmail || '');
  const phoneMatches = (profile.publicPhone || '') === (payload.publicPhone || '');
  const websiteMatches = (profile.websiteUrl || '') === (payload.websiteUrl || '');
  const languagesMatch = Array.isArray(payload.languages)
    ? Array.isArray(profile.languages) && profile.languages.length === payload.languages.length
    : true;
  const skillsMatch = Array.isArray(payload.skills)
    ? Array.isArray(profile.skills) && profile.skills.length === payload.skills.length
    : true;
  const experiencesMatch = Array.isArray(payload.experiences)
    ? Array.isArray(profile.experiences) && profile.experiences.length === payload.experiences.length
    : true;
  const educationsMatch = Array.isArray(payload.educations)
    ? Array.isArray(profile.educations) && profile.educations.length === payload.educations.length
    : true;

  return headlineMatches && bioMatches && emailMatches && phoneMatches && websiteMatches && languagesMatch && skillsMatch && experiencesMatch && educationsMatch;
}

async function syncCreatedProfile(profileId: string, payload: BackendProfilePayload, expectedHeadline: string | undefined): Promise<RawProfile> {
  let profile = (await apiRequest(`/profiles/${profileId}`, { auth: true })) as RawProfile;
  if (profileContainsSubmission(profile, payload, expectedHeadline)) {
    return profile;
  }

  await apiRequest(`/profiles/${profileId}`, {
    method: 'PATCH',
    auth: true,
    body: {
      professionalHeadline: expectedHeadline,
      ...payload,
    },
  });

  profile = (await apiRequest(`/profiles/${profileId}`, { auth: true })) as RawProfile;
  return profile;
}

const CERTIFICACIONES_API_BASE = 'https://certificaciones.goberna.us/cursos/api/certificados';

interface ExternalCertificateRaw {
  cert_name?: string;
  course_name?: string;
  fecha_emision?: string;
  download_url?: string;
  url_verificacion?: string;
}

interface ExternalCertificateResponse {
  ok: boolean;
  data: ExternalCertificateRaw[];
}

async function fetchExternalCertificates(email: string): Promise<ExternalCertificatePayload[]> {
  if (!email) {
    return [];
  }

  try {
    const url = `${CERTIFICACIONES_API_BASE}/?email=${encodeURIComponent(email)}&activo=1&limit=100`;
    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ExternalCertificateResponse;

    if (!payload.ok || !Array.isArray(payload.data) || payload.data.length === 0) {
      return [];
    }

    return payload.data.map((cert) => ({
      title: String(cert.cert_name || cert.course_name || 'Certificado Goberna').slice(0, 191),
      issuer: String(cert.course_name || cert.cert_name || 'Campus Goberna').slice(0, 191),
      issueDate: cert.fecha_emision ? cert.fecha_emision.split(' ')[0].split('/').reverse().join('-') : undefined,
      credentialUrl: cert.download_url || cert.url_verificacion || undefined,
    }));
  } catch {
    return [];
  }
}

export async function createProfile(formData: ProfileFormData): Promise<NormalizedProfile> {
  const accountName = splitFullName(formData.name);
  const updatePayload = mapProfileFormToBackend(formData) as BackendProfilePayload & { certificates?: ExternalCertificatePayload[] };
  const profileHeadline = optionalText(formData.specializationLabel) || optionalText(formData.name);

  if (accountName.firstName && accountName.lastName) {
    await apiRequest('/me', {
      method: 'PATCH',
      auth: true,
      body: {
        firstName: accountName.firstName,
        lastName: accountName.lastName,
      },
    });
  }

  const created = (await apiRequest('/profiles', {
    method: 'POST',
    auth: true,
    body: {
      professionalHeadline: profileHeadline,
    },
  })) as { id: string };

  const session = getStoredSession();
  const authEmail = session?.user?.email || '';
  const externalCertificates = await fetchExternalCertificates(authEmail);

  if (externalCertificates.length > 0) {
    const existingCerts = Array.isArray(updatePayload.certificates) ? updatePayload.certificates : [];
    updatePayload.certificates = [...existingCerts, ...externalCertificates];
  }

  await apiRequest(`/profiles/${created.id}`, {
    method: 'PATCH',
    auth: true,
    body: updatePayload,
  });

  const updated = await syncCreatedProfile(created.id, updatePayload, profileHeadline);

  return normalizeSharedProfile(updated);
}

export async function fetchConsultants(): Promise<PublicConsultant[]> {
  const payload = (await apiRequest('/consultants?page=1&limit=25', { auth: false })) as { items?: RawProfile[] } | null;
  return Array.isArray(payload?.items) ? payload!.items!.map(normalizePublicConsultant) : [];
}

function buildConsultantQueryParams(params: ConsultantQueryParams = {}): string {
  const searchParams = new URLSearchParams();

  searchParams.set('page', String(params.page || 1));
  searchParams.set('limit', String(params.limit || 10));

  if (params.q) {
    searchParams.set('q', params.q);
  }

  if (Array.isArray(params.countries) && params.countries.length > 0) {
    searchParams.set('countries', params.countries.join(','));
  }

  if (Array.isArray(params.languages) && params.languages.length > 0) {
    searchParams.set('languages', params.languages.join(','));
  }

  if (Array.isArray(params.specialties) && params.specialties.length > 0) {
    searchParams.set('specialties', params.specialties.join(','));
  }

  if (Array.isArray(params.skills) && params.skills.length > 0) {
    searchParams.set('skills', params.skills.join(','));
  }

  return searchParams.toString();
}

export async function fetchConsultantsPage(params: ConsultantQueryParams = {}): Promise<ConsultantsPageResponse> {
  const query = buildConsultantQueryParams(params);
  const payload = (await apiRequest(`/consultants?${query}`, { auth: false })) as { items?: RawProfile[]; pagination?: PaginationInfo } | null;

  return {
    items: Array.isArray(payload?.items) ? payload!.items!.map(normalizePublicConsultant) : [],
    pagination: payload?.pagination || { page: 1, limit: params.limit || 10, total: 0, totalPages: 1, hasMore: false },
  };
}

export async function fetchProfileCatalogs(): Promise<CatalogPayload> {
  const payload = (await apiRequest('/catalogs/consultant-profile', { auth: false })) as RawCatalogPayload | null;
  return normalizeCatalogPayload(payload);
}

export async function fetchConsultantBySlug(slug: string): Promise<NormalizedProfile | null> {
  const profile = (await apiRequest(`/consultants/${slug}`, { auth: false })) as RawProfile | null;
  return profile ? normalizeSharedProfile(profile) : null;
}

export async function updateOwnProfile(profileId: string, profile: NormalizedProfile): Promise<NormalizedProfile | null> {
  await apiRequest(`/profiles/${profileId}`, {
    method: 'PATCH',
    auth: true,
    body: mapNormalizedProfileToBackend(profile),
  });

  return fetchOwnProfileById(profileId);
}

export async function deleteProfilePermanently(profileId: string): Promise<unknown> {
  return apiRequest(`/profiles/${profileId}/permanent`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function submitClientLead(data: Record<string, unknown>): Promise<unknown> {
  return apiRequest('/clients', { method: 'POST', body: data });
}

export type {
  NormalizedProfile,
  PublicConsultant,
  NormalizedExperience,
  NormalizedEducation,
  NormalizedCertificate,
  SocialLink,
  CatalogOption,
  CatalogPayload,
  ConsultantQueryParams,
  ConsultantsPageResponse,
  PaginationInfo,
  ProfileFormData,
  ProfileFormExperience,
  ProfileFormEducation,
  ProfileFormSocials,
  BackendProfilePayload,
};
