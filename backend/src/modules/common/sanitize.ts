export function sanitizeText(value: string | undefined | null) {
  if (!value) {
    return undefined;
  }

  return value.trim().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
}

export function createSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
