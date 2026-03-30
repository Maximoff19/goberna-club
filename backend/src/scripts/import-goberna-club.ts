import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

const SOURCE_BASE_URL = 'https://goberna.club';
const CONSULTANTS_API_URL = `${SOURCE_BASE_URL}/wp-json/wp/v2/consultores?per_page=100&_embed`;
const IMPORT_PASSWORD = 'imported-goberna-local';

type WordPressTerm = {
  taxonomy?: string;
  name?: string;
};

type WordPressMedia = {
  source_url?: string;
};

type WordPressConsultant = {
  slug: string;
  link: string;
  modified: string;
  title?: { rendered?: string };
  _embedded?: {
    'wp:featuredmedia'?: WordPressMedia[];
    'wp:term'?: WordPressTerm[][];
  };
};

type ExperienceInput = {
  company: string;
  roleTitle: string;
  country?: string;
  city?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent: boolean;
};

type EducationInput = {
  institution: string;
  degree?: string;
  country?: string;
  startDate?: Date;
  endDate?: Date;
};

type CertificateInput = {
  title: string;
  credentialUrl: string;
};

type AssetInput = {
  type: 'AVATAR' | 'GALLERY_IMAGE' | 'CERTIFICATE_FILE';
  publicUrl: string;
  originalFilename: string;
  mimeType: string;
  storageKey: string;
};

type ParsedConsultant = {
  slug: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  publicEmail?: string;
  publicPhone?: string;
  professionalHeadline: string;
  bio: string;
  country?: string;
  city?: string;
  skills: string[];
  languages: Array<{ languageCode: string; proficiencyLevel: string }>;
  experiences: ExperienceInput[];
  educations: EducationInput[];
  certificates: CertificateInput[];
  assets: AssetInput[];
  modifiedAt: Date;
};

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&uuml;/g, 'u')
    .replace(/&Uuml;/g, 'U')
    .replace(/&oacute;/g, 'o')
    .replace(/&aacute;/g, 'a')
    .replace(/&eacute;/g, 'e')
    .replace(/&iacute;/g, 'i')
    .replace(/&uacute;/g, 'u')
    .replace(/&ntilde;/g, 'n')
    .replace(/&Ntilde;/g, 'N');
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function slugify(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitName(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return {
      firstName: parts[0] || 'Consultor',
      lastName: 'Importado',
    };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1) || 'Importado',
  };
}

function inferMimeType(url: string) {
  const normalized = url.toLowerCase();
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.svg')) return 'image/svg+xml';
  if (normalized.endsWith('.pdf')) return 'application/pdf';
  return 'image/jpeg';
}

