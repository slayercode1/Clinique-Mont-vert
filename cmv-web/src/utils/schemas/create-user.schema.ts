import * as z from 'zod';

export const createUserSchema = z.object({
  lastname: z.string().min(1, 'Nom requis'),
  firstname: z.string().min(1, 'Prénom requis'),
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  status: z.enum(['ACTIF', 'INACTIF'], { required_error: 'Statut requis' }),
  roleId: z.string().min(1, 'Rôle requis'),
  serviceId: z.string().min(1, 'Service requis'),
});

export const updateUserSchema = z.object({
  lastname: z.string().min(1, 'Nom requis').optional(),
  firstname: z.string().min(1, 'Prénom requis').optional(),
  email: z.string().email('Adresse e-mail invalide').optional(),
  status: z.enum(['ACTIF', 'INACTIF'], { required_error: 'Statut requis' }).optional(),
  roleId: z.string().min(1, 'Rôle requis').optional(),
  serviceId: z.string().min(1, 'Service requis').optional(),
});
