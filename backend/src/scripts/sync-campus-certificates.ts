import { execFile as execFileCallback } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { prisma } from '../lib/prisma';
import { createSlug, sanitizeText } from '../modules/common/sanitize';

const execFile = promisify(execFileCallback);
const GENERATED_CERTIFICATES_DIR = path.resolve(process.cwd(), 'generated', 'certificates');
const GENERATED_PUBLIC_BASE_URL = 'http://localhost:4000/generated/certificates';
const DEFAULT_CERTIFICATES_API_URL = 'https://campus.grupogoberna.com/local/customcertapi/api.php?token=AYMFr6EXplVyDXExBSjP';

interface CampusCertificateRecord {
  issueid: number;
  userid: number;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  countrycode: string;
  countryname: string;
  certid: number;
  certname: string;
  courseid: number;
  courseshortname: string;
  coursefullname: string;
  cmid: number;
  contextid: number;
  code: string;
  timecreated: number;
  download_url: string;
  preview_url: string;
  mycertificate_download_url: string;
  verify_url: string;
  verify_public_url: string;
  api_pdf_url?: string;
  api_pdf_download_url?: string;
}

function normalizeKey(value: string | undefined | null) {
  return createSlug(sanitizeText(value) || '').replace(/-/g, '');
}

async function ensureDirectory(directory: string) {
  await fs.mkdir(directory, { recursive: true });
}

async function fetchCampusCertificates(token: string) {
  const apiUrl = process.env.GOBERNA_CERT_API_URL || DEFAULT_CERTIFICATES_API_URL.replace('AYMFr6EXplVyDXExBSjP', token);
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Campus certificate API failed with ${response.status}`);
  }

  const payload = (await response.json()) as { success: number; certificates: CampusCertificateRecord[] };
  if (!payload.success || !Array.isArray(payload.certificates)) {
    throw new Error('Campus certificate API returned an invalid payload');
  }

  return payload.certificates;
}

async function findProfileForCertificate(record: CampusCertificateRecord) {
  const byEmail = record.email
    ? await prisma.consultantProfile.findFirst({
        where: { owner: { email: record.email.toLowerCase() } },
        include: { owner: true },
      })
    : null;

  if (byEmail) {
    return byEmail;
  }

  const firstName = sanitizeText(record.firstname);
  const lastName = sanitizeText(record.lastname);
  if (!firstName || !lastName) {
    return null;
  }

  const candidates = await prisma.consultantProfile.findMany({
    where: {
      owner: {
        firstName: firstName,
        lastName: lastName,
      },
    },
    include: { owner: true },
  });

  if (candidates.length > 0) {
    return candidates[0];
  }

  const nameKey = normalizeKey(record.fullname);
  const fallback = await prisma.consultantProfile.findMany({
    include: { owner: true },
  });

  return fallback.find((profile) => normalizeKey(`${profile.owner.firstName} ${profile.owner.lastName}`) === nameKey) || null;
}

async function downloadCertificatePdf(record: CampusCertificateRecord) {
  const downloadUrl = record.api_pdf_download_url || record.download_url;
  const response = await fetch(downloadUrl, { redirect: 'follow' });
  const finalUrl = response.url;
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    throw new Error(`Certificate download failed with ${response.status}`);
  }

  if (finalUrl.includes('/login/') || contentType.includes('text/html')) {
    return null;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) {
    return null;
  }

  return bytes;
}

async function convertPdfBufferToWebp(pdfBuffer: Buffer, targetPath: string) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'goberna-cert-'));
  const pdfPath = path.join(tempDir, 'source.pdf');
  const pngPath = path.join(tempDir, 'preview.png');

  try {
    await fs.writeFile(pdfPath, pdfBuffer);
    await execFile('/opt/homebrew/bin/pdftoppm', ['-f', '1', '-singlefile', '-png', pdfPath, path.join(tempDir, 'preview')]);
    await execFile('/opt/homebrew/bin/cwebp', [pngPath, '-o', targetPath]);
    return true;
  } catch {
    return false;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function buildCertificateSvg(record: CampusCertificateRecord) {
  const fullName = sanitizeText(record.fullname) || 'Participante';
  const courseName = sanitizeText(record.coursefullname) || 'Programa Goberna';
  const issueDate = new Date(record.timecreated * 1000).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="#f7f2e8" />
      <rect x="38" y="38" width="1524" height="824" rx="28" fill="#fffdf8" stroke="#d6b253" stroke-width="4" />
      <rect x="110" y="120" width="180" height="8" rx="4" fill="#ffc502" />
      <text x="110" y="200" font-family="Montserrat, Arial, sans-serif" font-size="42" font-weight="800" fill="#0f1923">GOBERNA</text>
      <text x="110" y="260" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="600" fill="#7a6a3d">Certificado sincronizado desde Campus Goberna</text>
      <text x="110" y="385" font-family="Montserrat, Arial, sans-serif" font-size="30" font-weight="500" fill="#4b5563">Otorgado a</text>
      <text x="110" y="470" font-family="Montserrat, Arial, sans-serif" font-size="64" font-weight="800" fill="#0f1923">${fullName}</text>
      <text x="110" y="560" font-family="Montserrat, Arial, sans-serif" font-size="28" font-weight="500" fill="#4b5563">Por completar satisfactoriamente</text>
      <text x="110" y="640" font-family="Montserrat, Arial, sans-serif" font-size="38" font-weight="700" fill="#0f1923">${courseName}</text>
      <text x="110" y="732" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="500" fill="#4b5563">Codigo de verificacion: ${record.code}</text>
      <text x="110" y="774" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="500" fill="#4b5563">Fecha de emision: ${issueDate}</text>
      <text x="110" y="816" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="500" fill="#7c7c7c">Vista previa generada automaticamente cuando el PDF original no es accesible desde la API publica.</text>
    </svg>
  `.trim();
}

