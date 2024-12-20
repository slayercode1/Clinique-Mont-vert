<script lang="ts" setup>
import { h, onBeforeMount } from 'vue';
import DataTable from '@/components/DataTable.vue';
import { ColumnDef } from '@tanstack/vue-table';
import { useRoute, useRouter } from 'vue-router';
import Button from '@/components/ui/button/Button.vue';
import { ArrowUpDown } from 'lucide-vue-next';
import { fleetStore } from '@/store/fleet.ts';
import CostAdd from '@/pages/fleet/CostAdd.vue';
import { CostType, VehicleType } from '@/utils/types';
import DropdownAction from '@/components/data-table-dropdown.vue';

const vehicle = fleetStore();
const router = useRouter();
const route = useRoute();
const { data } = history.state;
const v = data && (JSON.parse(data) as VehicleType & { id: string });

onBeforeMount(async () => {
  await vehicle.fetchCost(route.params.id as string);
});

const handleDelete = async (id: string) => {
  await vehicle.deleteCost(id);
};

const columns: ColumnDef<CostType>[] = [
  {
    accessorKey: 'maintenance_date',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Date de maintenance', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
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
    accessorKey: 'cost',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Coût', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
      );
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('cost'));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat('fr-Fr', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount);

      return h('div', { class: ' font-medium' }, formatted);
    },
  },

  {
    accessorKey: 'description',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Motif', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('description'));
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const cost = row.original as CostType & { id: string };
      return h(
        'div',
        { class: 'relative' },
        h(DropdownAction, {
          data: vehicle,
          url_update: false,
          detail: false,
          handleDelete: () => handleDelete(cost.id),
        }),
      );
    },
  },
];
</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full md:w-[calc(100%-50px)] mt-8">
      <h1 class="text-2xl font-bold mb-4">Espace Automobile</h1>
      <p class="text-xl font-bold mb-4">Historique de {{ v.brand }} {{ v.model }}</p>
      <DataTable
        :click="() => router.push(`/costs-list/${route.params.id}/cost-add`)"
        :columns="columns"
        :data="vehicle.getCosts"
        btn_text="Ajouter un  coût"
        permission-role="FLEET_ADMIN"
      />
    </div>
    <CostAdd />
  </div>
</template>
