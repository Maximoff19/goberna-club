import { z } from 'zod';

function csvToArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(',')).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export const consultantsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(25).default(25),
  q: z.string().optional(),
  countries: z.preprocess(csvToArray, z.array(z.string()).default([])),
  languages: z.preprocess(csvToArray, z.array(z.string()).default([])),
  specialties: z.preprocess(csvToArray, z.array(z.string()).default([])),
  skills: z.preprocess(csvToArray, z.array(z.string()).default([])),
  modality: z.string().optional(),
  minExperience: z.coerce.number().int().min(0).max(80).optional(),
  sort: z.string().optional(),
  featured: z.string().optional(),
});
