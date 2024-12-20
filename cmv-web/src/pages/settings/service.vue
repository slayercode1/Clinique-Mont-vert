<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { userStore } from '@/store/user.ts';
import DataTable from '@/components/DataTable.vue';
import { ColumnDef } from '@tanstack/vue-table';
import Button from '../../components/ui/button/Button.vue';
import { ArrowUpDown } from 'lucide-vue-next';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { toast } from 'vue-sonner';

const isDialogOpen = ref(false);
const user = userStore();
onMounted(async () => {
  await user.fetchServices();
});

const openDialog = () => {
  isDialogOpen.value = true;
};

const closeDialog = () => {
  isDialogOpen.value = false;
};

const columns: ColumnDef<{ name: string }>[] = [

  {
    accessorKey: 'id',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Identifiant', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('id'));
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Rôle', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('name'));
    },
  },
];

const formSchema = toTypedSchema(z.object({
  name: z.string(),
}));

function onSubmit(values: any) {
  user.createService(values).then(() => {
    toast.success('Le service a été créé.', {
      position: 'top-right',
    });
  })
    .catch((error) => {
      toast.error(error.message, {
        position: 'top-right',
      });
    });

  closeDialog();
}

</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full md:w-[calc(100%-50px)] mt-8">
      <DataTable
        :click="openDialog"
        :columns="columns"
        :data="user.getServices"
        btn_text="Ajouter un service"
        permission-role="IT_ADMIN"
      />
      <Form v-slot="{ handleSubmit }" :validation-schema="formSchema" as="" keep-values>
        <Dialog :open="isDialogOpen">
          <DialogContent :close="closeDialog" class="sm:max-w-[425px]">
            <form id="dialogForm" @submit="handleSubmit($event, onSubmit)">
              <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" type="text" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </form>

            <DialogFooter>
              <Button form="dialogForm" type="submit">
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Form>
    </div>
  </div>
</template>
