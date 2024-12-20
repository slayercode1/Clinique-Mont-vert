<script lang="ts" setup>
import { h, onBeforeMount } from 'vue';
import DataTable from '@/components/DataTable.vue';
import { ColumnDef } from '@tanstack/vue-table';
import { useRouter } from 'vue-router';
import Button from '@/components/ui/button/Button.vue';
import { ArrowUpDown } from 'lucide-vue-next';
import { User, userStore } from '@/store/user';
import Badge from '@/components/ui/badge/Badge.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DropdownAction from '@/components/data-table-dropdown.vue';

const user = userStore();
const router = useRouter();

onBeforeMount(async () => {
  await user.fetchUsers();
});

const handleDelete = async (id: string) => {
  await user.deleteUser(id);
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
        () => ['Nom', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
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
        () => ['Prénom', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
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
        () => ['Addresse e-mail', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
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
        () => ['Service', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
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
        () => ['Status', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })],
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
                e.stopPropagation(); // Empêcher la propagation du clic
              },
            },
            [
              badge, // Affiche la valeur actuelle de l'état dans le bouton
            ],
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
                    row.original.id,
                  ),
              },
              'ACTIF',
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
                    row.original.id,
                  ),
              },
              'INACTIF',
            ),
          ]),
        ]),
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original as User;
      return h(
        'div',
        { class: 'relative w-4' },
        h(DropdownAction, {
          data: user,
          url: `/user-update/${user.id}`,
          detail: false,
          handleDelete: () => handleDelete(user.id),
        }),
      );
    },
  },
];
</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full md:w-[calc(100%-50px)] mt-8">
      <h1 class="text-2xl font-bold mb-2">Espace Information</h1>
      <p class="text-xl font-bold mb-4">Liste des comptes d’employé: {{ user.count }}</p>
      <DataTable
        :click="() => router.push('/user-add')"
        :columns="columns"
        :data="user.getUsers"
        btn_text="Ajouter un utilisateur"
        permission-role="IT_ADMIN"
      />
    </div>
  </div>
</template>
