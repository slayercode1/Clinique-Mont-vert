<script lang="ts" setup>
import DataTable from '@/components/DataTable.vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { userStore } from '@/store/user.ts';
import { ColumnDef } from '@tanstack/vue-table';
import { toTypedSchema } from '@vee-validate/zod';
import { ArrowUpDown } from 'lucide-vue-next';
import { h, onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import * as z from 'zod';

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

const columns: ColumnDef<{ id: string; name: string }>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Identifiant', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
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
        () => ['Nom du service', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('name'));
    },
  },
];

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Le nom du service est requis'),
  })
);

function onSubmit(values: { name: string }) {
  user
    .createService(values)
    .then(() => {
      toast.success('Le service a été créé.', { position: 'top-right' });
      closeDialog();
    })
    .catch((error: Error) => {
      toast.error(error.message, { position: 'top-right' });
    });
}
</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full md:w-[calc(100%-50px)] mt-8">
      <h1 class="text-2xl font-bold mb-2">Paramètres</h1>
      <p class="text-xl font-bold mb-4">Liste des services : {{ user.getServices.length }}</p>
      <DataTable
        :click="openDialog"
        :columns="columns"
        :data="user.getServices"
        btn_text="Ajouter un service"
        permission-role="SuperAdmin"
      />

      <Form v-slot="{ handleSubmit }" :validation-schema="formSchema" as="">
        <Dialog :open="isDialogOpen">
          <DialogContent :close="closeDialog" class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nouveau service</DialogTitle>
              <DialogDescription>Remplissez le nom du service à créer.</DialogDescription>
            </DialogHeader>
            <form id="serviceForm" @submit="handleSubmit($event, onSubmit)">
              <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                  <FormLabel>Nom du service</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Informatique" type="text" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </form>
            <DialogFooter>
              <Button variant="outline" @click="closeDialog">Annuler</Button>
              <Button form="serviceForm" type="submit">Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Form>
    </div>
  </div>
</template>
