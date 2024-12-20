<script lang="ts" setup>
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { HelpCircle, LogOut } from 'lucide-vue-next';
import { RouterLink, useRouter } from 'vue-router';
import logo from '../assets/logo.png';
import { authStore } from '../store/auth';
import { useTokenStore } from '../store/token';

const session = authStore();
const token = useTokenStore();
const router = useRouter();

defineProps({
  menu: Array<Record<string, string>>,
});

const handleLogout = async () => {
  await session.signout(session.getUser?.id!);
  token.logout();
  router.replace('/');

};
</script>

<template>
  <AlertDialog>
    <Sidebar class="bg-black">
      <SidebarHeader class="mt-10 items-center">
        <img :src="logo" alt="logo of the clinique" class="w-60 h-60" />
      </SidebarHeader>
      <SidebarContent class="justify-center">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu class="items-center gap-5">
              <SidebarMenuItem v-for="item in menu" :key="item?.title">
                <SidebarMenuButton as-child>
                  <RouterLink :class="{
                    'bg-[#1F2937] text-white': $route.path === item.url,
                    'bg-white': $route.path !== item.url,
                  }" :style="{ width: '12rem' }" :to="item.url" class="p-4 h-10 items-center rounded-lg">
                    {{ item?.title }}
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter class="mb-10">
        <SidebarMenu class="items-center gap-2 text-white">
          <SidebarMenuItem v-if="
            session.getUser?.role.name !== 'IT_USER' && session.getUser?.role.name !== 'IT_ADMIN'
          " class="w-40 cursor-pointer" @click="() => router.push('/ticket-add')">
            <div class="flex gap-2">
              <HelpCircle />
              Creer un ticket
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem class="w-40">
            <AlertDialogTrigger>
              <div class="flex gap-2">
                <LogOut />
                Deconnexion
              </div>
            </AlertDialogTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
        <AlertDialogDescription> Vous ête sur le point de vous deconnecter </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction @click="handleLogout">Confirmer</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
