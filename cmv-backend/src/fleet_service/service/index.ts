import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma.js';
import { CostType, VehicleType } from '../../utils/types/index.js';

export const getVehicles = async (
  _: Request,
  response: Response,
): Promise<any> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        deleted: false,
      },
    });
    return response.status(200).json({ success: true, data: vehicles });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des véhicules',
    });
  }
};

export const getVehicle = async (
  request: Request,
  response: Response,
): Promise<any> => {
  try {
    const id = request.params.id;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: id },
    });

    if (!vehicle) {
      return response.status(404).json({
        success: false,
        message: 'Le véhicule n\'a pas était trouver',
      });
    }

    return response.status(200).json({
      success: true,
      data: vehicle,
    });

  } catch (e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du véhicule',
    });
  }
};

export const getCost = async (
  request: Request,
  response: Response,
): Promise<any> => {
  try {
    const id = request.params.id;
    const vehicleId = await prisma.vehicle.findUnique({
      where: { id: id },
    });

    if (!vehicleId) {
      return response.status(404).json({
        success: false,
        message: 'Le véhicule n\'a pas était trouver ',
      });
    }

    const vehicle = await prisma.cost.findMany({
      where: {
        vehicleId: vehicleId?.id,
        deleted: false,
      },
    });

    return response.status(200).json({ success: true, data: vehicle });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du véhicule',
    });
  }
};

export const createVehicle = async (
  request: Request,
  response: Response,
): Promise<any> => {
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
      },
    });

    return response.status(200).json({ success: true, data: newVehicle });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la creation du véhicule`,
    });
  }
};

export const createCost = async (
  request: Request,
  response: Response,
): Promise<any> => {
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

    return response.status(200).json({ success: true, data: newCost });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la creation d' un coût `,
    });
  }
};

export const updateVehicle = async (
  request: Request,
  response: Response,
): Promise<any> => {
  const id = request.params.id;

  try {
    const body = request.body as Partial<VehicleType>;
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!vehicle)
      return response.status(404).json({
        success: false,
        message: 'Le véhicule n\'a pas était trouver ',
      });

    const vehicleUpdate = await prisma.vehicle.update({
      where: {
        id: vehicle.id,
      },
      data: {
        ...body,
      },
    });

    return response.status(200).json({ success: true, data: vehicleUpdate });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la modification du véhicule ${id}`,
    });
  }
};

export const deleteVehicle = async (
  request: Request,
  response: Response,
): Promise<any> => {
  try {
    const id = request.params.id;

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: id,
      },
    });

    if (!vehicle)
      return response.status(404).json({
        success: false,
        message: 'Le véhicule n\'a pas etait trouver ',
      });

    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        deleted: true,
      },
    });

    return response.status(200).json({ success: true, message: 'Le vehicle a était supprimer' });


  } catch (error) {
    return response.status(500).json({
      success: false,
      message:
        'Une erreur est survenue lors de la suppression du vehicule',
    });
  }
};

export const deleteCost = async (
  request: Request,
  response: Response,
): Promise<any> => {
  try {
    const id = request.params.id;

    const cost = await prisma.cost.findUnique({
      where: {
        id: id,
      },
    });

    if (!cost)
      return response.status(404).json({
        success: false,
        message: 'Le coût n\'a pas etait trouver ',
      });

    await prisma.cost.update({
      where: { id: cost.id },
      data: {
        deleted: true,
      },
    });

    return response.status(200).json({ success: true, message: 'Le coût a était supprimer' });


  } catch (error) {
    return response.status(500).json({
      success: false,
      message:
        'Une erreur est survenue lors de la suppression du coût',
    });
  }
};
