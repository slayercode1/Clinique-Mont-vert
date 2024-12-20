import { Router } from 'express';
import {
  createCost,
  createVehicle,
  deleteCost,
  deleteVehicle,
  getCost,
  getVehicle,
  getVehicles,
  updateVehicle,
} from '../service/index.js';
import { jwtErrorHandler } from '../../middlewares/jwt/jwtErrorHandler.js';
import { RBAC } from '../../middlewares/role/rbac.js';
import { validateData } from '../../middlewares/validation/validationZod.js';
import { createCostSchema, createVehicleSchema } from '../../utils/schemas/create-vehicle.schema.js';

export const routes = Router();

routes.get(
  '/vehicles',
  [jwtErrorHandler, RBAC('read', 'vehicle')],
  getVehicles,
);
routes.get(
  '/vehicle/:id',
  [jwtErrorHandler, RBAC('read', 'vehicle')],
  getVehicle,
);
routes.get(
  '/vehicle_cost/:id',
  [jwtErrorHandler, RBAC('read', 'vehicle-detail')],
  getCost,
);
routes.post(
  '/create-vehicle',
  [jwtErrorHandler, RBAC('add', 'vehicle'), validateData(createVehicleSchema)],
  createVehicle,
);
routes.delete('/delete-vehicle/:id', [jwtErrorHandler, RBAC('delete', 'vehicle')], deleteVehicle);
routes.patch(
  '/update-vehicle/:id',
  [
    jwtErrorHandler,
    RBAC('edit', 'vehicle'),
    validateData(createVehicleSchema.partial()),
  ],
  updateVehicle,
);
routes.post(
  '/create-cost',
  [
    jwtErrorHandler,
    RBAC('add', 'cost_vehicle'),
    validateData(createCostSchema),
  ],
  createCost,
);
routes.delete('/delete-cost/:id', [jwtErrorHandler, RBAC('delete', 'cost_vehicle')], deleteCost);
