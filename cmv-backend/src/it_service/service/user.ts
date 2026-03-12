import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { getCache, invalidateCache, setCache } from '../../utils/cache.js';
import prisma from '../../utils/prisma.js';
import type { UserType } from '../../utils/types/index.js';
import { sendemail } from './task.js';

export const getUsers = async (_: Request, response: Response): Promise<any> => {
  try {
    const cached = await getCache('users');
    if (cached) return response.status(200).json(cached);

    const users = await prisma.user.findMany({
      where: { firstname: { not: 'technique' }, deleted: false },
      include: { role: true, service: true },
    });

    const serializedUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const payload = { success: true, data: serializedUsers };
    await setCache('users', payload, 300);
    return response.status(200).json(payload);
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des utilisateurs',
    });
  }
};

export const getUser = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return response.status(404).json({
        success: false,
        message: "L'utilisateur n'a pas était trouver",
      });
    }

    const { password, ...userWithoutPassword } = user;

    return response.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération de l'utilisateur",
    });
  }
};

export const getRoles = async (_: Request, response: Response): Promise<any> => {
  try {
    const cached = await getCache('roles');
    if (cached) return response.status(200).json(cached);

    const role = await prisma.role.findMany();
    const payload = { success: true, data: role };
    await setCache('roles', payload, 3600); // 1 heure — données très statiques
    return response.status(200).json(payload);
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des roles',
    });
  }
};

export const createUser = async (request: Request, response: Response): Promise<any> => {
  const body = request.body as UserType;

  try {
    const passwordHash = await bcrypt.hash(body.password, 10);
    const role = await prisma.role.findUnique({
      where: {
        id: body.roleId,
      },
    });

    const service = await prisma.service.findUnique({
      where: {
        id: body.serviceId,
      },
    });
    const user = await prisma.user.create({
      data: {
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        password: passwordHash,
        status: body.status,
        roleId: role?.id,
        serviceId: service?.id,
      },
    });
    const { password, ...userWithoutPassword } = user;
    //Todo: Send a email with mdp to user

    sendemail(
      'password.edge',
      { user: user, password: body.password },
      user.email,
      'Mot de passe temporaire pour première connexion',
      response
    );

    await invalidateCache('users');
    return response.status(200).json({ success: true, data: userWithoutPassword });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la creation de utilisateurs',
    });
  }
};

export const updateUsers = async (request: Request, response: Response): Promise<any> => {
  const body = request.body;
  const id = request.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user)
      return response.status(404).json({
        success: false,
        message: "L'utilisateur n'a pas etait trouver ",
      });

    const userUpdate = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        roleId: body.roleId,
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        status: body.status,
        serviceId: body.serviceId,
        isChangePassword: body.ischangePassword,
      },
      include: {
        role: true,
        service: true,
      },
    });

    const { password, ...userWithoutPassword } = userUpdate;
    await invalidateCache('users', `user:${id}`);
    return response.status(200).json({ success: true, data: userWithoutPassword });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la modification de utilisateurs ${id}`,
    });
  }
};

export const getServices = async (_: Request, response: Response): Promise<any> => {
  try {
    const cached = await getCache('services');
    if (cached) return response.status(200).json(cached);

    const services = await prisma.service.findMany();
    const payload = { success: true, data: services };
    await setCache('services', payload, 3600);
    return response.status(200).json(payload);
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des services',
    });
  }
};

export const getPermissions = async (_: Request, response: Response): Promise<any> => {
  try {
    const cached = await getCache('permissions');
    if (cached) return response.status(200).json(cached);

    const permissions = await prisma.permissionOnRole.findMany({
      include: {
        permission: true,
        role: true,
      },
    });

    const formattedData: Record<string, Record<string, string[]>> = {};

    for (const { role, permission } of permissions) {
      const roleName = role.name;
      const entityName = permission.resource;
      const action = permission.action;

      if (!formattedData[roleName]) {
        formattedData[roleName] = {};
      }

      if (!formattedData[roleName][entityName]) {
        formattedData[roleName][entityName] = [];
      }

      if (!formattedData[roleName][entityName].includes(action)) {
        formattedData[roleName][entityName].push(action);
      }
    }

    const payload = { success: true, data: formattedData };
    await setCache('permissions', payload, 3600);
    return response.status(200).json(payload);
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des services',
    });
  }
};

export const deleteUser = async (request: Request, response: Response): Promise<any> => {
  try {
    const id = request.params.id;

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user)
      return response.status(404).json({
        success: false,
        message: "L'utilisateur n'a pas etait trouver ",
      });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        deleted: true,
      },
    });

    await invalidateCache('users', `user:${id}`);
    return response.status(200).json({ success: true, message: 'Utilisateur supprimer' });
  } catch (_error) {
    return response.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la suppression de l'utilisateur",
    });
  }
};

export const createRole = async (request: Request, response: Response): Promise<any> => {
  try {
    const { name } = request.body as { name: string };
    const role = await prisma.role.create({
      data: {
        name: name,
      },
    });

    await invalidateCache('roles');
    return response.status(200).json({ success: true, data: role });
  } catch (_e) {
    return response.status(400).json({
      success: false,
      message: 'Une erreur est survenue lors de la creation du role',
    });
  }
};

export const createService = async (request: Request, response: Response): Promise<any> => {
  try {
    const { name } = request.body as { name: string };
    const service = await prisma.service.create({
      data: {
        name: name,
      },
    });

    await invalidateCache('services');
    return response.status(200).json({ success: true, data: service });
  } catch (_e) {
    return response.status(400).json({
      success: false,
      message: 'Une erreur est survenue lors de la creation du service',
    });
  }
};

export const createOrUpdatePermissions = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    // Récupération des données envoyées dans le corps de la requête
    const body = request.body as {
      roleId: string; // Identifiant du rôle
      permissions: { resource: string; actions: string[] }[]; // Liste de ressources et des actions pour chaque ressource
    };

    const { roleId, permissions } = body;

    // Validation des entrées
    if (!roleId || !permissions || !Array.isArray(permissions)) {
      return response.status(400).json({
        success: false,
        message: 'Le rôle et les permissions doivent être correctement définis',
      });
    }

    // Vérification si le rôle existe
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return response.status(404).json({
        success: false,
        message: "Le rôle spécifié n'existe pas",
      });
    }

    // Parcourir chaque permission envoyée dans le corps de la requête
    for (const { resource, actions } of permissions) {
      // Vérification et suppression des actions existantes pour la ressource
      await prisma.permissionOnRole.deleteMany({
        where: {
          roleId,
          permission: {
            resource,
          },
        },
      });

      // Ajout ou mise à jour des nouvelles actions pour la ressource
      for (const action of actions) {
        // Chercher l'autorisation spécifique dans la table des permissions
        let permission = await prisma.permission.findFirst({
          where: { resource, action },
        });

        // Si la permission n'existe pas, on le cree
        permission = await prisma.permission.upsert({
          where: {
            action_resource_unique: {
              action: action,
              resource: resource,
            },
          },
          create: {
            action: action,
            resource: resource,
          },
          update: {},
        });

        // Créer un lien entre le rôle et la permission
        await prisma.permissionOnRole.create({
          data: {
            roleId,
            permissionId: permission?.id,
          },
        });
      }
    }

    await invalidateCache('permissions');
    return response.status(200).json({
      success: true,
      message: 'Permissions mises à jour avec succès pour le rôle',
    });
  } catch (e) {
    console.error(e);
    return response.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'enregistrement des permissions",
    });
  }
};
