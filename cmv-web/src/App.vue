<script lang="ts" setup>
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import AppSidebar from '@/components/AppSidebar.vue';
import { useTokenStore } from './store/token';
import { computed, onMounted, ref } from 'vue';
import { authStore } from './store/auth';
import Splashscreen from './components/Splashscreen.vue';
import { Settings } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'vue-router';

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
    <div class="w-full md:flex relative">
      <!-- quil faut pas etre sur la  route /change-password et sur /forbidden et notfound -->
      <div
        v-if="
          isAuth.isAuthenticated &&
          $route.path !== '/change-password' &&
          $route.path !== '/forbidden' &&
          $route.path !== '/notfound'
        "
      >
        <AppSidebar :menu="sidebarMenuItems" />
        <SidebarTrigger />
        <div class="absolute right-5 top-3">
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
      <RouterView />
    </div>
  </SidebarProvider>
</template>
