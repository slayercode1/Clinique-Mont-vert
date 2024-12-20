import type { createUserSchema } from '../schemas/create-user.schema.js';
import { z } from 'zod';
import { createResourceSchema } from '../schemas/create-resource.schema.js';
import { createTicketSchema } from '../schemas/create-ticket.schema.js';
import {
  createCostSchema,
  createVehicleSchema,
} from '../schemas/create-vehicle.schema.js';

export type UserType = z.infer<typeof createUserSchema>;
export type ResourceType = z.infer<typeof createResourceSchema>;
export type TicketType = z.infer<typeof createTicketSchema>;
export type VehicleType = z.infer<typeof createVehicleSchema>;
export type CostType = z.infer<typeof createCostSchema>;
