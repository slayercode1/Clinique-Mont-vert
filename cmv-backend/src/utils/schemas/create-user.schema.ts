import { z } from 'zod';

export const createUserSchema = z.object({
  lastname: z.string().min(1).max(100),
  firstname: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  status: z.enum(['ACTIF', 'INACTIF']),
  roleId: z.string().max(100),
  serviceId: z.string().max(100),
});

export const updateUserSchema = z.object({
  lastname: z.string().min(1).max(100).optional(),
  firstname: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  status: z.enum(['ACTIF', 'INACTIF']).optional(),
  role: z.string().max(100).optional(),
  serviceId: z.string().max(100).optional(),
  isChangePassword: z.boolean().optional(),
});
