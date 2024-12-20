<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import { userStore } from '@/store/user';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LucideEye, LucideEyeOff } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { createUserSchema } from '@/utils/schemas/create-user.schema';
import { toast } from 'vue-sonner';

const user = userStore();
const router = useRouter();
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
      router.replace({ path: '/users-list' });
      toast.success('L\'utilisateur a été créé.', {
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

const isPasswordVisible = ref<boolean>(true);
const status = [
  { value: 'ACTIF', label: 'Activer' },
  { value: 'INACTIF', label: 'Desactiver' },
];
</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full mt-8">
      <h1 class="text-2xl font-bold mb-10">Espace Information</h1>
      <p class="text-base font-bold mb-4">Nouvel employé</p>
      <div class="px-4 relative h-auto md:h-h-60 lg:h-60">
        <form class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              @submit.prevent="createUser">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Addresse e-mail</FormLabel>
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
                  <button :aria-label="isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                      " class="absolute inset-y-0 right-0 flex items-center px-2"
                          type="button" @click="isPasswordVisible = !isPasswordVisible">
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
              <FormLabel>Prenom</FormLabel>
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
                    <SelectValue placeholder="Select a service" />
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
              <FormLabel>Role</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
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
              <FormLabel>Status</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
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

          <div class="md:absolute md:bottom-0 md:right-5">
            <Button type="submit">
              <span>Enregistrer</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
