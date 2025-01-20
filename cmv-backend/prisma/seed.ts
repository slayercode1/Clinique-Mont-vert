import * as bcrypt from 'bcrypt';
import prisma from './prisma';

async function createRoles() {
  // Crée les rôles
  await prisma.role.createMany({
    data: [
      { name: 'IT_USER' },
      { name: 'IT_ADMIN' },
      { name: 'FLEET_USER' },
      { name: 'FLEET_ADMIN' },
      { name: 'SuperAdmin' },
    ],
  });

  // Récupère l'ID du rôle 'SuperAdmin'
  return await prisma.role.findFirst({
    where: { name: 'SuperAdmin' },
  });
}

async function createPermission() {
  const permissions = [
    { action: 'read', resource: 'vehicle' },
    { action: 'read', resource: 'vehicle_detail' },
    { action: 'read', resource: 'cost' },
    { action: 'read', resource: 'ticket' },
    { action: 'read', resource: 'user' },
    { action: 'read', resource: 'resource' },
    { action: 'read', resource: 'permission' },

    { action: 'add', resource: 'ticket' },
    { action: 'add', resource: 'vehicle' },
    { action: 'add', resource: 'cost_vehicle' },
    { action: 'add', resource: 'user' },
    { action: 'add', resource: 'resource' },
    { action: 'add', resource: 'permission' },

    { action: 'edit', resource: 'vehicle' },
    { action: 'edit', resource: 'ticket' },
    { action: 'edit', resource: 'user' },
    { action: 'edit', resource: 'resource' },
    { action: 'edit', resource: 'ticket_detail' },

    { action: 'delete', resource: 'vehicle' },
    { action: 'delete', resource: 'user' },
    { action: 'delete', resource: 'resource' },
    { action: 'delete', resource: 'cost' },
  ];

  // Utilisation de upsert pour éviter les erreurs de duplicata
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        action_resource_unique: {
          action: permission.action,
          resource: permission.resource,
        },
      },
      update: {}, // Pas besoin de mettre à jour quoi que ce soit si trouvé
      create: permission,
    });
  }
}
// Fonction principale pour exécuter le script
async function main() {
  const superAdminRole = await createRoles();
  await createPermission();

  // Récupère toutes les permissions
  const permissions = await prisma.permission.findMany();

  // Associe chaque permission au rôle SuperAdmin
  const permissionOnRolesData = permissions.map((permission) => ({
    roleId: superAdminRole!.id,
    permissionId: permission.id,
  }));

  await prisma.permissionOnRole.createMany({
    data: permissionOnRolesData,
  });

  const service = await prisma.service.create({
    data: {
      name: 'Directeur',
    },
  });

  // Hachage d'un mot de passe par défaut pour l'utilisateur administrateur
  const passwordHash = await bcrypt.hash('Jx8QKYJ3Jqgz?sPn#n', 10);
  // Création d'un utilisateur avec le rôle IT_ADMIN
  await prisma.user.create({
    data: {
      firstname: 'technique',
      lastname: 'support',
      email: 'support@technique.com',
      password: passwordHash,
      status: 'ACTIF',
      roleId: superAdminRole!.id,
      serviceId: service.id,
    },
  });
  return;
}

// Exécution du script principal
main()
  .then(async () => {
    // Déconnexion de Prisma après la fin du script
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // Gestion des erreurs et déconnexion de Prisma
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
