<script lang="ts" setup>
import DataTable from '@/components/DataTable.vue';
import DropdownAction from '@/components/data-table-dropdown.vue';
import Badge from '@/components/ui/badge/Badge.vue';
import Button from '@/components/ui/button/Button.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, userStore } from '@/store/user';
import { ColumnDef } from '@tanstack/vue-table';
import { ArrowUpDown } from 'lucide-vue-next';
import { h, onBeforeMount, ref } from 'vue';
import FormAddDialog from './FormAddDialog.vue';
import FormEditDialog from './FormEditDialog.vue';

const user = userStore();

const showAddDialog = ref(false);
const showEditDialog = ref(false);
const selectedUserId = ref<string | null>(null);

onBeforeMount(async () => {
  await user.fetchUsers();
});

const handleDelete = async (id: string) => {
  await user.deleteUser(id);
};

const openEditDialog = (id: string) => {
  selectedUserId.value = id;
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  selectedUserId.value = null;
};

const closeAddDialog = () => {
  showAddDialog.value = false;
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'lastname',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Nom', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('lastname'));
    },
  },
  {
    accessorKey: 'firstname',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Prénom', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('firstname'));
    },
  },

  {
    accessorKey: 'email',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Adresse e-mail', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('email'));
    },
  },
  {
    accessorKey: 'service',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Service', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, (row.getValue('service') as { name: string }).name);
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Statut', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })]
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const color = status === 'ACTIF' ? 'bg-green-500 text-white' : 'bg-red-500 text-white';

      const badge = h(Badge, { class: `font-medium ${color}` }, status);

      return h(
        'div',
        { class: 'flex items-center space-x-2' },
        h(DropdownMenu, [
          h(
            DropdownMenuTrigger,
            {
              onClick: (e: MouseEvent) => {
                e.stopPropagation();
              },
            },
            [badge]
          ),
          h(DropdownMenuContent, [
            h(
              DropdownMenuItem,
              {
                onClick: () =>
                  user.updateuser(
                    {
                      ...row.original,
                      status: 'ACTIF',
                    },
                    row.original.id
                  ),
              },
              'ACTIF'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () =>
                  user.updateuser(
                    {
                      ...row.original,
                      status: 'INACTIF',
                    },
                    row.original.id
                  ),
              },
              'INACTIF'
            ),
          ]),
        ])
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const u = row.original as User;
      return h(
        'div',
        { class: 'relative w-4' },
        h(DropdownAction, {
          data: u,
          url_update: true,
          detail: false,
          handleDelete: () => handleDelete(u.id),
          onViewUpdate: () => openEditDialog(u.id),
        })
      );
    },
  },
];
</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full md:w-[calc(100%-50px)] mt-8">
      <h1 class="text-2xl font-bold mb-2">Espace Information</h1>
      <p class="text-xl font-bold mb-4">Liste des comptes d'employé: {{ user.count }}</p>
      <DataTable
        :click="() => (showAddDialog = true)"
        :columns="columns"
        :data="user.getUsers"
        btn_text="Ajouter un utilisateur"
        permission-role="IT_ADMIN"
      />
    </div>
  </div>

  <FormAddDialog :open="showAddDialog" @close="closeAddDialog" />
  <FormEditDialog :open="showEditDialog" :user-id="selectedUserId" @close="closeEditDialog" />
</template>
