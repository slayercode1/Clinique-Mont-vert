import prisma from '../../utils/prisma.js';
// Middleware RBAC (Contrôle d'accès basé sur les rôles)
export const RBAC = (action, resource) => {
    return async (request, response, next) => {
        try {
            const user = request.user;
            const userRoleId = user ? user.role.id : 'anonymous';
            const userPermissions = await prisma.permissionOnRole.findMany({
                where: {
                    roleId: userRoleId,
                },
                include: {
                    permission: true,
                },
            });
            // Vérifier si l'utilisateur a la permission spécifique
            const hasPermission = userPermissions.some((rolePermission) => rolePermission.permission.action === action &&
                rolePermission.permission.resource === resource);
            if (hasPermission) {
                return next();
            }
            else {
                response.status(403).json({ success: false, message: 'Access denied' });
            }
        }
        catch (error) {
            next(error);
        }
    };
};
