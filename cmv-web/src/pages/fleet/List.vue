<script lang="ts" setup>
import { h, onBeforeMount } from 'vue';
import DataTable from '@/components/DataTable.vue';
import { ColumnDef } from '@tanstack/vue-table';
import { useRouter } from 'vue-router';
import Button from '@/components/ui/button/Button.vue';
import { ArrowUpDown } from 'lucide-vue-next';
import { fleetStore } from '@/store/fleet.ts';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Badge from '@/components/ui/badge/Badge.vue';
import DropdownAction from '@/components/data-table-dropdown.vue';
import { VehicleType } from '@/utils/types';

const vehicle = fleetStore();
const router = useRouter();

onBeforeMount(async () => {
  await vehicle.fetchFleets();
});

const handleDelete = async (id: string) => {
  await vehicle.deleteVehicle(id);
};

const columns: ColumnDef<VehicleType & { id?: string }>[] = [
  {
    accessorKey: 'brand',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Marque', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('brand'));
    },
  },
  {
    accessorKey: 'model',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Modèle', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('model'));
    },
  },

  {
    accessorKey: 'year',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Année', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('year'));
    },
  },
  {
    accessorKey: 'kilometres',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Kilométrage', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('kilometres'));
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
        () => ['Statut', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })],
      );
    },
    cell: ({ row }) => {
      const state = row.getValue('state') as string;
      const stateStyles = {
        IN_USE: 'bg-green-500 text-white',
        AVAILABLE: 'bg-red-500 text-white',
        IN_REPAIR: 'bg-yellow-500 text-black',
      };

      const badge = h(
        Badge,
        {
          class: `font-medium ${(stateStyles as any)[state] || 'bg-gray-200 text-black'}`,
        },
        state.replace('_', ' '), // Affiche l'état de manière lisible (ex. "IN_USE" devient "In Use")
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
            [badge],
          ),
          h(DropdownMenuContent, [
            h(
              DropdownMenuItem,
              {
                onClick: () => vehicle.updateFleet({ state: 'IN_USE' }, row.original?.id!),
              },
              'In Use',
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () => vehicle.updateFleet({ state: 'AVAILABLE' }, row.original?.id!),
              },
              'AVAILABLE',
            ),
            h(
              DropdownMenuItem,
              {
                onClick: () => vehicle.updateFleet({ state: 'IN_REPAIR' }, row.original?.id!),
              },
              'In Repair',
            ),
          ]),
        ]),
      );
    },
  },
  {
    accessorKey: 'maintenance_date',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Dernière maintenance', h(ArrowUpDown, { class: 'ml-2 h-4 w-4 text-center' })],
      );
    },
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'font-medium' },
        row.getValue('maintenance_date') !== null
          ? new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
          }).format(new Date(row.getValue('maintenance_date')))
          : '--',
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const vehicle = row.original as VehicleType & { id: string };
      return h(
        'div',
        { class: 'relative' },
        h(DropdownAction, {
          data: vehicle,
          url_detail: `/costs-list/${vehicle.id}`,
          url: `fleet-update/${vehicle.id}`,
          detail: true,
          handleDelete: () => handleDelete(vehicle.id),
        }),
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
          <h1 class="text-2xl font-bold mb-4">Espace Automobile</h1>
          <p class="text-xl font-bold mb-4">Liste des Véhicucles: {{ vehicle.countAll }}</p>
        </div>
        <div class="hidden lg:flex lg:gap-4">
          <Card class="h-10 flex items-center justify-center p-4 bg-gray-100 rounded-md shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold">{{ vehicle.countService }}</span>
              <span class="text-gray-500">En service</span>
            </div>
          </Card>
          <Card class="h-10 flex items-center justify-center p-4 bg-gray-100 rounded-md shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold">{{ vehicle.countInRepair }}</span>
              <span class="text-gray-500">En réparation</span>
            </div>
          </Card>
          <Card class="h-10 flex items-center justify-center p-4 bg-gray-100 rounded-md shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold">{{ vehicle.countAvailable }}</span>
              <span class="text-gray-500">Disponible</span>
            </div>
          </Card>
        </div>
      </div>
      <DataTable
        :click="() => router.push('/fleet-add')"
        :columns="columns"
        :data="vehicle.getFleets"
        btn_text="Ajouter un Véhicule"
        permission-role="FLEET_ADMIN"
      />
    </div>
  </div>
</template>
