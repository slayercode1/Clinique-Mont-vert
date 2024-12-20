import { z } from 'zod';

export const createResourceSchema = z.object({
  type: z.string(),
  resource: z.string(),
  location: z.string(),
  purchase_date: z.string(),
  supplier: z.string(),
  expired_at: z.string(),
});

export const resourceSchema = z.object({
  type: z.string(),
  resource: z.string(),
  location: z.string(),
  purchase_date: z.coerce.date(),
  supplier: z.string(),
  expired_at: z.coerce.date(),
});
