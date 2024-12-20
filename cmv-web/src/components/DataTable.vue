<script generic="TData extends Record<string, any>, TValue" lang="ts" setup>
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/vue-table';
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { Input } from './ui/input';
import { ref } from 'vue';
import { valueUpdater } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authStore } from '@/store/auth.ts';

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  click?: () => void;
  btn_text?: string;
  permissionRole: string;
}>();

// Références réactives pour gérer les filtres, tri, pagination et visibilité des colonnes
const columnFilters = ref<ColumnFiltersState>([]); // Filtres pour les colonnes
const globalFilter = ref(''); // Filtre global appliqué sur toute la table
const sorting = ref<SortingState>([]); // État du tri appliqué sur les colonnes
const columnVisibility = ref<VisibilityState>({}); // Visibilité des colonnes

// Initialisation de la table avec les différentes fonctionnalités
const table = useVueTable({
  // Les données de la table proviennent des props
  get data() {
    return props.data; // Récupère les données de la table depuis les props
  },
  // Les colonnes de la table proviennent des props
  get columns() {
    return props.columns; // Récupère les colonnes depuis les props
  },
  // Utilisation des modèles de ligne pour différentes fonctionnalités
  getCoreRowModel: getCoreRowModel(), // Récupère le modèle de ligne de base
  getPaginationRowModel: getPaginationRowModel(), // Récupère le modèle de pagination
  getSortedRowModel: getSortedRowModel(), // Récupère le modèle de tri
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting), // Met à jour l'état du tri lorsqu'il change
  onGlobalFilterChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters), // Met à jour l'état des filtres globaux lorsqu'ils changent
  getFilteredRowModel: getFilteredRowModel(), // Récupère le modèle de lignes filtrées
  onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility), // Met à jour l'état de la visibilité des colonnes lorsqu'il change
  state: {
    // Accès aux états réactifs utilisés pour la table
    get globalFilter() {
      return globalFilter.value; // Retourne la valeur du filtre global
    },
    get sorting() {
      return sorting.value; // Retourne l'état du tri
    },
    get columnVisibility() {
      return columnVisibility.value; // Retourne l'état de la visibilité des colonnes
    },
  },
});

const auth = authStore();
</script>

<template>
  <div>
    <div class="flex justify-between items-center my-2">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:w-full">
        <Button v-if="auth.getUser?.role.name === permissionRole || 'SuperAdmin'" @click="click">{{
            props.btn_text
          }}
        </Button>
        <div class="flex gap-2 items-center py-4">
          <Input
            :model-value="globalFilter ?? ''"
            class="max-w-sm"
            placeholder="Recheche..."
            @update:modelValue="(value) => (globalFilter = String(value))"
          />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button class="ml-auto" variant="outline">
                Columns
                <ChevronDown class="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
                :key="column.id"
                :checked="column.getIsVisible()"
                class="capitalize"
                @update:checked="
                  (value) => {
                    column.toggleVisibility(!!value);
                  }
                "
              >
                {{ column.id }}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :props="header.getContext()"
              :render="header.column.columnDef.header"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :props="cell.getContext()" :render="cell.column.columnDef.cell" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center"> No results.</TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
  <div v-if="table.getRowModel().rows?.length" class="flex justify-end py-1 h-12">
    <div class="bg-slate-100 flex items-center space-x-2 rounded-md p-2">
      <Button
        :disabled="!table.getCanPreviousPage()"
        class="disabled:text-slate-100"
        size="sm"
        variant="ghost"
        @click="table.previousPage()"
      >
        <ChevronLeft />
      </Button>
      <p class="font-bold">Page {{ table.getState().pagination.pageIndex + 1 }}</p>
      <Button
        :disabled="!table.getCanNextPage()"
        class="disabled:text-slate-100"
        size="sm"
        variant="ghost"
        @click="table.nextPage()"
      >
        <ChevronRight />
      </Button>
    </div>
  </div>
</template>
