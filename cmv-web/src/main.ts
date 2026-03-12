import { createApp } from 'vue';
import './assets/styles/style.css';
import { authStore } from '@/store/auth';
import { useTokenStore } from '@/store/token';
import { hasRole } from '@/utils/functions';
import { createPinia } from 'pinia';
import { type RouteLocationNormalized, createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

const SignInView = () => import('@/pages/auth/SignIn.vue');
const NotFoundView = () => import('@/pages/error/NotFound.vue');
const ChangePasswordView = () => import('@/pages/auth/ChangePassword.vue');
const ListUserView = () => import('@/pages/users/List.vue');
const FormAddUserView = () => import('@/pages/users/FormAdd.vue');
const FormEditUserView = () => import('@/pages/users/FormEdit.vue');
const ListResourceView = () => import('@/pages/resources/List.vue');
const FormEditResourceView = () => import('@/pages/resources/FormEdit.vue');
const FormAddResourceView = () => import('@/pages/resources/FormAdd.vue');
const ListTicketView = () => import('@/pages/tickets/List.vue');
const FormsTicketView = () => import('@/pages/tickets/Forms.vue');
const TicketDetailView = () => import('@/pages/tickets/TicketDetailsPage.vue');
const ListFleetView = () => import('@/pages/fleet/List.vue');
const ListFleetDetailView = () => import('@/pages/fleet/ListDetail.vue');
const FormEditFleetView = () => import('@/pages/fleet/FormEdit.vue');
const FormAddFleetView = () => import('@/pages/fleet/FormAdd.vue');
const PermissionsView = () => import('@/pages/settings/permission.vue');
const RolesView = () => import('@/pages/settings/role.vue');
const ServicesView = () => import('@/pages/settings/service.vue');
const ForbiddenView = () => import('@/pages/error/Forbidden.vue');

const routes = [
  { path: '/', component: SignInView },
  {
    path: '/change-password',
    component: ChangePasswordView,
    meta: {
      requiresRoles: ['IT_USER', 'IT_ADMIN', 'FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'],
    },
  },
  {
    path: '/settings',
    component: PermissionsView,
    meta: {
      requiresRoles: ['SuperAdmin'],
    },
  },
  {
    path: '/roles',
    component: RolesView,
    meta: {
      requiresRoles: ['SuperAdmin'],
    },
  },
  {
    path: '/services',
    component: ServicesView,
    meta: {
      requiresRoles: ['SuperAdmin'],
    },
  },
  {
    path: '/users-list',
    component: ListUserView,
    meta: { requiresRoles: ['IT_USER', 'IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/user-add',
    component: FormAddUserView,
    meta: { requiresRoles: ['IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/user-update/:id',
    component: FormEditUserView,
    meta: { requiresRoles: ['IT_USER', 'IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/resources-list',
    component: ListResourceView,
    meta: { requiresRoles: ['IT_USER', 'IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/resource-add',
    component: FormAddResourceView,
    meta: { requiresRoles: ['IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/resource-update/:id',
    component: FormEditResourceView,
    meta: { requiresRoles: ['IT_USER', 'IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/tickets-list',
    component: ListTicketView,
    meta: { requiresRoles: ['IT_USER', 'IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/ticket-add',
    component: FormsTicketView,
    meta: {
      requiresRoles: ['IT_ADMIN', 'FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'],
    },
  },
  {
    path: '/ticket/:id',
    component: TicketDetailView,
    meta: {
      requiresRoles: ['IT_USER', 'IT_ADMIN', 'FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'],
    },
  },
  {
    path: '/fleets-list',
    component: ListFleetView,
    meta: { requiresRoles: ['FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/costs-list/:id',
    component: ListFleetDetailView,
    meta: {
      requiresRoles: ['FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'],
    },
    children: [
      {
        path: 'cost-add',
        component: ListFleetDetailView,
        meta: { requiresRoles: ['FLEET_ADMIN', 'SuperAdmin'] },
      },
    ],
  },
  {
    path: '/fleet-add',
    component: FormAddFleetView,
    meta: { requiresRoles: ['FLEET_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/fleet-update/:id',
    component: FormEditFleetView,
    meta: { requiresRoles: ['FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'] },
  },
  { path: '/forbidden', component: ForbiddenView },
  { path: '/:pathMatch(.*)*', component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to: RouteLocationNormalized, _: RouteLocationNormalized) => {
  const isAuth = useTokenStore();
  const session = authStore();
  if (isAuth.getIsAuthenticated) {
    await session.session();
  }

  const authRequiredPaths = [
    '/users-list',
    '/user-add',
    '/user-update/:id',
    '/change-password',
    '/resources-list',
    '/resource-add',
    '/tickets-list',
    '/ticket-add',
    '/fleets-list',
    '/fleet-add',
    '/fleet-update/:id',
    '/tickets/:id',
    '/costs-list/:id',
    '/costs-list/:id/cost-add',
  ];

  function isDynamicRoute(pattern: string, path: string) {
    const regex = new RegExp(pattern.replace(/:\w+/g, '\\w+'));
    return regex.test(path);
  }

  function isPathProtected(path: string) {
    return authRequiredPaths.some((pattern) => {
      return isDynamicRoute(pattern, path) || pattern === path;
    });
  }

  const redirectByRole = () => {
    const roleName = session.getUser?.role.name || '';
    if (roleName.startsWith('IT')) return '/users-list';
    if (roleName.startsWith('FLEET')) return '/fleets-list';
    if (roleName === 'SuperAdmin') return '/users-list';
    return '/forbidden';
  };

  if (!isAuth.getIsAuthenticated && isPathProtected(to.path)) {
    return '/';
  }

  if (isAuth.getIsAuthenticated && to.path === '/') {
    return redirectByRole();
  }

  if (to.meta.requiresRoles) {
    const allowedRoles = to.meta.requiresRoles as string[];
    const userRole = session.getUser?.role.name as string;
    if (!userRole || !hasRole(userRole, allowedRoles)) {
      return redirectByRole();
    }
  }

  const isChangePassword = session.getUser?.isChangePassword;
  if (isChangePassword && to.path === '/change-password') {
    return redirectByRole();
  }
});

const pinia = createPinia();
const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');
