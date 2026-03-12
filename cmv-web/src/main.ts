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
      requiresAuth: true,
      requiresRoles: ['IT_USER', 'IT_ADMIN', 'FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'],
    },
  },
  {
    path: '/settings',
    component: PermissionsView,
    meta: { requiresAuth: true, requiresRoles: ['SuperAdmin'] },
  },
  {
    path: '/roles',
    component: RolesView,
    meta: { requiresAuth: true, requiresRoles: ['SuperAdmin'] },
  },
  {
    path: '/services',
    component: ServicesView,
    meta: { requiresAuth: true, requiresRoles: ['SuperAdmin'] },
  },
  {
    path: '/users-list',
    component: ListUserView,
    meta: { requiresAuth: true, requiresRoles: ['IT_USER', 'IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/user-add',
    component: FormAddUserView,
    meta: { requiresAuth: true, requiresRoles: ['IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/user-update/:id',
    component: FormEditUserView,
    meta: { requiresAuth: true, requiresRoles: ['IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/resources-list',
    component: ListResourceView,
    meta: { requiresAuth: true, requiresRoles: ['IT_USER', 'IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/resource-add',
    component: FormAddResourceView,
    meta: { requiresAuth: true, requiresRoles: ['IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/resource-update/:id',
    component: FormEditResourceView,
    meta: { requiresAuth: true, requiresRoles: ['IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/tickets-list',
    component: ListTicketView,
    meta: { requiresAuth: true, requiresRoles: ['IT_USER', 'IT_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/ticket-add',
    component: FormsTicketView,
    meta: {
      requiresAuth: true,
      requiresRoles: ['IT_ADMIN', 'FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'],
    },
  },
  {
    path: '/ticket/:id',
    component: TicketDetailView,
    meta: {
      requiresAuth: true,
      requiresRoles: ['IT_USER', 'IT_ADMIN', 'FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'],
    },
  },
  {
    path: '/fleets-list',
    component: ListFleetView,
    meta: { requiresAuth: true, requiresRoles: ['FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/costs-list/:id',
    component: ListFleetDetailView,
    meta: {
      requiresAuth: true,
      requiresRoles: ['FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'],
    },
    children: [
      {
        path: 'cost-add',
        component: ListFleetDetailView,
        meta: { requiresAuth: true, requiresRoles: ['FLEET_ADMIN', 'SuperAdmin'] },
      },
    ],
  },
  {
    path: '/fleet-add',
    component: FormAddFleetView,
    meta: { requiresAuth: true, requiresRoles: ['FLEET_ADMIN', 'SuperAdmin'] },
  },
  {
    path: '/fleet-update/:id',
    component: FormEditFleetView,
    meta: { requiresAuth: true, requiresRoles: ['FLEET_USER', 'FLEET_ADMIN', 'SuperAdmin'] },
  },
  { path: '/forbidden', component: ForbiddenView },
  { path: '/:pathMatch(.*)*', component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let lastSessionCheck = 0;
const SESSION_TTL = 60_000; // 1 minute cache

router.beforeEach(async (to: RouteLocationNormalized, _: RouteLocationNormalized) => {
  const isAuth = useTokenStore();
  const session = authStore();

  if (isAuth.getIsAuthenticated) {
    const now = Date.now();
    if (!session.getUser || now - lastSessionCheck > SESSION_TTL) {
      try {
        await session.session();
        lastSessionCheck = now;
      } catch {
        lastSessionCheck = 0;
        isAuth.logout();
        return '/';
      }
    }
  }

  const redirectByRole = () => {
    const roleName = session.getUser?.role.name || '';
    if (roleName.startsWith('IT') || roleName === 'SuperAdmin') return '/users-list';
    if (roleName.startsWith('FLEET')) return '/fleets-list';
    return '/forbidden';
  };

  // Route protégée sans authentification → login
  if (to.meta.requiresAuth && !isAuth.getIsAuthenticated) {
    return '/';
  }

  // Utilisateur connecté qui va sur login → redirect
  if (isAuth.getIsAuthenticated && to.path === '/') {
    return redirectByRole();
  }

  // Vérification des rôles
  if (to.meta.requiresRoles) {
    const allowedRoles = to.meta.requiresRoles as string[];
    const userRole = session.getUser?.role.name as string;
    if (!userRole || !hasRole(userRole, allowedRoles)) {
      return redirectByRole();
    }
  }

  const isChangePassword = session.getUser?.isChangePassword;
  const isSuperAdmin = session.getUser?.role.name === 'SuperAdmin';

  // L'utilisateur a déjà changé son mot de passe → ne pas accéder à /change-password
  if (isChangePassword && to.path === '/change-password') {
    return redirectByRole();
  }

  // L'utilisateur n'a pas encore changé son mot de passe → forcer (sauf SuperAdmin)
  if (
    isAuth.getIsAuthenticated &&
    !isChangePassword &&
    !isSuperAdmin &&
    to.path !== '/change-password'
  ) {
    return '/change-password';
  }
});

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');
