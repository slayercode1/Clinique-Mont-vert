import type { Request, Response } from 'express';
import { getCache, invalidateCache, setCache } from '../../utils/cache.js';
import prisma from '../../utils/prisma.js';
import type { CostType, VehicleType } from '../../utils/types/index.js';

const TTL = 300;

export const getVehicles = async (_: Request, response: Response): Promise<any> => {
  try {
    const cached = await getCache('vehicles');
    if (cached) return response.status(200).json(cached);

    const vehicles = await prisma.vehicle.findMany({ where: { deleted: false } });
    const payload = { success: true, data: vehicles };
    await setCache('vehicles', payload, TTL);
    return response.status(200).json(payload);
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des véhicules',
    });
  }
};

export const getVehicle = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      return response.status(404).json({
        success: false,
        message: "Le véhicule n'a pas été trouvé",
      });
    }

    return response.status(200).json({ success: true, data: vehicle });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du véhicule',
    });
  }
};

export const getCost = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;
    const vehicleExists = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicleExists) {
      return response.status(404).json({
        success: false,
        message: "Le véhicule n'a pas été trouvé",
      });
    }

    const costs = await prisma.cost.findMany({
      where: { vehicleId: vehicleExists.id, deleted: false },
    });

    return response.status(200).json({ success: true, data: costs });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des coûts',
    });
  }
};

export const createVehicle = async (request: Request, response: Response): Promise<any> => {
  try {
    const body = request.body as VehicleType;
    const newVehicle = await prisma.vehicle.create({
      data: {
        brand: body.brand,
        state: body.state,
        kilometres: body.kilometres,
        model: body.model,
        year: body.year,
        maintenance_date: body.maintenance_date,
        date_circulation: body.date_circulation,
        carburant: body.carburant,
        usage: body.usage,
        km_moyen_annuel: body.km_moyen_annuel,
        km_derniere_revision: body.km_derniere_revision,
        jours_depuis_derniere_revision: body.jours_depuis_derniere_revision,
        km_depuis_derniere_revision: body.km_depuis_derniere_revision,
        nb_revisions_effectuees: body.nb_revisions_effectuees,
        intervalle_recommande_jours: body.intervalle_recommande_jours,
        intervalle_recommande_km: body.intervalle_recommande_km,
        condition_vehicule: body.condition_vehicule,
        nb_pannes_historique: body.nb_pannes_historique,
        age_vehicule: body.age_vehicule,
        taux_utilisation_km: body.taux_utilisation_km,
        taux_utilisation_jours: body.taux_utilisation_jours,
        revisions_par_an: body.revisions_par_an,
      },
    });

    await invalidateCache('vehicles');
    return response.status(200).json({ success: true, data: newVehicle });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création du véhicule',
    });
  }
};

export const createCost = async (request: Request, response: Response): Promise<any> => {
  try {
    const body = request.body as CostType;
    const newCost = await prisma.cost.create({
      data: {
        vehicleId: body.vehicleId,
        description: body.description,
        cost: body.cost,
        maintenance_date: body.maintenance_date,
      },
    });

    await invalidateCache(`vehicle_cost:${newCost.vehicleId}`);
    return response.status(200).json({ success: true, data: newCost });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la création d'un coût",
    });
  }
};

export const updateVehicle = async (request: Request, response: Response): Promise<any> => {
  const id = request.params.id;
  try {
    const body = request.body as Partial<VehicleType>;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle)
      return response.status(404).json({
        success: false,
        message: "Le véhicule n'a pas été trouvé",
      });

    const vehicleUpdate = await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        brand: body.brand,
        model: body.model,
        year: body.year,
        state: body.state,
        maintenance_date: body.maintenance_date,
        kilometres: body.kilometres,
        date_circulation: body.date_circulation,
        carburant: body.carburant,
        usage: body.usage,
        km_moyen_annuel: body.km_moyen_annuel,
        km_derniere_revision: body.km_derniere_revision,
        jours_depuis_derniere_revision: body.jours_depuis_derniere_revision,
        km_depuis_derniere_revision: body.km_depuis_derniere_revision,
        nb_revisions_effectuees: body.nb_revisions_effectuees,
        intervalle_recommande_jours: body.intervalle_recommande_jours,
        intervalle_recommande_km: body.intervalle_recommande_km,
        condition_vehicule: body.condition_vehicule,
        nb_pannes_historique: body.nb_pannes_historique,
        age_vehicule: body.age_vehicule,
        taux_utilisation_km: body.taux_utilisation_km,
        taux_utilisation_jours: body.taux_utilisation_jours,
        revisions_par_an: body.revisions_par_an,
      },
    });

    await invalidateCache('vehicles', `vehicle:${id}`);
    return response.status(200).json({ success: true, data: vehicleUpdate });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la modification du véhicule',
    });
  }
};

