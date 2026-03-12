<script lang="ts" setup>
import Combobox from '@/components/Combobox.vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { authStore } from '@/store/auth.ts';
import { resourceStore } from '@/store/resource.ts';
import { ticketStore } from '@/store/ticket';
import { userStore } from '@/store/user.ts';
import { createTicketSchema } from '@/utils/schemas/create-ticket.schema.ts';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { onBeforeMount, ref } from 'vue';
import { toast } from 'vue-sonner';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const props = defineProps<{
  open: boolean;
}>();

const ticket = ticketStore();
const resource = resourceStore();
const user = userStore();
const auth = authStore();
const isLoading = ref<boolean>(false);

const formSchema = toTypedSchema(createTicketSchema.omit({ resolvedById: true, status: true }));

const form = useForm({
  validationSchema: formSchema,
});

onBeforeMount(async () => {
  await resource.fetchResources();
  await user.fetchUsers();
  await user.fetchServices();
});

const createTicket = form.handleSubmit((values) => {
  isLoading.value = true;
  ticket
    .createTicket(values)
    .then(() => {
      toast.success('Le ticket a été créé.', {
        position: 'top-right',
      });
      isLoading.value = false;
      form.resetForm();
      emit('close');
    })
    .catch((error) => {
      toast.error(error.message, {
        position: 'top-right',
      });
      isLoading.value = false;
    });
});

const priorities = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGT', label: 'Fort' },
];
</script>

<template>
  <Dialog :open="props.open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Créer un ticket</DialogTitle>
        <DialogDescription>Remplissez les informations pour créer un nouveau ticket.</DialogDescription>
      </DialogHeader>
      <form class="space-y-4" @submit="createTicket">
        <FormField name="employeeId">
          <FormItem>
            <FormLabel>Employé</FormLabel>
            <Combobox
              :data="
                user.getUsers.map((u) => {
                  return {
                    value: u.id,
                    label: u?.firstname + ' ' + u?.lastname,
                  };
                })
              "
              :setFieldValue="form.setFieldValue"
              name="employeeId"
            />
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-if="['IT_USER', 'IT_ADMIN'].includes(auth.getUser?.role.name as string)"
          name="assignId"
        >
          <FormItem>
            <FormLabel>Utilisateur assigné</FormLabel>
            <Combobox
              :data="
                user.getUsers.map((u) => {
                  return {
                    value: u.id,
                    label: u?.firstname + ' ' + u?.lastname,
                  };
                })
              "
              :setFieldValue="form.setFieldValue"
              name="assignId"
            />
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="serviceId">
          <FormItem>
            <FormLabel>Service</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Choisissez un service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="option in user.getServices"
                      :key="option.id"
                      :value="option.id"
                    >
                      {{ option.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="priority">
          <FormItem>
            <FormLabel>Priorité</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Choisissez une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="option in priorities"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField name="materialId">
          <FormItem>
            <FormLabel>Matériel</FormLabel>
            <Combobox
              :data="
                resource.getResources.map((r) => {
                  return {
                    value: r.id!,
                    label: r.resource,
                  };
                })
              "
              :setFieldValue="form.setFieldValue"
              name="materialId"
            />
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>Problème</FormLabel>
            <FormControl>
              <Textarea
                class="resize-none"
                placeholder="Décrivez le problème rencontré"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="flex justify-end">
          <Button type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="loaderBtn"></span>
            <span v-else>Enregistrer</span>
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
