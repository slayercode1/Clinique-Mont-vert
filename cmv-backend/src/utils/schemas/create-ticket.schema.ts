import { z } from 'zod';

export const createTicketSchema = z.object({
  employeeId: z.string().max(100),
  priority: z.enum(['HIGT', 'MEDIUM', 'LOW']),
  description: z.string().min(1).max(2000),
  materialId: z.string().max(100),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'CLOSED', 'IN_VALIDATE', 'VALIDE', 'NOT_VALIDATE'])
    .optional(),
  serviceId: z.string().max(100).optional(),
  resolvedById: z.string().max(100).optional(),
  assignId: z.string().max(100).optional(),
  validated_at: z.string().max(50).optional(),
});
