import type { Request, Response } from 'express';
import { getCache, invalidateCache, setCache } from '../../utils/cache.js';
import prisma from '../../utils/prisma.js';
import type { ResourceType } from '../../utils/types/index.js';

const TTL = 300; // 5 minutes

export const getResources = async (_: Request, response: Response): Promise<any> => {
  try {
    const cached = await getCache('resources');
    if (cached) return response.status(200).json(cached);

    const resources = await prisma.material.findMany({ where: { deleted: false } });
    const payload = { success: true, data: resources };
    await setCache('resources', payload, TTL);
    return response.status(200).json(payload);
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des ressources',
    });
  }
};

export const getResource = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;
    const cached = await getCache(`resource:${id}`);
    if (cached) return response.status(200).json(cached);

    const resource = await prisma.material.findUnique({ where: { id } });
    if (!resource) {
      return response
        .status(404)
        .json({ success: false, message: "La resource n'a pas était trouver" });
    }

    const payload = { success: true, data: resource };
    await setCache(`resource:${id}`, payload, TTL);
    return response.status(200).json(payload);
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération de la resource',
    });
  }
};

export const createResource = async (request: Request, response: Response): Promise<any> => {
  try {
    const body = request.body as ResourceType;
    const newResource = await prisma.material.create({
      data: {
        type: body.type,
        resource: body.resource,
        purchase_date: body.purchase_date,
        location: body.location,
        supplier: body.supplier,
        expired_at: body.expired_at,
        state: 'IN_USE',
      },
    });

    await invalidateCache('resources');
    return response.status(200).json({ success: true, data: newResource });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la creation de la ressource',
    });
  }
};

export const updateResource = async (request: Request, response: Response): Promise<any> => {
  const id = request.params.id;
  try {
    const body = request.body as Partial<ResourceType>;
    const resource = await prisma.material.findUnique({
      where: {
        id,
      },
    });

    if (!resource)
      return response.status(404).json({
        success: false,
        message: "La ressource n'a pas etait trouver ",
      });

    const resourceUpdate = await prisma.material.update({
      where: {
        id: resource.id,
      },
      data: {
        ...body,
      },
    });

    await invalidateCache('resources', `resource:${id}`);
    return response.status(200).json({ success: true, data: resourceUpdate });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la modification de la ressource ${id}`,
    });
  }
};

export const deleteResouce = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;

    const material = await prisma.material.findUnique({
      where: {
        id: id,
      },
    });

    if (!material)
      return response.status(404).json({
        success: false,
        message: "La ressource n'a pas etait trouver ",
      });

    await prisma.material.update({
      where: { id: material.id },
      data: {
        deleted: true,
      },
    });

    await invalidateCache('resources', `resource:${id}`);
    return response.status(200).json({ success: true, message: 'La ressource a était supprimer' });
  } catch (_error) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la suppression de la ressource',
    });
  }
};
