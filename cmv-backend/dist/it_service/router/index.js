import { Router } from 'express';
import { changePassword, getSession, signIn, signOut } from '../service/auth.js';
import { createUser, getRoles, getUsers, updateUsers } from '../service/user.js';
import { createResource, getResources, updateResource, } from '../service/resource.js';
import { createTicket, getTicket, getTickets, updateTicket, } from '../service/task.js';
import { jwtErrorHandler } from '../../middlewares/jwt/jwtErrorHandler.js';
import { RBAC } from '../../middlewares/role/rbac.js';
import { validateData } from '../../middlewares/validation/validationZod.js';
import { createResourceSchema } from '../../utils/schemas/create-resource.schema.js';
import { createTicketSchema } from '../../utils/schemas/create-ticket.schema.js';
import { createUserSchema } from '../../utils/schemas/create-user.schema.js';
import { signInSchema } from '../../utils/schemas/auth.schema.js';
export const routes = Router();
//USER
routes.get('/users', [jwtErrorHandler, RBAC('read', 'user')], getUsers);
routes.post('/user', [jwtErrorHandler, RBAC('add', 'user'), validateData(createUserSchema)], createUser);
routes.get('/roles', [jwtErrorHandler, RBAC('red', 'user')], getRoles);
routes.patch('/user/:id', [
    jwtErrorHandler,
    RBAC('edit', 'user'),
    validateData(createUserSchema.partial()),
], updateUsers);
//AUTH
routes.post('/sign-in', validateData(signInSchema), signIn);
routes.post('/sign-out/:id', [jwtErrorHandler], signOut);
routes.patch('/change-password', [jwtErrorHandler, RBAC('edit', 'user')], changePassword);
routes.get('/session', [jwtErrorHandler, RBAC('read', 'user')], getSession);
//RESOURCE
routes.get('/resources', [jwtErrorHandler, RBAC('read', 'resource')], getResources);
routes.post('/resource', [
    jwtErrorHandler,
    RBAC('add', 'resource'),
    validateData(createResourceSchema),
], createResource);
routes.patch('/resource/:id', [
    jwtErrorHandler,
    RBAC('edit', 'resource'),
    validateData(createResourceSchema.partial()),
], updateResource);
//TICKET
routes.get('/tickets', [jwtErrorHandler, RBAC('read', 'ticket')], getTickets);
routes.get('/ticket/:id', [jwtErrorHandler, RBAC('edit', 'ticket-detail')], getTicket);
routes.post('/ticket', [jwtErrorHandler, RBAC('add', 'ticket'), validateData(createTicketSchema)], createTicket);
routes.patch('/ticket/:id', [
    jwtErrorHandler,
    RBAC('edit', 'ticket'),
    validateData(createTicketSchema.partial()),
], updateTicket);
