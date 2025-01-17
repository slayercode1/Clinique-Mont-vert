import { z } from 'zod';
export const createRoleAndServiceSchema = z.object({
    name: z.string(),
});
