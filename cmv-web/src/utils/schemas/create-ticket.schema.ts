import { z } from 'zod';

export const createTicketSchema = z.object({
  employeeId: z.string(),
  priority: z.enum(['HIGT', 'MEDIUM', 'LOW']),
  description: z.string(),
  materialId: z.string(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'CLOSED', 'IN_VALIDATE', 'VALIDE', 'NOT_VALIDATE'])
    .optional(),
  service: z.string().optional(),
  resolvedById: z.string().optional(),
  assignId: z.string().optional(),
  validated_at: z.string().optional(),
});
