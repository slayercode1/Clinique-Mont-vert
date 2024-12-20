import { Router } from 'express';

import { changePassword, getSession, signIn, signOut } from '../service/auth.js';
import {
  createOrUpdatePermissions,
  createRole,
  createService,
  createUser,
  deleteUser,
  getPermissions,
  getRoles,
  getServices,
  getUser,
  getUsers,
  updateUsers,
} from '../service/user.js';
import { createResource, deleteResouce, getResource, getResources, updateResource } from '../service/resource.js';
import { createTicket, getTicket, getTickets, updateTicket } from '../service/task.js';
import { jwtErrorHandler } from '../../middlewares/jwt/jwtErrorHandler.js';
import { RBAC } from '../../middlewares/role/rbac.js';
import { validateData } from '../../middlewares/validation/validationZod.js';
import { createResourceSchema } from '../../utils/schemas/create-resource.schema.js';
import { createTicketSchema } from '../../utils/schemas/create-ticket.schema.js';
import { createUserSchema } from '../../utils/schemas/create-user.schema.js';
import { signInSchema } from '../../utils/schemas/auth.schema.js';
import { createRoleAndServiceSchema } from '../../utils/schemas/create-role-service.schema.js';

export const routes = Router();

//USER
routes.get('/users', [jwtErrorHandler, RBAC('read', 'user')], getUsers);
routes.get('/user/:id', [jwtErrorHandler, RBAC('read', 'user')], getUser);
routes.post(
  '/user',
  [jwtErrorHandler, RBAC('add', 'user'), validateData(createUserSchema)],
  createUser,
);
routes.get('/roles', [jwtErrorHandler, RBAC('read', 'user')], getRoles);
routes.post('/role', [jwtErrorHandler, RBAC('add', 'permission'), validateData(createRoleAndServiceSchema)], createRole);
routes.post('/service', [jwtErrorHandler, RBAC('add', 'permission'), validateData(createRoleAndServiceSchema)], createService);
routes.get('/services', [jwtErrorHandler, RBAC('read', 'ticket')], getServices);
routes.get('/permissions', [jwtErrorHandler, RBAC('read', 'permission')], getPermissions);
routes.post('/permission', [jwtErrorHandler, RBAC('add', 'permission')], createOrUpdatePermissions);
routes.patch(
  '/user/:id',
  [
    jwtErrorHandler,
    RBAC('edit', 'user'),
    validateData(createUserSchema.partial()),
  ],
  updateUsers,
);
routes.delete('/delete-user/:id', [jwtErrorHandler, RBAC('delete', 'user')], deleteUser);


//AUTH
routes.post('/sign-in', validateData(signInSchema), signIn);
routes.post('/sign-out/:id', [jwtErrorHandler], signOut);
routes.patch(
  '/change-password',
  [jwtErrorHandler, RBAC('edit', 'user')],
  changePassword,
);
routes.get('/session', [jwtErrorHandler, RBAC('read', 'user')], getSession);

//RESOURCE
routes.get(
  '/resources',
  [jwtErrorHandler, RBAC('read', 'resource')],
  getResources,
);
routes.get(
  '/resource/:id',
  [jwtErrorHandler, RBAC('read', 'resource')],
  getResource,
);
routes.post(
  '/resource',
  [
    jwtErrorHandler,
    RBAC('add', 'resource'),
    validateData(createResourceSchema),
  ],
  createResource,
);
routes.patch(
  '/resource/:id',
  [
    jwtErrorHandler,
    RBAC('edit', 'resource'),
    validateData(createResourceSchema.partial()),
  ],
  updateResource,
);
routes.delete('/delete-resource/:id', [jwtErrorHandler, RBAC('delete', 'resource')], deleteResouce);


//TICKET
routes.get('/tickets', [jwtErrorHandler, RBAC('read', 'ticket')], getTickets);
routes.get(
  '/ticket/:id',
  [jwtErrorHandler, RBAC('edit', 'ticket-detail')],
  getTicket,
);
routes.post(
  '/ticket',
  [jwtErrorHandler, RBAC('add', 'ticket'), validateData(createTicketSchema)],
  createTicket,
);
routes.patch(
  '/ticket/:id',
  [
    jwtErrorHandler,
    RBAC('edit', 'ticket'),
    validateData(createTicketSchema.partial()),
  ],
  updateTicket,
);
