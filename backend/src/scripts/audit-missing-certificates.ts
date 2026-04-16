/**
 * Audit script — read-only
 *
 * Goal: for every consultant profile in our DB, compare its certificates
 * against the two external sources (campus + certificaciones.goberna.us)
 * and report who is missing what.
 *
 * Matching criterion (per user spec):
 *   1. Campus certificates expose a `code` string (e.g. "AB12CD"). Our DB does
 *      NOT store that code as a dedicated column, but the sync script stores
 *      `verify_public_url` (which embeds the code) OR `api_pdf_download_url`
 *      in `ProfileCertificate.credentialUrl`. So we match campus certs by
 *      looking for the `code` substring inside `credentialUrl`.
 *   2. certificaciones.goberna.us does not expose a code. It returns
 *      `download_url` + `url_verificacion`. We match by exact equality
 *      against `credentialUrl`, falling back to a normalized title match
 *      (`cert_name` / `course_name` vs. `title`).
 *
 * The script performs NO writes. Prisma is used in read-only mode.
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

const CAMPUS_API_URL =
  process.env.GOBERNA_CERT_API_URL ||
  'https://campus.grupogoberna.com/local/customcertapi/api.php?token=AYMFr6EXplVyDXExBSjP';
const CERTIFICACIONES_API_BASE =
  'https://certificaciones.goberna.us/cursos/api/certificados';

const PARALLEL_REQUESTS = 5;
const REQUEST_TIMEOUT_MS = 15_000;

interface CampusCertificateRecord {
  email: string;
  firstname: string;
  lastname: string;
  fullname: string;
  certname: string;
  coursefullname: string;
  code: string;
  timecreated: number;
  verify_public_url: string;
  download_url: string;
  api_pdf_download_url?: string;
}

interface CertificacionesRecord {
  cert_name?: string;
  course_name?: string;
  fecha_emision?: string;
  download_url?: string;
  url_verificacion?: string;
}

interface CertificacionesResponse {
  ok: boolean;
  data: CertificacionesRecord[];
}

interface ProfileSnapshot {
  profileId: string;
  userId: string;
  email: string;
  fullName: string;
  dbCerts: Array<{
    id: string;
    title: string;
    credentialUrl: string | null;
  }>;
}

interface MissingReport {
  email: string;
  fullName: string;
  dbCount: number;
  campusCount: number;
  gobernaUsCount: number;
  missingFromCampus: string[]; // list of cert descriptions missing in DB
  missingFromGobernaUs: string[];
  gobernaUsError?: string;
}

function normalizeTitle(value: string | null | undefined): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function fetchWithTimeout(url: string, ms = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCampusCertificates(): Promise<CampusCertificateRecord[]> {
  const response = await fetchWithTimeout(CAMPUS_API_URL);
  if (!response.ok) {
    throw new Error(`Campus API failed: ${response.status} ${response.statusText}`);
  }
  const payload = (await response.json()) as {
    success: number;
    certificates: CampusCertificateRecord[];
  };
  if (!payload.success || !Array.isArray(payload.certificates)) {
    throw new Error('Campus API returned invalid payload');
  }
  return payload.certificates;
}

async function fetchCertificacionesForEmail(
  email: string,
): Promise<{ data: CertificacionesRecord[]; error?: string }> {
  try {
    const url = `${CERTIFICACIONES_API_BASE}/?email=${encodeURIComponent(email)}&activo=1&limit=100`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      return { data: [], error: `HTTP ${response.status}` };
    }
    const payload = (await response.json()) as CertificacionesResponse;
    if (!payload.ok || !Array.isArray(payload.data)) {
      return { data: [], error: 'invalid payload' };
    }
    return { data: payload.data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { data: [], error: msg };
  }
}

/**
 * Run async tasks with bounded concurrency (no external deps).
 */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function runOne(): Promise<void> {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, () => runOne());
  await Promise.all(runners);
  return results;
}

function campusCertMatchesDb(
  campus: CampusCertificateRecord,
  dbCerts: ProfileSnapshot['dbCerts'],
): boolean {
  const code = (campus.code || '').trim();
  const verifyUrl = campus.verify_public_url || '';
  const pdfUrl = campus.api_pdf_download_url || '';
  const downloadUrl = campus.download_url || '';
  const normalizedTitle = normalizeTitle(campus.coursefullname || campus.certname);

  return dbCerts.some((cert) => {
    const credential = cert.credentialUrl || '';
    if (code && credential.includes(code)) return true;
    if (verifyUrl && credential === verifyUrl) return true;
    if (pdfUrl && credential === pdfUrl) return true;
    if (downloadUrl && credential === downloadUrl) return true;
    // fallback: normalized title match (weakest signal)
    if (normalizedTitle && normalizeTitle(cert.title) === normalizedTitle) return true;
    return false;
  });
}

