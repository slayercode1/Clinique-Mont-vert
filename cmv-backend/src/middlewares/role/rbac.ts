import type { NextFunction, Request, RequestHandler, Response } from 'express';
import prisma from '../../utils/prisma.js';

export const RBAC = (action: string, resource: string): RequestHandler => {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = (request as any).user;
      if (!currentUser?.id) {
        response.status(401).json({ success: false, message: 'Non autorisé' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { roleId: true },
      });

      if (!user) {
        response.status(401).json({ success: false, message: 'Utilisateur introuvable' });
        return;
      }

      const userPermissions = await prisma.permissionOnRole.findMany({
        where: { roleId: user.roleId },
        include: { permission: true },
      });

      const hasPermission = userPermissions.some(
        (rolePermission: any) =>
          rolePermission.permission.action === action &&
          rolePermission.permission.resource === resource
      );

      if (hasPermission) {
        return next();
      }
      response.status(403).json({ success: false, message: 'Accès refusé' });
    } catch (error) {
      next(error);
    }
  };
};
