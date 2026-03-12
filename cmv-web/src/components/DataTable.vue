<script generic="TData extends Record<string, any>, TValue" lang="ts" setup>
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { valueUpdater } from '@/lib/utils';
import { authStore } from '@/store/auth.ts';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table';
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-vue-next';
import { ref } from 'vue';
import { Input } from './ui/input';

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  click?: () => void;
  btn_text?: string;
  permissionRole: string;
}>();

const columnFilters = ref<ColumnFiltersState>([]);
const globalFilter = ref('');
const sorting = ref<SortingState>([]);
const columnVisibility = ref<VisibilityState>({});

const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onGlobalFilterChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
  getFilteredRowModel: getFilteredRowModel(),
  onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility),
  state: {
    get globalFilter() {
      return globalFilter.value;
    },
    get sorting() {
      return sorting.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
  },
});

const auth = authStore();
</script>

<template>
  <div>
    <div class="flex justify-between items-center my-2">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:w-full">
        <Button v-if="auth.getUser?.role.name === permissionRole || auth.getUser?.role.name === 'SuperAdmin'" @click="click">{{
            props.btn_text
          }}
        </Button>
        <div class="flex gap-2 items-center py-4">
          <Input
            :model-value="globalFilter ?? ''"
            class="max-w-sm"
            placeholder="Rechercher..."
            @update:modelValue="(value) => (globalFilter = String(value))"
          />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button class="ml-auto" variant="outline">
                Colonnes
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
            <TableCell :colspan="columns.length" class="h-40 text-center">
              <div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <SearchX class="w-10 h-10 opacity-40" />
                <p class="text-base font-semibold text-gray-700">Aucun résultat</p>
                <p class="text-sm text-gray-400">Aucune donnée à afficher pour le moment.</p>
              </div>
            </TableCell>
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
