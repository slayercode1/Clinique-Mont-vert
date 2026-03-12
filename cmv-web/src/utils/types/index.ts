import type { z } from 'zod';
import type { createResourceSchema } from '../schemas/create-resource.schema';
import type { createTicketSchema } from '../schemas/create-ticket.schema';
import type { createUserSchema } from '../schemas/create-user.schema';
import type { createCostSchema, createVehicleSchema } from '../schemas/create-vehicle.schema';

export type UserType = z.infer<typeof createUserSchema>;
export type ResourceType = z.infer<typeof createResourceSchema>;
export type TicketType = z.infer<typeof createTicketSchema>;
export type VehicleType = z.infer<typeof createVehicleSchema>;
export type CostType = z.infer<typeof createCostSchema>;

type Permission = { resource: string; actions: string[] };
export type Payload = { roleId: string; permissions: Permission[] };
