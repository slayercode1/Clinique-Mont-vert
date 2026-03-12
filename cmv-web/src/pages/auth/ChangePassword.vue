<script setup lang="ts">
import { AutoForm } from '@/components/ui/auto-form';
import { Button } from '@/components/ui/button';
import { authStore } from '@/store/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import z from 'zod';

const auth = authStore();
const router = useRouter();
const isLoading = ref<boolean>(false);

const formChangePasswordSchema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(128),
});

const redirectByRole = () => {
  const roleName = auth.getUser?.role.name || '';
  if (roleName.startsWith('IT') || roleName === 'SuperAdmin') return '/users-list';
  if (roleName.startsWith('FLEET')) return '/fleets-list';
  return '/';
};

const handleSubmit = (value: Record<string, string>) => {
  isLoading.value = true;
  auth
    .updateUser({ ...value, isChangePassword: true })
    .then(async (data) => {
      toast.success(data?.message, {
        position: 'top-right',
      });
      await auth.session();
      router.replace(redirectByRole());
    })
    .catch((error) => {
      toast.error(error?.message, {
        position: 'top-right',
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
};
</script>

<template>
  <div class="grid place-items-center h-screen w-screen">
    <div class="w-[450px]">
      <h1 class="text-center text-2xl font-bold text-black sm:text-3xl mb-8">
        Changer votre mot de passe
      </h1>
      <p class="text-center text-gray-600 mt-2">
        Pour sécuriser votre compte et continuer à utiliser l'application, il est obligatoire de
        changer votre mot de passe provisoire.
      </p>
      <AutoForm class="mb-0 mt-6 space-y-4 p-4 sm:p-6 lg:p-8" @submit="handleSubmit" :schema="formChangePasswordSchema"
        :field-config="{
          password: {
            label: 'Mot de passe',
            component: 'password',
            inputProps: {
              placeholder: '*********',
              autocomplete: 'current-password',
            },
          },
        }">
        <Button type="submit" class="mt-4 w-full text-center">
          <span v-if="isLoading" class="loaderBtn"></span>
          <span v-else> Enregistrer mon mot de passe </span>
        </Button>
      </AutoForm>
    </div>
  </div>
</template>
