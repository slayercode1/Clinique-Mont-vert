import { z } from 'zod';

export const createVehicleSchema = z.object({
  brand: z.string().describe('Marque'),
  state: z.enum(['AVAILABLE', 'IN_USE', 'IN_REPAIR']).describe('État'),
  kilometres: z.string().describe('Kilométrage'),
  model: z.string().describe('Modèle'),
  year: z.number().describe('Année'),
  maintenance_date: z.coerce.date().describe('Date de maintenance'),
});

export const createCostSchema = z.object({
  vehicleId: z.string().describe('Véhicule'),
  description: z.string().describe('Description'),
  cost: z.string().describe('Coût'),
  maintenance_date: z.coerce.date().describe('Date de maintenance'),
});
