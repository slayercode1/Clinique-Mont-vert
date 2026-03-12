<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { userStore } from '@/store/user';
import { Payload } from '@/utils/types';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';

const user = userStore();

const allResources = [
  'resource',
  'user',
  'ticket',
  'ticket_detail',
  'vehicle',
  'cost_vehicle',
  'cost',
  'vehicle_detail',
];

const resourceLabels: Record<string, string> = {
  resource: 'Ressource',
  user: 'Utilisateur',
  ticket: 'Ticket',
  ticket_detail: 'Détail ticket',
  vehicle: 'Véhicule',
  cost_vehicle: 'Coût véhicule',
  cost: 'Coût',
  vehicle_detail: 'Détail véhicule',
};

const actions = ['read', 'edit', 'add', 'delete'];

const actionLabels: Record<string, string> = {
  read: 'Lecture',
  edit: 'Modifier',
  add: 'Ajouter',
  delete: 'Supprimer',
};

const permissionsData = ref({});
const selectedRole = ref('SuperAdmin');

onMounted(async () => {
  await user.fetchRoles();
  await user.fetchPermissions();
  permissionsData.value = JSON.parse(JSON.stringify(user.getPermissions));
});

const hasPermission = (role: string, resource: string, action: string) => {
  return permissionsData.value[role]?.[resource]?.includes(action) || false;
};

const togglePermission = (role: string, resource: string, action: string) => {
  if (!permissionsData.value[role]) {
    permissionsData.value[role] = {};
  }
  if (!permissionsData.value[role][resource]) {
    permissionsData.value[role][resource] = [];
  }

  const permissions = permissionsData.value[role][resource];
  const index = permissions.indexOf(action);

  if (index === -1) {
    permissions.push(action);
  } else {
    permissions.splice(index, 1);
  }
};

const savePermissions = async () => {
  const payload: Payload = {
    roleId: user.getRoles.find((role) => role.name === selectedRole.value)?.id || '',
    permissions: Object.entries(permissionsData.value[selectedRole.value] || {}).map(
      ([resource, actions]) => ({
        resource,
        actions,
      })
    ),
  };

  try {
    await user.createOrUpdatePermission(payload);
    toast.success('Permissions sauvegardées avec succès.', { position: 'top-right' });
  } catch (error) {
    toast.error('Erreur lors de la sauvegarde des permissions.', { position: 'top-right' });
  }
};
</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full md:w-[calc(100%-50px)] mt-8">
      <h1 class="text-2xl font-bold mb-2">Paramètres</h1>
      <p class="text-xl font-bold mb-6">Gestion des permissions</p>

      <div class="flex items-center gap-3 mb-6">
        <span class="font-medium text-sm">Rôle :</span>
        <Select v-model="selectedRole">
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="Choisir un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="role in user.getRoles" :key="role.id" :value="role.name">
              {{ role.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table v-if="selectedRole">
        <TableHeader>
          <TableRow>
            <TableHead class="font-semibold">Ressource</TableHead>
            <TableHead
              v-for="action in actions"
              :key="action"
              class="text-center font-semibold"
            >
              {{ actionLabels[action] }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="resource in allResources" :key="resource">
            <TableCell class="font-medium">
              {{ resourceLabels[resource] }}
            </TableCell>
            <TableCell v-for="action in actions" :key="action" class="text-center">
              <Checkbox
                :checked="hasPermission(selectedRole, resource, action)"
                @update:checked="() => togglePermission(selectedRole, resource, action)"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div v-if="selectedRole" class="mt-6">
        <Button variant="default" @click="savePermissions">Sauvegarder les permissions</Button>
      </div>
    </div>
  </div>
</template>
