import { z } from 'zod';

export const createResourceSchema = z.object({
  type: z.string().min(1).max(100),
  resource: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  purchase_date: z.string().max(50),
  supplier: z.string().min(1).max(200),
  expired_at: z.string().max(50),
});

export const resourceSchema = z.object({
  type: z.string().min(1).max(100),
  resource: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  purchase_date: z.coerce.date(),
  supplier: z.string().min(1).max(200),
  expired_at: z.coerce.date(),
});
