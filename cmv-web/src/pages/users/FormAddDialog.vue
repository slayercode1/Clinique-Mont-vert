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
import { createUserSchema } from '@/utils/schemas/create-user.schema';
import { toTypedSchema } from '@vee-validate/zod';
import { LucideEye, LucideEyeOff } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const props = defineProps<{
  open: boolean;
}>();

const user = userStore();
const isLoading = ref<boolean>(false);

const form = useForm({
  validationSchema: toTypedSchema(createUserSchema),
});

onMounted(async () => {
  await user.fetchRoles();
  await user.fetchServices();
});

const createUser = form.handleSubmit((values: any) => {
  isLoading.value = true;
  user
    .createUser(values)
    .then(() => {
      toast.success("L'utilisateur a été créé.", {
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

const isPasswordVisible = ref<boolean>(true);
const status = [
  { value: 'ACTIF', label: 'Activer' },
  { value: 'INACTIF', label: 'Desactiver' },
];
</script>

<template>
  <Dialog :open="props.open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Nouvel employé</DialogTitle>
        <DialogDescription>Remplissez les informations pour créer un nouvel utilisateur.</DialogDescription>
      </DialogHeader>
      <form class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" @submit.prevent="createUser">
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
        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <div class="relative">
                <component :is="Input" :type="isPasswordVisible ? 'password' : 'text'" class="pr-10"
                           v-bind="componentField" />
                <button
                  :aria-label="isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                  class="absolute inset-y-0 right-0 flex items-center px-2"
                  type="button"
                  @click="isPasswordVisible = !isPasswordVisible"
                >
                  <LucideEye v-if="isPasswordVisible" class="h-5 w-5 text-gray-500" />
                  <LucideEyeOff v-else class="h-5 w-5 text-gray-500" />
                </button>
              </div>
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
            <span v-else>Enregistrer</span>
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
