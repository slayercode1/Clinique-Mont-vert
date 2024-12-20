<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { ticketStore } from '@/store/ticket';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { Textarea } from '@/components/ui/textarea';
import { onBeforeMount, ref } from 'vue';
import { resourceStore } from '@/store/resource.ts';
import Combobox from '@/components/Combobox.vue';
import { userStore } from '@/store/user.ts';
import { authStore } from '@/store/auth.ts';
import { createTicketSchema } from '@/utils/schemas/create-ticket.schema.ts';

const router = useRouter();
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
  await user.fetchServices()
});

const createTicket = form.handleSubmit((values) => {
  isLoading.value = true;
  ticket
    .createTicket(values)
    .then(() => {
      if (['IT_ADMIN'].includes(auth.getUser!.role.name)) {
        router.replace({ path: '/tickets-list' });
      } else {
        router.replace({ path: '/fleets-list' });
      }
      toast.success('Le ticket a été créé.', {
        position: 'top-right',
      });
      isLoading.value = false;
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
  <div class="flex w-full">
    <div class="p-2 w-full mt-8">
      <h1 class="text-2xl font-bold mb-10">Espace Information</h1>
      <p class="text-base font-bold mb-4">Ticket N° 1002</p>
      <div class="px-4 relative h-auto md:h-1/2 lg:h-1/2 w-1/2 m-auto">
        <form @submit="createTicket" class="space-y-4">
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
                name="employeeId"
                :setFieldValue="form.setFieldValue"
              />
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField
            name="assignId"
            v-if="['IT_USER', 'IT_ADMIN'].includes(auth.getUser?.role.name as string)"
          >
            <FormItem>
              <FormLabel>Utilisateur assigner</FormLabel>

              <Combobox
                :data="
                  user.getUsers.map((u) => {
                    return {
                      value: u.id,
                      label: u?.firstname + ' ' + u?.lastname,
                    };
                  })
                "
                name="assignId"
                :setFieldValue="form.setFieldValue"
              />
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField name="service" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Service</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Choissisez un service" />
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
          <FormField name="priority" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Priorité</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Choissisez une prioriter" />
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
              <FormLabel>Materiel</FormLabel>
              <Combobox
                :data="
                  resource.getResoures.map((r) => {
                    return {
                      value: r.id!,
                      label: r.resource,
                    };
                  })
                "
                name="materialId"
                :setFieldValue="form.setFieldValue"
              />
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField name="description" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Problème</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  class="resize-none"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <div class="w-full text-center">
            <Button type="submit">
              <span v-if="isLoading" class="loaderBtn"></span>
              <span v-else>Enregistrer</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
