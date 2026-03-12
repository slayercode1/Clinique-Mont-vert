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
import { Resource, resourceStore } from '@/store/resource';
import { ColumnDef } from '@tanstack/vue-table';
import { ArrowUpDown } from 'lucide-vue-next';
import { h, onBeforeMount, ref } from 'vue';
import FormAddDialog from './FormAddDialog.vue';
import FormEditDialog from './FormEditDialog.vue';

const resource = resourceStore();

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
});

const showAddDialog = ref(false);
const showEditDialog = ref(false);
const selectedResourceId = ref<string | null>(null);

onBeforeMount(async () => {
  await resource.fetchResources();
});

const handleDelete = async (id: string) => {
  await resource.deleteResource(id);
};

const openEditDialog = (id: string) => {
  selectedResourceId.value = id;
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  selectedResourceId.value = null;
};

const closeAddDialog = () => {
  showAddDialog.value = false;
};

const columns: ColumnDef<Resource>[] = [
  {
    accessorKey: 'type',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Type', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('type'));
    },
  },
  {
    accessorKey: 'resource',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Ressource', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('resource'));
    },
  },
  {
    accessorKey: 'location',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Localisation', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('location'));
    },
  },
  {
    accessorKey: 'state',
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
      const state = row.getValue('state') as string;
      const stateStyles = {
        IN_USE: 'bg-green-500 text-white',
        OUT_OF_SERVICE: 'bg-red-500 text-white',
        IN_REPAIR: 'bg-yellow-500 text-black',
      };

      const badge = h(
        Badge,
        {
          class: `font-medium ${(stateStyles as any)[state] || 'bg-gray-200 text-black'}`,
        },
        state.replace('_', ' ')
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
                onClick: () => resource.updateResource({ state: 'IN_USE' }, row.original?.id!),
              },
              'En service'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () =>
                  resource.updateResource({ state: 'OUT_OF_SERVICE' }, row.original?.id!),
              },
              'Hors service'
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () => resource.updateResource({ state: 'IN_REPAIR' }, row.original?.id!),
              },
              'En réparation'
            ),
          ]),
        ])
      );
    },
  },
  {
    accessorKey: 'purchase_date',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ["Date d'achat", h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })]
      );
    },
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'font-medium' },
        dateFormatter.format(new Date(row.getValue('purchase_date')))
      );
    },
  },
  {
    accessorKey: 'supplier',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Fournisseur', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('supplier'));
    },
  },
  {
    accessorKey: 'expired_at',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Expiration Licence', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })]
      );
    },
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'font-medium' },
        dateFormatter.format(new Date(row.getValue('expired_at')))
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const r = row.original as Resource;
      return h(
        'div',
        { class: 'relative' },
        h(DropdownAction, {
          data: r,
          url_update: true,
          detail: false,
          handleDelete: () => handleDelete(r.id as string),
          onViewUpdate: () => openEditDialog(r.id as string),
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
          <p class="text-xl font-bold mb-4">Liste des Ressources: {{ resource.countAll }}</p>
        </div>
        <div class="hidden lg:flex lg:gap-4">
          <Card class="h-10 flex items-center justify-center p-4 bg-gray-100 rounded-md shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold">{{ resource.countService }}</span>
              <span class="text-gray-500">En service</span>
            </div>
          </Card>
          <Card class="h-10 flex items-center justify-center p-4 bg-gray-100 rounded-md shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold">{{ resource.countInRepair }}</span>
              <span class="text-gray-500">En réparation</span>
            </div>
          </Card>
          <Card class="h-10 flex items-center justify-center p-4 bg-gray-100 rounded-md shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold">{{ resource.countOutOfService }}</span>
              <span class="text-gray-500">Hors service</span>
            </div>
          </Card>
        </div>
      </div>
      <DataTable
        :click="() => (showAddDialog = true)"
        :columns="columns"
        :data="resource.getResources"
        btn_text="Ajouter une ressource"
        permission-role="IT_ADMIN"
      />
    </div>
  </div>

  <FormAddDialog :open="showAddDialog" @close="closeAddDialog" />
  <FormEditDialog :open="showEditDialog" :resource-id="selectedResourceId" @close="closeEditDialog" />
</template>
