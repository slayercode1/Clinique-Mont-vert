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
import { Toaster } from '@/components/ui/sonner';
import { Settings } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Splashscreen from './components/Splashscreen.vue';
import { authStore } from './store/auth';
import { useTokenStore } from './store/token';

const router = useRouter();
const showSplashscreen = ref<boolean>(true);
const closeSplashscreen = () => {
  showSplashscreen.value = false;
};

const isAuth = useTokenStore();
const session = authStore();
onMounted(() => {
  isAuth.initializeAuth();
  setTimeout(closeSplashscreen, 1500);
});

// Define menu items as const objects
const menuItems = {
  it: [
    {
      title: 'Compte Employé',
      url: '/users-list',
    },
    {
      title: 'Ticket',
      url: '/tickets-list',
    },
    {
      title: 'Ressource',
      url: '/resources-list',
    },
  ],
  fleet: [
    {
      title: 'Liste des véhicules',
      url: '/fleets-list',
    },
  ],
};

const sidebarMenuItems = computed(() => {
  const userRole = session.getUser?.role.name;

  // If super admin, return all items or a comprehensive set
  if (userRole === 'SuperAdmin') {
    return [...menuItems.it, ...menuItems.fleet];
  }

  // If IT user or IT admin, return IT items
  if (['IT_USER', 'IT_ADMIN'].includes(userRole!)) {
    return menuItems.it;
  }

  // Default to fleet items for other roles
  return [];
});
</script>

<template>
  <Toaster />
  <Splashscreen v-if="showSplashscreen" @close="closeSplashscreen" />
  <SidebarProvider v-else>
    <div class="w-full md:flex">
      <!-- quil faut pas etre sur la  route /change-password et sur /forbidden et notfound -->
      <div
        v-if="
          isAuth.isAuthenticated &&
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
              <DropdownMenuItem @click="() => router.push('/settings')"
                >Permission</DropdownMenuItem
              >
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
