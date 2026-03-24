import { z } from 'zod';

export const createVehicleSchema = z.object({
  brand: z.string().describe('Marque'),
  state: z.enum(['AVAILABLE', 'IN_USE', 'IN_REPAIR']).describe('État'),
  kilometres: z.string().describe('Kilométrage'),
  model: z.string().describe('Modèle'),
  year: z.number().describe('Année'),
  maintenance_date: z.coerce.date().describe('Date de maintenance'),
  date_circulation: z.coerce.date().optional().describe('Date de circulation'),
  carburant: z.string().optional().describe('Carburant'),
  usage: z.string().optional().describe('Usage'),
  km_moyen_annuel: z.number().optional().describe('Km moyen annuel'),
  km_derniere_revision: z.number().optional().describe('Km dernière révision'),
  jours_depuis_derniere_revision: z.number().optional().describe('Jours depuis dernière révision'),
  km_depuis_derniere_revision: z.number().optional().describe('Km depuis dernière révision'),
  nb_revisions_effectuees: z.number().optional().describe('Nb révisions effectuées'),
  intervalle_recommande_jours: z.number().optional().describe('Intervalle recommandé (jours)'),
  intervalle_recommande_km: z.number().optional().describe('Intervalle recommandé (km)'),
  condition_vehicule: z.number().optional().describe('Condition du véhicule'),
  nb_pannes_historique: z.number().optional().describe('Nb pannes historique'),
  age_vehicule: z.number().optional().describe('Âge du véhicule'),
  taux_utilisation_km: z.number().optional().describe('Taux utilisation km'),
  taux_utilisation_jours: z.number().optional().describe('Taux utilisation jours'),
  revisions_par_an: z.number().optional().describe('Révisions par an'),
});

export const createCostSchema = z.object({
  vehicleId: z.string().describe('Véhicule'),
  description: z.string().describe('Description'),
  cost: z.string().describe('Coût'),
  maintenance_date: z.coerce.date().describe('Date de maintenance'),
});
