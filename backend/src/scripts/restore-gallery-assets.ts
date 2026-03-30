import { prisma } from '../lib/prisma';

const SOURCE_BASE_URL = 'https://goberna.club';
const CONSULTANTS_API_URL = `${SOURCE_BASE_URL}/wp-json/wp/v2/consultores?per_page=100&_embed`;

type WordPressMedia = {
  source_url?: string;
};

type WordPressConsultant = {
  slug: string;
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: WordPressMedia[];
  };
};

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
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

function parseGallery(sectionHtml: string) {
  const urls = Array.from(sectionHtml.matchAll(/href="(https:\/\/goberna\.club\/wp-content\/uploads\/[^"]+)"/g)).map((match) => decodeHtml(match[1]));
  return Array.from(new Set(urls));
}

function inferMimeType(url: string) {
  const normalized = url.toLowerCase();
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

function buildStorageKey(url: string) {
  return new URL(url).pathname.replace(/^\//, '');
}

function buildOriginalFilename(url: string) {
  return new URL(url).pathname.split('/').filter(Boolean).at(-1) || 'asset.bin';
}

async function fetchConsultants() {
  const response = await fetch(CONSULTANTS_API_URL);
  if (!response.ok) {
    throw new Error(`No pude consultar la API de consultores: ${response.status}`);
  }

  return (await response.json()) as WordPressConsultant[];
}

async function fetchGalleryUrls(item: WordPressConsultant) {
  const response = await fetch(item.link);
  if (!response.ok) {
    throw new Error(`No pude descargar ${item.slug}: ${response.status}`);
  }

  const html = await response.text();
  const gallerySection = extractSection(html, 'Galeria de fotos', ['Estados Unidos']);
  return parseGallery(gallerySection);
}

async function main() {
  const items = await fetchConsultants();
  let restoredProfiles = 0;
  let restoredGalleryAssets = 0;

  for (const item of items) {
    const profile = await prisma.consultantProfile.findUnique({ where: { slug: item.slug } });
    if (!profile) {
      continue;
    }

    const featuredImage = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const galleryUrls = await fetchGalleryUrls(item);

    await prisma.profileMediaAsset.deleteMany({
      where: {
        profileId: profile.id,
        type: {
          in: ['AVATAR', 'GALLERY_IMAGE'],
        },
      },
    });

    const assets = [
      ...(featuredImage
        ? [
            {
              type: 'AVATAR' as const,
              publicUrl: featuredImage,
            },
          ]
        : []),
      ...galleryUrls.map((url) => ({
        type: 'GALLERY_IMAGE' as const,
        publicUrl: url,
      })),
    ];

    if (assets.length > 0) {
      await prisma.profileMediaAsset.createMany({
        data: assets.map((asset) => ({
          profileId: profile.id,
          type: asset.type,
          storageKey: buildStorageKey(asset.publicUrl),
          mimeType: inferMimeType(asset.publicUrl),
          sizeBytes: BigInt(0),
          originalFilename: buildOriginalFilename(asset.publicUrl),
          publicUrl: asset.publicUrl,
        })),
      });
    }

    restoredProfiles += 1;
    restoredGalleryAssets += galleryUrls.length;
    console.log(`Restored gallery for ${item.slug}`);
  }

  console.log(
    JSON.stringify(
      {
        restoredProfiles,
        restoredGalleryAssets,
      },
      null,
      2,
    ),
  );
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
