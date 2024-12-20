<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Clock, User } from 'lucide-vue-next';
import { onBeforeMount } from 'vue';
import { ticketStore } from '@/store/ticket.ts';
import { useRoute } from 'vue-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'vue-sonner';

const ticket_store = ticketStore();
const route = useRoute();

const priorityStyles = {
  HIGH: 'bg-red-600 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW: 'bg-green-500 text-white',
};

const statusStyles = {
  IN_PROGRESS: 'bg-blue-500 text-white',
  TODO: 'bg-gray-500 text-white',
  BLOCKED: 'bg-red-500 text-white',
  CLOSED: 'bg-green-500 text-white',
  IN_VALIDATE: 'bg-yellow-500 text-white',
  VALIDE: 'bg-teal-500 text-white',
  NOT_VALIDATE: 'bg-orange-500 text-white',
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatFullname = (firstname: string | undefined, lastname: string | undefined): string => {
  if (!firstname || !lastname) {
    return ' --';
  }
  return `${firstname} ${lastname}`;
};

onBeforeMount(async () => {
  await ticket_store.fetchTicket(route.params.id as string);
});

const stats = [
  { value: 'VALIDE', label: 'Valider' },
  { value: 'NOT_VALIDATE', label: 'Non valider' },
];
</script>

<template>
  <Card class="shadow-none border-none p-2 w-full md:w-[calc(100%-50px)] mt-8">
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="text-2xl font-bold"
            >Ticket n°: {{ ticket_store.getTicket?.id }}</CardTitle
          >
          <CardDescription class="mt-2">{{ ticket_store.getTicket?.description }}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child class="cursor-pointer">
            <Badge :class="statusStyles[ticket_store.getTicket?.status!]" class="text-white">
              {{ ticket_store.getTicket?.status }}
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem
                class="cursor-pointer"
                v-for="item in stats"
                @click="
                  () => {
                    ticket_store.updateTicket({ status: item.value }, ticket_store.getTicket?.id!);
                    toast.success('Ticket updated', {
                      position: 'top-right',
                    });
                  }
                "
              >
                <span>{{ item.label }}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>

    <CardContent class="space-y-6">
      <!-- Informations principales -->
      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-4">
          <!-- Date de création -->
          <div class="flex items-center space-x-2">
            <Clock class="h-5 w-5 text-gray-500" />
            <span>Créé le {{ formatDate(ticket_store.getTicket?.created_at!) }}</span>
          </div>

          <!-- Service -->
          <div class="flex items-center space-x-2">
            <span>Service : {{ ticket_store.getTicket?.service }}</span>
          </div>

          <!-- Priorité -->
          <div class="flex items-center space-x-2">
            <AlertCircle class="h-5 w-5 text-gray-500" />
            <Badge :class="priorityStyles[ticket_store.getTicket?.priority!]">
              {{ ticket_store.getTicket?.priority }}
            </Badge>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Assigné à -->
          <div class="flex items-center space-x-3">
            <User class="h-5 w-5 text-gray-500" />
            <span>Assigné à :&nbsp </span>
            {{
              formatFullname(
                ticket_store.getTicket?.assign?.firstname,
                ticket_store.getTicket?.assign?.lastname,
              )
            }}
          </div>

          <!-- Résolu par -->
          <div v-if="ticket_store.getTicket?.resolvedBy" class="flex items-center space-x-3">
            <CheckCircle2 class="h-5 w-5 text-gray-500" />
            <span>Résolu par :&nbsp </span>
            {{
              formatFullname(
                ticket_store.getTicket?.resolvedBy?.firstname,
                ticket_store.getTicket?.resolvedBy?.lastname,
              )
            }}
          </div>
        </div>
      </div>

      <!-- Matériel -->
      <template v-if="ticket_store.getTicket?.material?.length">
        <Separator />
        <div>
          <h3 class="text-lg font-semibold mb-3">Matériel concerné</h3>
          <div class="grid grid-cols-2 gap-4">
            <Card v-for="item in ticket_store.getTicket?.material" :key="item.id" class="p-4">
              {{ item.resource }}
            </Card>
          </div>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
