import { createApp } from 'vue';
import './assets/styles/style.css';
import SignInView from './pages/auth/SignIn.vue';
import NotFoundView from './pages/error/NotFound.vue';
import {
  createRouter,
  createWebHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
} from 'vue-router';
import App from './App.vue';
import { createPinia } from 'pinia';
import ChangePasswordView from './pages/auth/ChangePassword.vue';
import ListUserView from '@/pages/users/List.vue';
import FormAddUserView from './pages/users/FormAdd.vue';
import FormEditUserView from './pages/users/FormEdit.vue';
import ListResourceView from '@/pages/resources/List.vue';
import FormEditResourceView from './pages/resources/FormEdit.vue';
import FormAddResourceView from './pages/resources/FormAdd.vue';
import ListTicketView from '@/pages/tickets/List.vue';
import FormsTicketView from './pages/tickets/Forms.vue';
import TicketDetailView from './pages/tickets/TicketDetailsPage.vue';
import ListFleetView from '@/pages/fleet/List.vue';
import ListFleetDetailView from '@/pages/fleet/ListDetail.vue';
import FormEditFleetView from './pages/fleet/FormEdit.vue';
import FormAddFleetView from './pages/fleet/FormAdd.vue';
import PermissionsView from './pages/settings/permission.vue';
import RolesView from './pages/settings/role.vue';
import ServicesView from './pages/settings/service.vue';
import { hasRole } from './utils/functions';
import ForbiddenView from './pages/error/Forbidden.vue';
import { authStore } from './store/auth';
import { useTokenStore } from './store/token';

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

router.beforeEach(
  async (to: RouteLocationNormalized, _: RouteLocationNormalized, next: NavigationGuardNext) => {
    const isAuth = useTokenStore();
    const session = authStore();

    // Un seul appel à session.session()
    if (isAuth.getIsAuthenticated) {
      await session.session();
    }

    // Chemins nécessitant une authentification
    const authRequiredPaths = [
      '/users-list',
      '/user-add',
      '/user-update',
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

    // Fonction pour vérifier si une route dynamique est incluse
    function isDynamicRoute(pattern: string, path: string) {
      // Remplacer les paramètres de route par une expression régulière
      const regex = new RegExp(pattern.replace(/:\w+/g, '\\w+'));
      return regex.test(path);
    }

    function isPathProtected(path: string) {
      return authRequiredPaths.some((pattern) => {
        return isDynamicRoute(pattern, path) || pattern === path;
      });
    }

    // Redirection en fonction du rôle de l'utilisateur
    const redirectByRole = async () => {
      const roleName = session.getUser?.role.name || '';

      if (roleName.startsWith('IT')) {
        return next('/users-list');
      }
      if (roleName.startsWith('FLEET')) {
        return next('/fleets-list');
      }
      return next('/forbidden');
    };

    // Redirection si l'utilisateur non authentifié tente d'accéder à une page nécessitant l'authentification
    if (!isAuth.getIsAuthenticated && isPathProtected(to.path)) {
      return next('/');
    }

    // Redirection de la page d'accueil pour l'utilisateur authentifié
    if (isAuth.getIsAuthenticated && to.path === '/') {
      return redirectByRole();
    }

    // Vérification des rôles si la route en nécessite un
    if (to.meta.requiresRoles) {
      const allowedRoles = to.meta.requiresRoles as string[];
      const userRole = session.getUser?.role.name as string;

      if (!userRole || !hasRole(userRole, allowedRoles)) {
        return redirectByRole();
      }
    }

    // Vérifie si l'utilisateur doit changer son mot de passe
    const isOnboarding = document.cookie.includes('onbording=');
    if (!isOnboarding && isPathProtected(to.path)) {
      return next('/change-password');
    }
    if (isOnboarding && to.path === '/change-password') {
      return redirectByRole();
    }

    // Continue vers la route demandée si aucune redirection n'est nécessaire
    next();
  },
);

const pinia = createPinia();
const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');
