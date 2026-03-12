<script lang="ts" setup>
import DataTable from '@/components/DataTable.vue';
import DropdownAction from '@/components/data-table-dropdown.vue';
import Badge from '@/components/ui/badge/Badge.vue';
import Button from '@/components/ui/button/Button.vue';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ticket, ticketStore } from '@/store/ticket';
import { userStore } from '@/store/user.ts';
import { UserType } from '@/utils/types';
import { ColumnDef } from '@tanstack/vue-table';
import { ArrowUpDown } from 'lucide-vue-next';
import { h, onBeforeMount, ref } from 'vue';
import FormsDialog from './FormsDialog.vue';

const ticket = ticketStore();
const user = userStore();

const showAddDialog = ref(false);

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
});

onBeforeMount(() => {
  Promise.all([ticket.fetchTickets(), user.fetchUsers()]);
});

const closeAddDialog = () => {
  showAddDialog.value = false;
};

const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Date Création', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'font-medium' },
        dateFormatter.format(new Date(row.getValue('created_at')))
      );
    },
  },
  {
    accessorKey: 'employee',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Employé', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'font-medium' },
        (row.getValue('employee') as UserType)
          ? (row.getValue('employee') as UserType).lastname +
              ' ' +
              (row.getValue('employee') as UserType).firstname
          : '--'
      );
    },
  },
  {
    accessorKey: 'decription',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Problème', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('decription'));
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
        () => ['Etat', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })]
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusStyles = {
        IN_PROGRESS: 'bg-blue-500 text-white',
        TODO: 'bg-gray-500 text-white',
        BLOCKED: 'bg-red-500 text-white',
        CLOSED: 'bg-green-500 text-white',
        IN_VALIDATE: 'bg-yellow-500 text-white',
        VALIDE: 'bg-teal-500 text-white',
        NOT_VALIDATE: 'bg-orange-500 text-white',
      };

      const badge = h(
        Badge,
        {
          class: `font-medium ${(statusStyles as any)[status] || 'bg-gray-200 text-black'}`,
        },
        status.replace('_', ' ')
      );

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
                onClick: () => ticket.updateTicket({ status: 'IN_PROGRESS' }, row.original.id),
              },
              'IN_PROGRESS'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () => ticket.updateTicket({ status: 'TODO' }, row.original.id),
              },
              'TODO'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () => ticket.updateTicket({ status: 'BLOCKED' }, row.original.id),
              },
              'BLOCKED'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () => ticket.updateTicket({ status: 'CLOSED' }, row.original.id),
              },
              'CLOSED'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () =>
                  ticket.updateTicket(
                    {
                      status: 'IN_VALIDATE',
                      resolvedBy: row.original.assign?.id,
                      validated_at: new Date(),
                    },
                    row.original.id
                  ),
              },
              'IN_VALIDATE'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () =>
                  ticket.updateTicket(
                    {
                      status: 'VALIDE',
                    },
                    row.original.id
                  ),
              },
              'VALIDE'
            ),
          ]),
        ])
      );
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Priorité', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })]
      );
    },
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string;
      const priorityStyles = {
        HIGT: 'bg-red-600 text-white',
        MEDIUM: 'bg-yellow-500 text-white',
        LOW: 'bg-green-500 text-white',
      };

      const badge = h(
        Badge,
        {
          class: `font-medium ${(priorityStyles as any)[priority] || 'bg-gray-200 text-black'}`,
        },
        priority.replace('_', ' ')
      );

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
                onClick: () => ticket.updateTicket({ priority: 'HIGT' }, row.original.id),
              },
              'HIGT'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () => ticket.updateTicket({ priority: 'MEDIUM' }, row.original.id),
              },
              'MEDIUM'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () => ticket.updateTicket({ priority: 'LOW' }, row.original.id),
              },
              'LOW'
            ),
          ]),
        ])
      );
    },
  },
  {
    accessorKey: 'validated_at',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Date Résolution', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })]
      );
    },
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'font-medium' },
        row.getValue('validated_at') !== null
          ? dateFormatter.format(new Date(row.getValue('validated_at')))
          : '--'
      );
    },
  },
  {
    accessorKey: 'resolvedBy',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Résolu par', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })]
      );
    },
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'font-medium' },
        (row.getValue('resolvedBy') as UserType)
          ? (row.getValue('resolvedBy') as UserType).lastname +
              ' ' +
              (row.getValue('resolvedBy') as UserType).firstname
          : '--'
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const t = row.original as Ticket;
      return h(
        'div',
        { class: 'relative' },
        h(DropdownAction, {
          data: t,
          detail: true,
          url_detail: `/ticket/${t.id}`,
          url_update: false,
        })
      );
    },
  },
];
</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full md:w-[calc(100%-50px)] mt-8">
      <div class="flex justify-between w-full">
        <div>
          <h1 class="text-2xl font-bold mb-4">Espace Information</h1>
          <p class="text-xl font-bold mb-4">Liste des Tickets: {{ ticket.countAll }}</p>
        </div>
        <div class="hidden lg:flex lg:gap-4">
          <Card class="h-10 flex items-center justify-center p-4 bg-gray-100 rounded-md shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold">{{ ticket.countTodo }}</span>
              <span class="text-gray-500">Ouvert</span>
            </div>
          </Card>
          <Card class="h-10 flex items-center justify-center p-4 bg-gray-100 rounded-md shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold">{{ ticket.countInProgress }}</span>
              <span class="text-gray-500">En cours</span>
            </div>
          </Card>
          <Card class="h-10 flex items-center justify-center p-4 bg-gray-100 rounded-md shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold">{{ ticket.countBlocked }}</span>
              <span class="text-gray-500">Bloquer</span>
            </div>
          </Card>
        </div>
      </div>
      <DataTable
        :click="() => (showAddDialog = true)"
        :columns="columns"
        :data="ticket.getTickets"
        btn_text="Créer un ticket"
        permission-role="IT_ADMIN"
      />
    </div>
  </div>

  <FormsDialog :open="showAddDialog" @close="closeAddDialog" />
</template>
