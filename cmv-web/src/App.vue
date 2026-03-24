<script lang="ts" setup>
import AppSidebar from '@/components/AppSidebar.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Settings } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Toaster } from 'vue-sonner';
import Splashscreen from './components/Splashscreen.vue';
import { authStore } from './store/auth';
import { useTokenStore } from './store/token';

const router = useRouter();
const showSplashscreen = ref(true);
const closeSplashscreen = () => {
  showSplashscreen.value = false;
};

const isAuth = useTokenStore();
const session = authStore();
onMounted(() => {
  isAuth.initializeAuth();
  setTimeout(closeSplashscreen, 1500);

  // Fix vue-sonner toast visibility: inject CSS after vue-sonner's styles load
  if (!document.querySelector('[data-sonner-fix]')) {
    const style = document.createElement('style');
    style.setAttribute('data-sonner-fix', 'true');
    style.textContent = `
      [data-sonner-toast] {
        transition: none !important;
      }
      [data-sonner-toast][data-mounted="true"] {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
      [data-sonner-toast][data-removed="true"] {
        opacity: 0 !important;
        transform: translateY(-100%) !important;
      }
    `;
    document.head.appendChild(style);
  }
});

const menuItems = {
  it: [
    { title: 'Compte Employé', url: '/users-list' },
    { title: 'Ticket', url: '/tickets-list' },
    { title: 'Ressource', url: '/resources-list' },
  ],
  fleet: [{ title: 'Liste des véhicules', url: '/fleets-list' }],
};

const sidebarMenuItems = computed(() => {
  const userRole = session.getUser?.role.name;

  if (userRole === 'SuperAdmin') {
    return [...menuItems.it, ...menuItems.fleet];
  }

  if (['IT_USER', 'IT_ADMIN'].includes(userRole!)) {
    return menuItems.it;
  }

  return [];
});
</script>

<template>
  <Toaster position="top-right" rich-colors />
  <Splashscreen v-if="showSplashscreen" @close="closeSplashscreen" />
  <SidebarProvider v-else>
    <div class="w-full md:flex">
      <div
        v-if="
          isAuth.isAuthenticated &&
          $route.path !== '/' &&
          $route.path !== '/change-password' &&
          $route.path !== '/forbidden' &&
          $route.path !== '/notfound'
        "
        class="md:flex"
      >
        <AppSidebar :menu="sidebarMenuItems" />
        <SidebarTrigger />
        <div v-if="session.getUser?.role.name === 'SuperAdmin'" class="absolute right-5 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Settings />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="() => router.push('/settings')">Permission</DropdownMenuItem>
              <DropdownMenuItem @click="() => router.push('/roles')">Rôle</DropdownMenuItem>
              <DropdownMenuItem @click="() => router.push('/services')">Service</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <RouterView />
      </div>
    </div>
  </SidebarProvider>
</template>