function gobernaUsCertMatchesDb(
  cert: CertificacionesRecord,
  dbCerts: ProfileSnapshot['dbCerts'],
): boolean {
  const downloadUrl = (cert.download_url || '').trim();
  const verifyUrl = (cert.url_verificacion || '').trim();
  const normalizedTitle = normalizeTitle(cert.cert_name || cert.course_name);

  return dbCerts.some((dbCert) => {
    const credential = dbCert.credentialUrl || '';
    if (downloadUrl && credential === downloadUrl) return true;
    if (verifyUrl && credential === verifyUrl) return true;
    if (normalizedTitle && normalizeTitle(dbCert.title) === normalizedTitle) return true;
    return false;
  });
}

function describeCampusCert(cert: CampusCertificateRecord): string {
  const title = cert.coursefullname || cert.certname || 'Certificado';
  const code = cert.code ? ` [${cert.code}]` : '';
  return `${title}${code}`;
}

function describeGobernaUsCert(cert: CertificacionesRecord): string {
  return cert.cert_name || cert.course_name || cert.download_url || 'Certificado';
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('[abort] Missing DATABASE_URL. Configura el .env del backend antes de correr este script.');
    process.exit(2);
  }

  console.log('[1/4] Cargando perfiles desde la DB...');
  const profiles = await prisma.consultantProfile.findMany({
    include: {
      owner: { select: { id: true, email: true, firstName: true, lastName: true } },
      certificates: { select: { id: true, title: true, credentialUrl: true } },
    },
  });

  const snapshots: ProfileSnapshot[] = profiles.map((p) => ({
    profileId: p.id,
    userId: p.userId,
    email: (p.owner.email || '').toLowerCase(),
    fullName: `${p.owner.firstName} ${p.owner.lastName}`.trim(),
    dbCerts: p.certificates.map((c) => ({
      id: c.id,
      title: c.title,
      credentialUrl: c.credentialUrl,
    })),
  }));

  console.log(`       ${snapshots.length} perfiles cargados.`);

  console.log('[2/4] Pidiendo certificados del campus (una sola llamada)...');
  let campusCerts: CampusCertificateRecord[] = [];
  try {
    campusCerts = await fetchCampusCertificates();
  } catch (error) {
    console.error('[warn] No pude leer Campus API:', error instanceof Error ? error.message : error);
  }
  console.log(`       ${campusCerts.length} certificados recibidos del campus.`);

  // Group campus certs by normalized email
  const campusByEmail = new Map<string, CampusCertificateRecord[]>();
  for (const cert of campusCerts) {
    const key = (cert.email || '').toLowerCase().trim();
    if (!key) continue;
    if (!campusByEmail.has(key)) campusByEmail.set(key, []);
    campusByEmail.get(key)!.push(cert);
  }

  console.log(
    `[3/4] Consultando certificaciones.goberna.us para ${snapshots.length} perfiles (concurrencia=${PARALLEL_REQUESTS})...`,
  );
  let processed = 0;
  const gobernaUsResults = await mapLimit(snapshots, PARALLEL_REQUESTS, async (snapshot) => {
    if (!snapshot.email) {
      return { data: [] as CertificacionesRecord[], error: 'no-email' };
    }
    const result = await fetchCertificacionesForEmail(snapshot.email);
    processed += 1;
    if (processed % 25 === 0) {
      console.log(`       ${processed}/${snapshots.length} consultas completadas...`);
    }
    return result;
  });

  console.log('[4/4] Cruzando datos y construyendo reporte...');
  const reports: MissingReport[] = [];

  snapshots.forEach((snapshot, index) => {
    const campusForUser = campusByEmail.get(snapshot.email) || [];
    const { data: gobernaUsForUser, error: gobernaUsError } = gobernaUsResults[index];

    const missingFromCampus = campusForUser
      .filter((cert) => !campusCertMatchesDb(cert, snapshot.dbCerts))
      .map(describeCampusCert);

    const missingFromGobernaUs = gobernaUsForUser
      .filter((cert) => !gobernaUsCertMatchesDb(cert, snapshot.dbCerts))
      .map(describeGobernaUsCert);

    reports.push({
      email: snapshot.email,
      fullName: snapshot.fullName,
      dbCount: snapshot.dbCerts.length,
      campusCount: campusForUser.length,
      gobernaUsCount: gobernaUsForUser.length,
      missingFromCampus,
      missingFromGobernaUs,
      gobernaUsError,
    });
  });

  // ─── Summary ───
  const totalProfiles = reports.length;
  const profilesWithMissing = reports.filter(
    (r) => r.missingFromCampus.length > 0 || r.missingFromGobernaUs.length > 0,
  );
  const profilesMissingFromCampusOnly = reports.filter((r) => r.missingFromCampus.length > 0);
  const profilesMissingFromGobernaUsOnly = reports.filter((r) => r.missingFromGobernaUs.length > 0);
  const totalMissingCampusCerts = reports.reduce((acc, r) => acc + r.missingFromCampus.length, 0);
  const totalMissingGobernaUsCerts = reports.reduce((acc, r) => acc + r.missingFromGobernaUs.length, 0);
  const gobernaUsErrors = reports.filter((r) => r.gobernaUsError && r.gobernaUsError !== 'no-email');

  console.log('');
  console.log('==============================================================');
  console.log('                       RESUMEN GENERAL');
  console.log('==============================================================');
  console.log(`Perfiles auditados              : ${totalProfiles}`);
  console.log(`Perfiles con faltantes          : ${profilesWithMissing.length}`);
  console.log(`  - Faltantes desde Campus      : ${profilesMissingFromCampusOnly.length} perfiles / ${totalMissingCampusCerts} certs`);
  console.log(`  - Faltantes desde goberna.us  : ${profilesMissingFromGobernaUsOnly.length} perfiles / ${totalMissingGobernaUsCerts} certs`);
  console.log(`Errores API goberna.us          : ${gobernaUsErrors.length}`);
  console.log(`Total certificados en DB        : ${reports.reduce((acc, r) => acc + r.dbCount, 0)}`);
  console.log(`Total certs vistos en Campus    : ${reports.reduce((acc, r) => acc + r.campusCount, 0)}`);
  console.log(`Total certs vistos en goberna.us: ${reports.reduce((acc, r) => acc + r.gobernaUsCount, 0)}`);
  console.log('==============================================================');
  console.log('');

  // ─── Top cases ───
  const sorted = [...profilesWithMissing].sort((a, b) => {
    const aTotal = a.missingFromCampus.length + a.missingFromGobernaUs.length;
    const bTotal = b.missingFromCampus.length + b.missingFromGobernaUs.length;
    return bTotal - aTotal;
  });

  console.log('TOP 20 PERFILES CON MÁS FALTANTES:');
  console.log('');
  console.log(
    '| # | Email | Nombre | DB | Campus | goberna.us | Falt.Campus | Falt.goberna.us |',
  );
  console.log(
    '|---|-------|--------|----|--------|------------|-------------|-----------------|',
  );
  sorted.slice(0, 20).forEach((r, idx) => {
    console.log(
      `| ${idx + 1} | ${r.email} | ${r.fullName} | ${r.dbCount} | ${r.campusCount} | ${r.gobernaUsCount} | ${r.missingFromCampus.length} | ${r.missingFromGobernaUs.length} |`,
    );
  });

  console.log('');
  console.log('DETALLE DE LOS 10 PRIMEROS CON FALTANTES:');
  sorted.slice(0, 10).forEach((r, idx) => {
    console.log('');
    console.log(`${idx + 1}. ${r.fullName} <${r.email}>`);
    console.log(`   DB=${r.dbCount} · Campus=${r.campusCount} · goberna.us=${r.gobernaUsCount}`);
    if (r.missingFromCampus.length > 0) {
      console.log(`   Faltan desde Campus (${r.missingFromCampus.length}):`);
      r.missingFromCampus.forEach((m) => console.log(`     - ${m}`));
    }
    if (r.missingFromGobernaUs.length > 0) {
      console.log(`   Faltan desde goberna.us (${r.missingFromGobernaUs.length}):`);
      r.missingFromGobernaUs.forEach((m) => console.log(`     - ${m}`));
    }
  });

  if (gobernaUsErrors.length > 0) {
    console.log('');
    console.log('ERRORES goberna.us API (primeros 10):');
    gobernaUsErrors.slice(0, 10).forEach((r) => {
      console.log(`  - ${r.email}: ${r.gobernaUsError}`);
    });
  }

  // Emit full JSON for piping/archival
  const jsonOut = {
    generatedAt: new Date().toISOString(),
    matchingCriterion:
      'campus: code substring en credentialUrl > equality con verify_public_url/api_pdf_download_url/download_url > fallback título normalizado. goberna.us: equality download_url/url_verificacion > fallback título normalizado.',
    summary: {
      totalProfiles,
      profilesWithMissing: profilesWithMissing.length,
      profilesMissingFromCampus: profilesMissingFromCampusOnly.length,
      profilesMissingFromGobernaUs: profilesMissingFromGobernaUsOnly.length,
      totalMissingCampusCerts,
      totalMissingGobernaUsCerts,
      gobernaUsErrors: gobernaUsErrors.length,
    },
    reports: sorted,
  };
  console.log('');
  console.log('--- JSON_REPORT_BEGIN ---');
  console.log(JSON.stringify(jsonOut, null, 2));
  console.log('--- JSON_REPORT_END ---');
}

main()
  .catch(async (error) => {
    console.error('[fatal]', error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
