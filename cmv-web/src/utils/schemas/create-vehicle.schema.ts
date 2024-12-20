import { z } from 'zod';

export const createVehicleSchema = z.object({
  brand: z.string(),
  state: z.enum(['AVAILABLE', 'IN_USE', 'IN_REPAIR']),
  kilometres: z.string(),
  model: z.string(),
  year: z.number(),
  maintenance_date: z.coerce.date(),
});

export const createCostSchema = z.object({
  vehicleId: z.string(),
  description: z.string(),
  cost: z.string(),
  maintenance_date: z.coerce.date(),
});