function buildAsset(type: AssetInput['type'], publicUrl: string): AssetInput {
  const pathname = new URL(publicUrl).pathname;
  const originalFilename = pathname.split('/').filter(Boolean).at(-1) || `${slugify(type)}.bin`;

  return {
    type,
    publicUrl,
    originalFilename,
    mimeType: inferMimeType(publicUrl),
    storageKey: pathname.replace(/^\//, ''),
  };
}

function extractTerms(item: WordPressConsultant, taxonomy: string) {
  const groups = item._embedded?.['wp:term'] || [];
  return groups.flat().filter((term) => term.taxonomy === taxonomy && term.name).map((term) => stripTags(term.name || ''));
}

function extractSection(html: string, heading: string, nextHeadings: string[]) {
  const headingPattern = `<h2 class="elementor-heading-title elementor-size-default">${heading}</h2>`;
  const startIndex = html.indexOf(headingPattern);
  if (startIndex === -1) {
    return '';
  }

  const candidateIndexes = nextHeadings
    .map((nextHeading) => html.indexOf(`<h2 class="elementor-heading-title elementor-size-default">${nextHeading}</h2>`, startIndex + headingPattern.length))
    .filter((index) => index !== -1);

  const endIndex = candidateIndexes.length > 0 ? Math.min(...candidateIndexes) : html.length;
  return html.slice(startIndex, endIndex);
}

function extractSummary(html: string) {
  const match = html.match(/elementor-widget-theme-post-content[\s\S]*?<div class="elementor-widget-container">\s*<p>([\s\S]*?)<\/p>/i);
  return match ? stripTags(match[1]) : '';
}

function extractEmail(html: string) {
  const match = html.match(/href="mailto:([^"?]+)(?:\?[^"]*)?"/i);
  return match ? decodeURIComponent(match[1].trim()) : undefined;
}

function extractWhatsapp(html: string) {
  const match = html.match(/href="https:\/\/wa\.me\/([^"?#]+)"/i);
  if (!match) {
    return undefined;
  }

  const normalized = decodeURIComponent(match[1]).replace(/\s+/g, '').replace(/[^\d+]/g, '');
  return normalized ? (normalized.startsWith('+') ? normalized : `+${normalized}`) : undefined;
}

function parseFlexibleDate(value: string | undefined) {
  const normalized = String(value || '').trim();
  if (!normalized || /ACTUALIDAD/i.test(normalized)) {
    return undefined;
  }

  if (/^\d{4}$/.test(normalized)) {
    return new Date(`${normalized}-07-01T12:00:00.000Z`);
  }

  if (/^\d{4}-\d{2}$/.test(normalized)) {
    return new Date(`${normalized}-15T12:00:00.000Z`);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return new Date(`${normalized}T12:00:00.000Z`);
  }

  return undefined;
}

function mapLanguageProficiency(rawValue: string) {
  const normalized = slugify(rawValue);
  if (normalized.includes('nativo')) return 'nativo';
  if (normalized.includes('fluida') || normalized.includes('avanzado') || normalized.includes('professional')) return 'profesional';
  if (normalized.includes('intermedia') || normalized.includes('medio')) return 'intermedio';
  if (normalized.includes('basica') || normalized.includes('principante') || normalized.includes('principiante')) return 'basico';
  return 'profesional';
}

function parseLanguages(sectionHtml: string) {
  const values = Array.from(sectionHtml.matchAll(/jet-listing-dynamic-terms__link">([\s\S]*?)<\/span>/g)).map((match) => stripTags(match[1]));
  return values.map((value) => {
    const match = value.match(/^(.+?)(?:\((.+)\))?$/);
    const languageLabel = (match?.[1] || value).trim();
    const proficiencyLabel = (match?.[2] || '').trim();
    return {
      languageCode: slugify(languageLabel) || 'idioma',
      proficiencyLevel: proficiencyLabel ? mapLanguageProficiency(proficiencyLabel) : 'profesional',
    };
  });
}

function extractRepeaterItems(sectionHtml: string) {
  const wrapperMatch = sectionHtml.match(/<div class="jet-listing-dynamic-repeater__items\s*">([\s\S]*?)<\/div><\/div><\/div>/i);
  if (!wrapperMatch) {
    return [];
  }

  return wrapperMatch[1]
    .split(/<div class="jet-listing-dynamic-repeater__delimiter">[\s\S]*?<\/div>/i)
    .map((item) => item.trim())
    .filter((item) => item.includes('jet-listing-dynamic-repeater__item'));
}

function parseExperiences(sectionHtml: string) {
  return extractRepeaterItems(sectionHtml)
    .map((itemHtml) => {
      const cells = Array.from(itemHtml.matchAll(/<div>([\s\S]*?)<\/div>/g)).map((cellMatch) => stripTags(cellMatch[1]));
      const company = stripTags((itemHtml.match(/<strong>([\s\S]*?)<\/strong>/i)?.[1] || '').trim());
      const roleTitle = cells[1] || '';
      const location = cells[2] || '';
      const [country, city] = location.split(',').map((part) => part.trim()).filter(Boolean);
      const period = cells[3] || '';
      const [startRaw, endRaw] = period.split(' - ').map((part) => part.trim());

      if (!company && !roleTitle) {
        return null;
      }

      return {
        company,
        roleTitle,
        country,
        city,
        startDate: parseFlexibleDate(startRaw),
        endDate: parseFlexibleDate(endRaw),
        isCurrent: /ACTUALIDAD/i.test(endRaw || ''),
      } as ExperienceInput;
    })
    .filter(Boolean) as ExperienceInput[];
}

function parseEducations(sectionHtml: string) {
  return extractRepeaterItems(sectionHtml)
    .map((itemHtml) => {
      const institution = stripTags((itemHtml.match(/<strong>([\s\S]*?)<\/strong>/i)?.[1] || '').trim());
      const cells = Array.from(itemHtml.matchAll(/<div>([\s\S]*?)<\/div>/g)).map((cellMatch) => stripTags(cellMatch[1]));
      const degree = cells[1] || '';
      const locationAndPeriod = cells[2] || '';
      const [countryRaw, periodRaw] = locationAndPeriod.split('|').map((part) => part.trim());

      if (!institution && !degree) {
        return null;
      }

      return {
        institution,
        degree,
        country: countryRaw || undefined,
        startDate: parseFlexibleDate(periodRaw),
        endDate: parseFlexibleDate(periodRaw),
      } as EducationInput;
    })
    .filter(Boolean) as EducationInput[];
}

function parseCertificates(sectionHtml: string) {
  const urls = Array.from(sectionHtml.matchAll(/href="(https:\/\/goberna\.club\/wp-content\/uploads\/[^"]+)"/g)).map((match) => decodeHtml(match[1]));
  const uniqueUrls = Array.from(new Set(urls));
  return uniqueUrls.map((url) => {
    const filename = new URL(url).pathname.split('/').filter(Boolean).at(-1) || 'certificado';
    return {
      title: filename.replace(/[-_]+/g, ' ').replace(/\.[a-z0-9]+$/i, '').trim(),
      credentialUrl: url,
    } satisfies CertificateInput;
  });
}

function parseGallery(sectionHtml: string) {
  const urls = Array.from(sectionHtml.matchAll(/href="(https:\/\/goberna\.club\/wp-content\/uploads\/[^"]+)"/g)).map((match) => decodeHtml(match[1]));
  return Array.from(new Set(urls));
}

function buildImportedEmail(slug: string, publicEmail: string | undefined) {
  if (publicEmail) {
    return publicEmail.toLowerCase();
  }

  return `${slug}@import.goberna.club.local`;
}

async function parseConsultant(item: WordPressConsultant): Promise<ParsedConsultant> {
  const response = await fetch(item.link);
  if (!response.ok) {
    throw new Error(`No pude descargar el perfil ${item.slug}: ${response.status}`);
  }

  const html = await response.text();
  const name = stripTags(item.title?.rendered || item.slug);
  const { firstName, lastName } = splitName(name);
  const publicEmail = extractEmail(html);
  const email = buildImportedEmail(item.slug, publicEmail);
  const publicPhone = extractWhatsapp(html);
  const bio = extractSummary(html);
  const skills = extractTerms(item, 'habilidades');
  const cargos = extractTerms(item, 'cargos');
  const featuredImage = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const languagesSection = extractSection(html, 'Idioma', ['Experiencia Profesional']);
  const experiencesSection = extractSection(html, 'Experiencia Profesional', ['Formación Profesional']);
  const educationsSection = extractSection(html, 'Formación Profesional', ['Certificados']);
  const certificatesSection = extractSection(html, 'Certificados', ['Artículos']);
  const gallerySection = extractSection(html, 'Galeria de fotos', ['Estados Unidos']);
  const languages = parseLanguages(languagesSection);
  const experiences = parseExperiences(experiencesSection);
  const educations = parseEducations(educationsSection);
  const certificates = parseCertificates(certificatesSection);
  const galleryUrls = parseGallery(gallerySection);
  const primaryExperience = experiences[0];
  const assets = [
    ...(featuredImage ? [buildAsset('AVATAR', featuredImage)] : []),
    ...galleryUrls.map((url) => buildAsset('GALLERY_IMAGE', url)),
    ...certificates.map((certificate) => buildAsset('CERTIFICATE_FILE', certificate.credentialUrl)),
  ];

  return {
    slug: item.slug,
    name,
    firstName,
    lastName,
    email,
    publicEmail,
    publicPhone,
    professionalHeadline: (cargos[0] || 'Consultor politico acreditado Goberna').slice(0, 180),
    bio,
    country: primaryExperience?.country || educations[0]?.country,
    city: primaryExperience?.city,
    skills,
    languages,
    experiences,
    educations,
    certificates,
    assets,
    modifiedAt: new Date(item.modified),
  };
}

async function upsertConsultantProfile(passwordHash: string, consultant: ParsedConsultant) {
  const user = await prisma.user.upsert({
    where: { email: consultant.email },
    update: {
      firstName: consultant.firstName,
      lastName: consultant.lastName,
      avatarUrl: consultant.assets.find((asset) => asset.type === 'AVATAR')?.publicUrl,
      passwordHash,
      role: 'CONSULTANT',
      isActive: true,
    },
    create: {
      email: consultant.email,
      passwordHash,
      role: 'CONSULTANT',
      firstName: consultant.firstName,
      lastName: consultant.lastName,
      avatarUrl: consultant.assets.find((asset) => asset.type === 'AVATAR')?.publicUrl,
      isActive: true,
    },
  });

  const profile = await prisma.consultantProfile.upsert({
    where: { slug: consultant.slug },
    update: {
      userId: user.id,
      status: 'PUBLISHED',
      professionalHeadline: consultant.professionalHeadline,
      bio: consultant.bio,
      country: consultant.country,
      city: consultant.city,
      publicEmail: consultant.publicEmail,
      publicPhone: consultant.publicPhone,
      publishedAt: consultant.modifiedAt,
      submittedForReviewAt: consultant.modifiedAt,
      lastReviewedAt: consultant.modifiedAt,
      updatedAt: consultant.modifiedAt,
    },
    create: {
      userId: user.id,
      slug: consultant.slug,
      status: 'PUBLISHED',
      professionalHeadline: consultant.professionalHeadline,
      bio: consultant.bio,
      country: consultant.country,
      city: consultant.city,
      publicEmail: consultant.publicEmail,
      publicPhone: consultant.publicPhone,
      publishedAt: consultant.modifiedAt,
      submittedForReviewAt: consultant.modifiedAt,
      lastReviewedAt: consultant.modifiedAt,
    },
  });

  await prisma.$transaction([
    prisma.profileLanguage.deleteMany({ where: { profileId: profile.id } }),
    prisma.profileSkill.deleteMany({ where: { profileId: profile.id } }),
    prisma.profileExperience.deleteMany({ where: { profileId: profile.id } }),
    prisma.profileEducation.deleteMany({ where: { profileId: profile.id } }),
    prisma.profileCertificate.deleteMany({ where: { profileId: profile.id } }),
    prisma.profileMediaAsset.deleteMany({ where: { profileId: profile.id } }),
  ]);

  if (consultant.languages.length > 0) {
    await prisma.profileLanguage.createMany({
      data: consultant.languages.map((language) => ({
        profileId: profile.id,
        languageCode: language.languageCode,
        proficiencyLevel: language.proficiencyLevel,
      })),
    });
  }

  if (consultant.skills.length > 0) {
    await prisma.profileSkill.createMany({
      data: consultant.skills.map((name) => ({
        profileId: profile.id,
        name,
      })),
    });
  }

  if (consultant.experiences.length > 0) {
    await prisma.profileExperience.createMany({
      data: consultant.experiences.map((experience, index) => ({
        profileId: profile.id,
        company: experience.company,
        roleTitle: experience.roleTitle,
        employmentMode: undefined,
        country: experience.country,
        startDate: experience.startDate,
        endDate: experience.endDate,
        isCurrent: experience.isCurrent,
        description: undefined,
        orderIndex: index,
      })),
    });
  }

  if (consultant.educations.length > 0) {
    await prisma.profileEducation.createMany({
      data: consultant.educations.map((education, index) => ({
        profileId: profile.id,
        institution: education.institution,
        degree: education.degree,
        fieldOfStudy: education.country,
        startDate: education.startDate,
        endDate: education.endDate,
        orderIndex: index,
      })),
    });
  }

  let createdAssets: Array<{ id: string; publicUrl: string | null }> = [];
  if (consultant.assets.length > 0) {
    await prisma.profileMediaAsset.createMany({
      data: consultant.assets.map((asset) => ({
        profileId: profile.id,
        type: asset.type,
        storageKey: asset.storageKey,
        mimeType: asset.mimeType,
        sizeBytes: BigInt(0),
        originalFilename: asset.originalFilename,
        publicUrl: asset.publicUrl,
      })),
    });

    createdAssets = await prisma.profileMediaAsset.findMany({
      where: { profileId: profile.id },
      select: { id: true, publicUrl: true },
    });
  }

  if (consultant.certificates.length > 0) {
    await prisma.profileCertificate.createMany({
      data: consultant.certificates.map((certificate) => ({
        profileId: profile.id,
        title: certificate.title,
        credentialUrl: certificate.credentialUrl,
        assetId: createdAssets.find((asset) => asset.publicUrl === certificate.credentialUrl)?.id,
      })),
    });
  }
}

async function fetchConsultants() {
  const response = await fetch(CONSULTANTS_API_URL);
  if (!response.ok) {
    throw new Error(`No pude consultar la API de consultores: ${response.status}`);
  }

  return (await response.json()) as WordPressConsultant[];
}

async function main() {
  const items = await fetchConsultants();
  const passwordHash = await bcrypt.hash(IMPORT_PASSWORD, 12);
  let importedCount = 0;

  for (const item of items) {
    const consultant = await parseConsultant(item);
    await upsertConsultantProfile(passwordHash, consultant);
    importedCount += 1;
    console.log(`Imported ${consultant.slug}`);
  }

  console.log(`Imported ${importedCount} consultant profiles from ${SOURCE_BASE_URL}`);
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