export const deleteVehicle = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle)
      return response.status(404).json({
        success: false,
        message: "Le véhicule n'a pas été trouvé",
      });

    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { deleted: true },
    });

    await invalidateCache('vehicles', `vehicle:${id}`);
    return response.status(200).json({ success: true, message: 'Le véhicule a été supprimé' });
  } catch (_error) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la suppression du véhicule',
    });
  }
};

export const predictBreakdown = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      return response.status(404).json({
        success: false,
        message: "Le véhicule n'a pas été trouvé",
      });
    }

    const carburantFactorMap: Record<string, number> = {
      Essence: 1.0,
      Diesel: 1.1,
      Hybride: 1.2,
      Électrique: 1.5,
      Electrique: 1.5,
    };

    const usageFactorMap: Record<string, number> = {
      Flotte: 0.8,
      Professionnel: 0.9,
      Personnel: 1.2,
    };

    const payload = {
      km_actuel: Number.parseFloat(vehicle.kilometres) || 0,
      km_moyen_annuel: vehicle.km_moyen_annuel ?? 0,
      km_derniere_revision: vehicle.km_derniere_revision ?? 0,
      jours_depuis_derniere_revision: vehicle.jours_depuis_derniere_revision ?? 0,
      km_depuis_derniere_revision: vehicle.km_depuis_derniere_revision ?? 0,
      nb_revisions_effectuees: vehicle.nb_revisions_effectuees ?? 0,
      intervalle_recommande_jours: vehicle.intervalle_recommande_jours ?? 365,
      intervalle_recommande_km: vehicle.intervalle_recommande_km ?? 15000,
      condition_vehicule: vehicle.condition_vehicule ?? 5,
      nb_pannes_historique: vehicle.nb_pannes_historique ?? 0,
      age_vehicule: vehicle.age_vehicule ?? 0,
      taux_utilisation_km: vehicle.taux_utilisation_km ?? 1.0,
      taux_utilisation_jours: vehicle.taux_utilisation_jours ?? 1.0,
      revisions_par_an: vehicle.revisions_par_an ?? 1.0,
      Carburant_Factor: carburantFactorMap[vehicle.carburant ?? 'Essence'] ?? 1.0,
      Usage_Factor: usageFactorMap[vehicle.usage ?? 'Personnel'] ?? 1.2,
    };

    const predictionUrl = process.env.PREDICTION_API_URL || 'http://localhost:8000';
    const predictionResponse = await fetch(`${predictionUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!predictionResponse.ok) {
      return response.status(502).json({
        success: false,
        message: "Erreur lors de l'appel au service de prédiction",
      });
    }

    const predictionData = await predictionResponse.json();

    await prisma.vehicle.update({
      where: { id },
      data: {
        prediction_estimation_jours: predictionData.estimation_jours,
        prediction_estimation_mois: predictionData.estimation_mois,
        prediction_fourchette_min_mois: predictionData.fourchette_min_mois,
        prediction_fourchette_max_mois: predictionData.fourchette_max_mois,
        prediction_recommandation: predictionData.recommandation,
        prediction_date: new Date(),
      },
    });

    return response.status(200).json({ success: true, data: predictionData });
  } catch (e) {
    console.error('Prediction error:', e);
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la prédiction',
    });
  }
};

export const deleteCost = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;
    const cost = await prisma.cost.findUnique({ where: { id } });

    if (!cost)
      return response.status(404).json({
        success: false,
        message: "Le coût n'a pas été trouvé",
      });

    await prisma.cost.update({
      where: { id: cost.id },
      data: { deleted: true },
    });

    await invalidateCache(`vehicle_cost:${cost.vehicleId}`);
    return response.status(200).json({ success: true, message: 'Le coût a été supprimé' });
  } catch (_error) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la suppression du coût',
    });
  }
};
