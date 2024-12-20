<script lang="ts" setup>
import { onMounted, ref } from 'vue';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { userStore } from '@/store/user';
import { toast } from 'vue-sonner';
import { Payload } from '@/utils/types';

const user = userStore();

// Liste statique des ressources
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

// Actions possibles
const actions = ['read', 'edit', 'add', 'delete'];
// État réactif pour les permissions
const permissionsData = ref({});
const selectedRole = ref('SuperAdmin');
// const newRoleName = ref('');

// Charger les données initiales
onMounted(async () => {
  await user.fetchRoles();
  await user.fetchPermissions();

  // Copie profonde des permissions
  permissionsData.value = JSON.parse(JSON.stringify(user.getPermissions));
});

// Vérifier si une permission existe
const hasPermission = (role: string, resource: string, action: string) => {
  return permissionsData.value[role]?.[resource]?.includes(action) || false;
};

// Basculer une permission
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
      }),
    ),
  };

  try {
    await user.createOrUpdatePermission(payload);
    // Ajouter un toast de succès
    toast.success('Permissions sauvegardées avec succès.', {
      position: 'top-right',
    });
  } catch (error) {
    // Gérer les erreurs
    console.error('Erreur lors de la sauvegarde', error);
    toast.error('Erreur lors de la sauvegarde des permissions.', {
      position: 'top-right',
    });
  }
};
</script>

<template>
  <div class="p-6 space-y-4 w-full">
    <div class="flex items-center space-x-4">
      <span class="font-medium">Sélectionner un rôle :</span>
      <Select v-model="selectedRole">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Choisir un rôle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="role in user.getRoles" :key="role.id" :value="role.name">
            {{ role.name.charAt(0).toUpperCase() + role.name.slice(1) }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <Table v-if="selectedRole">
      <TableHeader>
        <TableRow>
          <TableHead>Ressources</TableHead>
          <TableHead v-for="action in actions" :key="action" class="text-center">
            {{ action.charAt(0).toUpperCase() + action.slice(1) }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="resource in allResources" :key="resource">
          <TableCell class="font-medium">
            {{ resource.charAt(0).toUpperCase() + resource.slice(1) }}
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

    <!-- Bouton de sauvegarde -->
    <div v-if="selectedRole" class="mt-4">
      <Button variant="default" @click="savePermissions"> Sauvegarder les permissions </Button>
    </div>
  </div>
</template>
