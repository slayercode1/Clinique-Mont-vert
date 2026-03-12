import { z } from 'zod';

export const createVehicleSchema = z.object({
  brand: z.string().min(1).max(100),
  state: z.enum(['AVAILABLE', 'IN_USE', 'IN_REPAIR']),
  kilometres: z.string().max(20),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(2100),
  maintenance_date: z.coerce.date(),
});

export const createCostSchema = z.object({
  vehicleId: z.string().max(100),
  description: z.string().min(1).max(500),
  cost: z.string().max(20),
  maintenance_date: z.coerce.date(),
});
