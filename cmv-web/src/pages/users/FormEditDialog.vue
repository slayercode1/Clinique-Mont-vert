<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userStore } from '@/store/user';
import { updateUserSchema } from '@/utils/schemas/create-user.schema';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const props = defineProps<{
  open: boolean;
  userId: string | null;
}>();

const user = userStore();
const isLoading = ref<boolean>(false);

const form = useForm({
  validationSchema: toTypedSchema(updateUserSchema),
});

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.userId) {
      await user.fetchRoles();
      await user.fetchServices();
      await user.fetchUser(props.userId);
      form.setFieldValue('email', user.user?.email || '');
      form.setFieldValue('lastname', user.user?.lastname || '');
      form.setFieldValue('firstname', user.user?.firstname || '');
      form.setFieldValue('status', user.user!.status || '');
      form.setFieldValue('roleId', user.user!.roleId || undefined);
      form.setFieldValue('serviceId', user.user!.serviceId || undefined);
    }
  },
  { immediate: true }
);

const updateUser = form.handleSubmit((values: any) => {
  if (!props.userId) return;
  isLoading.value = true;
  user
    .updateuser(values, props.userId)
    .then(() => {
      toast.success("L'utilisateur a bien été modifier.", {
        position: 'top-right',
      });
      isLoading.value = false;
      emit('close');
    })
    .catch((error) => {
      toast.error(error.message, {
        position: 'top-right',
      });
      isLoading.value = false;
    });
});

const status = [
  { value: 'ACTIF', label: 'Activer' },
  { value: 'INACTIF', label: 'Desactiver' },
];
</script>

<template>
  <Dialog :open="props.open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Modifier l'employé</DialogTitle>
        <DialogDescription>Modifiez les informations de l'utilisateur.</DialogDescription>
      </DialogHeader>
      <form class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" @submit="updateUser">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Adresse e-mail</FormLabel>
            <FormControl>
              <Input placeholder="exemple@exemple.com" type="email" v-bind="componentField" />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="lastname">
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input placeholder="Doe" type="text" v-bind="componentField" />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="firstname">
          <FormItem>
            <FormLabel>Prénom</FormLabel>
            <FormControl>
              <Input placeholder="John" type="text" v-bind="componentField" />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="serviceId">
          <FormItem>
            <FormLabel>Service</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un service" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="service in user.getServices" :key="service.id" :value="service.id">
                    {{ service.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="roleId">
          <FormItem>
            <FormLabel>Rôle</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="role in user.getRoles" :key="role.id" :value="role.id">
                    {{ role.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormDescription />
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="status">
          <FormItem>
            <FormLabel>Statut</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="statut in status" :key="statut.value" :value="statut.value">
                    {{ statut.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="col-span-full flex justify-end mt-2">
          <Button type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="loaderBtn"></span>
            <span v-else>Modifier</span>
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
