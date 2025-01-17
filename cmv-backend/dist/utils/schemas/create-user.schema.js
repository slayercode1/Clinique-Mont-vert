import { z } from 'zod';
export const createUserSchema = z.object({
    lastname: z.string(),
    firstname: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    status: z.enum(['ACTIF', 'INACTIF']),
    roleId: z.string(),
    serviceId: z.string(),
});
export const updateUserSchema = z.object({
    lastname: z.string().optional(),
    firstname: z.string().optional(),
    email: z.string().email().optional(),
    status: z.enum(['ACTIF', 'INACTIF']).optional(),
    role: z.string().optional(),
    serviceId: z.string().optional(),
});
