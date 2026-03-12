import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import pg from 'pg';
dotenv.config({ quiet: true });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function createRoles() {
  await prisma.role.createMany({
    data: [
      { name: 'IT_USER' },
      { name: 'IT_ADMIN' },
      { name: 'FLEET_USER' },
      { name: 'FLEET_ADMIN' },
      { name: 'SuperAdmin' },
    ],
  });
  return await prisma.role.findMany();
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

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        action_resource_unique: {
          action: permission.action,
          resource: permission.resource,
        },
      },
      update: {},
      create: permission,
    });
  }
}

async function createServices() {
  const serviceNames = [
    'Direction',
    'Informatique',
    'Ressources Humaines',
    'Comptabilité',
    'Logistique',
    'Médecine Générale',
    'Chirurgie',
    'Radiologie',
  ];
  const services = [];
  for (const name of serviceNames) {
    const s = await prisma.service.create({ data: { name } });
    services.push(s);
  }
  return services;
}

async function main() {
  const roles = await createRoles();
  await createPermission();

  const superAdminRole = roles.find((r) => r.name === 'SuperAdmin')!;
  const itAdminRole = roles.find((r) => r.name === 'IT_ADMIN')!;
  const itUserRole = roles.find((r) => r.name === 'IT_USER')!;
  const fleetAdminRole = roles.find((r) => r.name === 'FLEET_ADMIN')!;
  const fleetUserRole = roles.find((r) => r.name === 'FLEET_USER')!;

  // Associe toutes les permissions au rôle SuperAdmin
  const permissions = await prisma.permission.findMany();
  const permissionOnRolesData = permissions.map((permission) => ({
    roleId: superAdminRole.id,
    permissionId: permission.id,
  }));
  await prisma.permissionOnRole.createMany({ data: permissionOnRolesData });

  // Services
  const services = await createServices();
  const sDirection = services[0];
  const sInfo = services[1];
  const sRH = services[2];
  const sCompta = services[3];
  const sLogistique = services[4];
  const sMedecine = services[5];
  const sChirurgie = services[6];
  const sRadio = services[7];

  const pwd = await bcrypt.hash('Password123!', 10);

  // Utilisateurs
  const usersData = [
    {
      firstname: 'Jean',
      lastname: 'Dupont',
      email: 'admin@cmv.re',
      roleId: superAdminRole.id,
      serviceId: sDirection.id,
    },
    {
      firstname: 'Marie',
      lastname: 'Rivière',
      email: 'marie.riviere@cmv.re',
      roleId: itAdminRole.id,
      serviceId: sInfo.id,
    },
    {
      firstname: 'Paul',
      lastname: 'Hoarau',
      email: 'paul.hoarau@cmv.re',
      roleId: itUserRole.id,
      serviceId: sInfo.id,
    },
    {
      firstname: 'Sophie',
      lastname: 'Payet',
      email: 'sophie.payet@cmv.re',
      roleId: fleetAdminRole.id,
      serviceId: sLogistique.id,
    },
    {
      firstname: 'Lucas',
      lastname: 'Grondin',
      email: 'lucas.grondin@cmv.re',
      roleId: fleetUserRole.id,
      serviceId: sLogistique.id,
    },
    {
      firstname: 'Claire',
      lastname: 'Fontaine',
      email: 'claire.fontaine@cmv.re',
      roleId: itUserRole.id,
      serviceId: sRH.id,
    },
    {
      firstname: 'Thomas',
      lastname: 'Bénard',
      email: 'thomas.benard@cmv.re',
      roleId: itUserRole.id,
      serviceId: sCompta.id,
    },
    {
      firstname: 'Nathalie',
      lastname: 'Morel',
      email: 'nathalie.morel@cmv.re',
      roleId: itUserRole.id,
      serviceId: sMedecine.id,
    },
    {
      firstname: 'David',
      lastname: 'Robert',
      email: 'david.robert@cmv.re',
      roleId: itUserRole.id,
      serviceId: sChirurgie.id,
    },
    {
      firstname: 'Isabelle',
      lastname: 'Dijoux',
      email: 'isabelle.dijoux@cmv.re',
      roleId: itUserRole.id,
      serviceId: sRadio.id,
    },
    {
      firstname: 'technique',
      lastname: 'support',
      email: 'support@technique.com',
      roleId: superAdminRole.id,
      serviceId: sDirection.id,
    },
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: { ...u, password: pwd, status: 'ACTIF', isChangePassword: false },
    });
    users.push(user);
  }

  const marie = users[1];
  const paul = users[2];
  const claire = users[5];
  const thomas = users[6];
  const nathalie = users[7];
  const david = users[8];
  const isabelle = users[9];

  // Matériel IT
  const materialsData = [
    {
      type: 'Ordinateur',
      resource: 'Dell OptiPlex 7090',
      location: 'Bureau 101 - Direction',
      state: 'IN_USE' as const,
      purchase_date: new Date('2024-01-15'),
      supplier: 'Dell France',
      expired_at: new Date('2027-01-15'),
    },
    {
      type: 'Ordinateur',
      resource: 'HP EliteBook 840',
      location: 'Bureau 201 - RH',
      state: 'IN_USE' as const,
      purchase_date: new Date('2024-03-10'),
      supplier: 'HP France',
      expired_at: new Date('2027-03-10'),
    },
    {
      type: 'Imprimante',
      resource: 'HP LaserJet Pro M404',
      location: 'Salle copie RDC',
      state: 'IN_USE' as const,
      purchase_date: new Date('2023-06-20'),
      supplier: 'HP France',
      expired_at: new Date('2026-06-20'),
    },
    {
      type: 'Imprimante',
      resource: 'Brother MFC-L8900CDW',
      location: 'Salle copie 1er étage',
      state: 'IN_REPAIR' as const,
      purchase_date: new Date('2023-09-05'),
      supplier: 'Brother France',
      expired_at: new Date('2026-09-05'),
    },
    {
      type: 'Serveur',
      resource: 'Dell PowerEdge R750',
      location: 'Salle serveur',
      state: 'IN_USE' as const,
      purchase_date: new Date('2023-01-10'),
      supplier: 'Dell France',
      expired_at: new Date('2028-01-10'),
    },
    {
      type: 'Écran',
      resource: 'Dell U2722D 27"',
      location: 'Bureau 102 - Comptabilité',
      state: 'IN_USE' as const,
      purchase_date: new Date('2024-02-28'),
      supplier: 'Dell France',
      expired_at: new Date('2027-02-28'),
    },
    {
      type: 'Téléphone',
      resource: 'Cisco IP Phone 8845',
      location: 'Accueil',
      state: 'IN_USE' as const,
      purchase_date: new Date('2023-11-15'),
      supplier: 'Cisco Systems',
      expired_at: new Date('2028-11-15'),
    },
    {
      type: 'Scanner',
      resource: 'Fujitsu ScanSnap iX1600',
      location: 'Bureau 201 - RH',
      state: 'IN_USE' as const,
      purchase_date: new Date('2024-05-12'),
      supplier: 'Fujitsu',
      expired_at: new Date('2027-05-12'),
    },
    {
      type: 'Ordinateur',
      resource: 'MacBook Pro 14"',
      location: 'Bureau 301 - Informatique',
      state: 'IN_USE' as const,
      purchase_date: new Date('2024-06-01'),
      supplier: 'Apple',
      expired_at: new Date('2027-06-01'),
    },
    {
      type: 'Switch',
      resource: 'Cisco Catalyst 9200L',
      location: 'Salle serveur',
      state: 'IN_USE' as const,
      purchase_date: new Date('2023-04-18'),
      supplier: 'Cisco Systems',
      expired_at: new Date('2028-04-18'),
    },
    {
      type: 'Ordinateur',
      resource: 'Lenovo ThinkPad T14',
      location: 'Bureau 105 - Médecine',
      state: 'OUT_OF_SERVICE' as const,
      purchase_date: new Date('2022-03-20'),
      supplier: 'Lenovo',
      expired_at: new Date('2025-03-20'),
    },
    {
      type: 'Onduleur',
      resource: 'APC Smart-UPS 1500VA',
      location: 'Salle serveur',
      state: 'IN_USE' as const,
      purchase_date: new Date('2023-07-22'),
      supplier: 'APC',
      expired_at: new Date('2028-07-22'),
    },
  ];

  const materials = [];
  for (const m of materialsData) {
    const mat = await prisma.material.create({ data: m });
    materials.push(mat);
  }

  // Tickets IT
  const ticketsData = [
    {
      decription:
        'Impossible de se connecter au réseau WiFi dans le service Radiologie. Le mot de passe ne fonctionne plus depuis la mise à jour.',
      status: 'TODO' as const,
      priority: 'HIGT' as const,
      employeeId: isabelle.id,
      serviceId: sRadio.id,
    },
    {
      decription:
        "L'imprimante Brother du 1er étage fait des bourrages papier constants. Déjà signalé 2 fois.",
      status: 'IN_PROGRESS' as const,
      priority: 'MEDIUM' as const,
      employeeId: claire.id,
      serviceId: sRH.id,
      assignId: marie.id,
    },
    {
      decription: "Demande d'installation de Microsoft Office sur le nouveau poste du bureau 102.",
      status: 'CLOSED' as const,
      priority: 'LOW' as const,
      employeeId: thomas.id,
      serviceId: sCompta.id,
      assignId: paul.id,
      resolvedById: paul.id,
    },
    {
      decription:
        'Le logiciel de gestion des dossiers patients plante au démarrage. Erreur critique.',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGT' as const,
      employeeId: nathalie.id,
      serviceId: sMedecine.id,
      assignId: marie.id,
    },
    {
      decription: "Besoin d'un accès VPN pour le télétravail. Demande validée par le responsable.",
      status: 'IN_VALIDATE' as const,
      priority: 'MEDIUM' as const,
      employeeId: claire.id,
      serviceId: sRH.id,
    },
    {
      decription:
        "Écran du poste d'accueil affiche des lignes horizontales. Probablement un problème de câble.",
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      employeeId: david.id,
      serviceId: sChirurgie.id,
    },
    {
      decription:
        'Mise à jour Windows bloquée à 45% depuis 2 jours sur le poste de la comptabilité.',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGT' as const,
      employeeId: thomas.id,
      serviceId: sCompta.id,
      assignId: paul.id,
    },
    {
      decription: 'Demande de remplacement du clavier du poste 301, touches défaillantes.',
      status: 'VALIDE' as const,
      priority: 'LOW' as const,
      employeeId: paul.id,
      serviceId: sInfo.id,
      assignId: marie.id,
    },
    {
      decription:
        "Problème d'accès au serveur de fichiers partagé. Permission refusée pour le dossier Chirurgie.",
      status: 'TODO' as const,
      priority: 'HIGT' as const,
      employeeId: david.id,
      serviceId: sChirurgie.id,
    },
    {
      decription:
        "Le scanner du bureau RH ne numérise plus en recto-verso. Message d'erreur E-204.",
      status: 'NOT_VALIDATE' as const,
      priority: 'LOW' as const,
      employeeId: claire.id,
      serviceId: sRH.id,
    },
    {
      decription:
        'Demande augmentation de la mémoire RAM du poste de radiologie pour les images DICOM.',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      employeeId: isabelle.id,
      serviceId: sRadio.id,
    },
    {
      decription: 'Câble réseau endommagé dans le bureau 105. Plus de connexion filaire.',
      status: 'CLOSED' as const,
      priority: 'HIGT' as const,
      employeeId: nathalie.id,
      serviceId: sMedecine.id,
      assignId: paul.id,
      resolvedById: paul.id,
    },
  ];

  for (const t of ticketsData) {
    await prisma.ticket.create({ data: t });
  }

  // Associer du matériel à certains tickets
  const tickets = await prisma.ticket.findMany();
  if (tickets[1] && materials[3]) {
    await prisma.material.update({
      where: { id: materials[3].id },
      data: { ticketId: tickets[1].id },
    });
  }
  if (tickets[3] && materials[10]) {
    await prisma.material.update({
      where: { id: materials[10].id },
      data: { ticketId: tickets[3].id },
    });
  }

  // Véhicules
  const vehiclesData = [
    {
      brand: 'Renault',
      model: 'Kangoo',
      year: 2023,
      state: 'IN_USE' as const,
      maintenance_date: new Date('2025-06-15'),
      kilometres: '12500',
    },
    {
      brand: 'Peugeot',
      model: '308',
      year: 2022,
      state: 'IN_USE' as const,
      maintenance_date: new Date('2025-04-20'),
      kilometres: '34200',
    },
    {
      brand: 'Citroën',
      model: 'Berlingo',
      year: 2021,
      state: 'IN_REPAIR' as const,
      maintenance_date: new Date('2025-03-01'),
      kilometres: '58700',
    },
    {
      brand: 'Dacia',
      model: 'Duster',
      year: 2024,
      state: 'AVAILABLE' as const,
      maintenance_date: new Date('2026-01-10'),
      kilometres: '3200',
    },
    {
      brand: 'Toyota',
      model: 'Yaris',
      year: 2023,
      state: 'IN_USE' as const,
      maintenance_date: new Date('2025-08-30'),
      kilometres: '18900',
    },
    {
      brand: 'Renault',
      model: 'Clio',
      year: 2020,
      state: 'IN_USE' as const,
      maintenance_date: new Date('2025-05-12'),
      kilometres: '67800',
    },
    {
      brand: 'Peugeot',
      model: 'Partner',
      year: 2022,
      state: 'IN_USE' as const,
      maintenance_date: new Date('2025-07-25'),
      kilometres: '41300',
    },
    {
      brand: 'Volkswagen',
      model: 'Caddy',
      year: 2024,
      state: 'AVAILABLE' as const,
      maintenance_date: new Date('2026-03-15'),
      kilometres: '1500',
    },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.create({ data: v });
    vehicles.push(vehicle);
  }

  // Coûts véhicules
  const costsData = [
    {
      cost: 450.0,
      description: 'Révision annuelle - vidange et filtres',
      maintenance_date: new Date('2025-01-15'),
      vehicleId: vehicles[0].id,
    },
    {
      cost: 1200.0,
      description: 'Remplacement plaquettes de frein + disques',
      maintenance_date: new Date('2025-02-20'),
      vehicleId: vehicles[1].id,
    },
    {
      cost: 2800.0,
      description: 'Réparation moteur - joint de culasse',
      maintenance_date: new Date('2025-03-01'),
      vehicleId: vehicles[2].id,
    },
    {
      cost: 85.0,
      description: 'Contrôle technique',
      maintenance_date: new Date('2024-12-10'),
      vehicleId: vehicles[0].id,
    },
    {
      cost: 680.0,
      description: 'Remplacement pneus avant',
      maintenance_date: new Date('2024-11-05'),
      vehicleId: vehicles[4].id,
    },
    {
      cost: 350.0,
      description: 'Révision 60 000 km',
      maintenance_date: new Date('2025-01-28'),
      vehicleId: vehicles[5].id,
    },
    {
      cost: 150.0,
      description: 'Changement essuie-glaces + liquide lave-glace',
      maintenance_date: new Date('2024-10-18'),
      vehicleId: vehicles[6].id,
    },
    {
      cost: 95.0,
      description: 'Contrôle technique',
      maintenance_date: new Date('2025-02-14'),
      vehicleId: vehicles[1].id,
    },
    {
      cost: 520.0,
      description: 'Remplacement batterie',
      maintenance_date: new Date('2025-01-05'),
      vehicleId: vehicles[5].id,
    },
    {
      cost: 1800.0,
      description: 'Réparation boîte de vitesses',
      maintenance_date: new Date('2025-02-28'),
      vehicleId: vehicles[2].id,
    },
  ];

  for (const c of costsData) {
    await prisma.cost.create({ data: c });
  }

  console.log('Seed de démo terminé avec succès !');
  console.log('---');
  console.log('Compte admin : admin@cmv.re / Password123!');
  console.log('Compte IT admin : marie.riviere@cmv.re / Password123!');
  console.log('Tous les mots de passe : Password123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