async function generateFallbackCertificatePreview(record: CampusCertificateRecord, targetPath: string) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'goberna-cert-preview-'));
  const svgPath = path.join(tempDir, 'preview.svg');
  const pngPath = path.join(tempDir, 'preview.png');

  try {
    await fs.writeFile(svgPath, buildCertificateSvg(record), 'utf8');
    await execFile('/usr/bin/sips', ['-s', 'format', 'png', svgPath, '--out', pngPath]);
    await execFile('/opt/homebrew/bin/cwebp', [pngPath, '-o', targetPath]);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function upsertCertificateForProfile(profileId: string, record: CampusCertificateRecord, previewPublicUrl: string, fileSize: number) {
  const storageKey = `certificates/${record.code}.webp`;

  const existingCertificate = await prisma.profileCertificate.findFirst({
    where: {
      profileId,
      OR: [{ credentialUrl: record.verify_public_url }, { title: record.coursefullname }, { title: record.certname }],
    },
    include: { asset: true },
  });

  let assetId = existingCertificate?.assetId || null;

  if (assetId) {
    await prisma.profileMediaAsset.update({
      where: { id: assetId },
      data: {
        type: 'CERTIFICATE_FILE',
        storageKey,
        mimeType: 'image/webp',
        sizeBytes: BigInt(fileSize),
        originalFilename: `${record.code}.webp`,
        publicUrl: previewPublicUrl,
        deletedAt: null,
      },
    });
  } else {
    const asset = await prisma.profileMediaAsset.create({
      data: {
        profileId,
        type: 'CERTIFICATE_FILE',
        storageKey,
        mimeType: 'image/webp',
        sizeBytes: BigInt(fileSize),
        originalFilename: `${record.code}.webp`,
        publicUrl: previewPublicUrl,
      },
    });
    assetId = asset.id;
  }

  const certificateData = {
    title: sanitizeText(record.coursefullname)?.slice(0, 191) || 'Certificado Goberna',
    issuer: sanitizeText(record.certname)?.slice(0, 191) || 'Campus Goberna',
    issueDate: new Date(record.timecreated * 1000),
    credentialUrl: record.api_pdf_download_url || record.verify_public_url,
    assetId,
  };

  if (existingCertificate) {
    await prisma.profileCertificate.update({
      where: { id: existingCertificate.id },
      data: certificateData,
    });
  } else {
    await prisma.profileCertificate.create({
      data: {
        profileId,
        ...certificateData,
      },
    });
  }
}

async function main() {
  const token = process.env.GOBERNA_CERT_API_TOKEN;
  if (!token) {
    throw new Error('Missing GOBERNA_CERT_API_TOKEN');
  }

  await ensureDirectory(GENERATED_CERTIFICATES_DIR);

  const certificates = await fetchCampusCertificates(token);
  let matched = 0;
  let stored = 0;
  let fallbackGenerated = 0;

  for (const record of certificates) {
    const profile = await findProfileForCertificate(record);
    if (!profile) {
      continue;
    }

    matched += 1;

    const targetPath = path.join(GENERATED_CERTIFICATES_DIR, `${record.code}.webp`);
    const previewPublicUrl = `${GENERATED_PUBLIC_BASE_URL}/${record.code}.webp`;
    const pdfBuffer = await downloadCertificatePdf(record);
    let createdFromPdf = false;

    if (pdfBuffer) {
      createdFromPdf = await convertPdfBufferToWebp(pdfBuffer, targetPath);
    }

    if (!createdFromPdf) {
      await generateFallbackCertificatePreview(record, targetPath);
      fallbackGenerated += 1;
    }

    const fileStat = await fs.stat(targetPath);
    await upsertCertificateForProfile(profile.id, record, previewPublicUrl, fileStat.size);
    stored += 1;
  }

  console.log(
    JSON.stringify(
      {
        totalRemoteCertificates: certificates.length,
        matchedProfiles: matched,
        storedCertificates: stored,
        fallbackGenerated,
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
