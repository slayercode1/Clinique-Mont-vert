import { z } from 'zod';

export const createVehicleSchema = z.object({
  brand: z.string().min(1).max(100),
  state: z.enum(['AVAILABLE', 'IN_USE', 'IN_REPAIR']),
  kilometres: z.string().max(20),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(2100),
  maintenance_date: z.coerce.date(),
  date_circulation: z.coerce.date().optional(),
  carburant: z.string().max(50).optional(),
  usage: z.string().max(50).optional(),
  km_moyen_annuel: z.number().optional(),
  km_derniere_revision: z.number().optional(),
  jours_depuis_derniere_revision: z.number().int().optional(),
  km_depuis_derniere_revision: z.number().optional(),
  nb_revisions_effectuees: z.number().int().optional(),
  intervalle_recommande_jours: z.number().int().optional(),
  intervalle_recommande_km: z.number().optional(),
  condition_vehicule: z.number().int().min(1).max(10).optional(),
  nb_pannes_historique: z.number().int().optional(),
  age_vehicule: z.number().int().optional(),
  taux_utilisation_km: z.number().optional(),
  taux_utilisation_jours: z.number().optional(),
  revisions_par_an: z.number().optional(),
});

export const createCostSchema = z.object({
  vehicleId: z.string().max(100),
  description: z.string().min(1).max(500),
  cost: z.string().max(20),
  maintenance_date: z.coerce.date(),
});
