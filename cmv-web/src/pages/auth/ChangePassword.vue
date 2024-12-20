<script setup lang="ts">
import { AutoForm } from '@/components/ui/auto-form';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { authStore } from '@/store/auth';
import { toast } from 'vue-sonner';
import { setCookie } from '@/utils/functions';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const auth = authStore();
const router = useRouter();
const isLoading = ref<boolean>(false);

const formChangePasswordSchema = z.object({
  password: z.string(),
});

const handleSubmit = (value: Record<string, string>) => {
  isLoading.value = true;
  auth
    .updateUser(value, auth.getUser?.id!)
    .then((data) => {
      toast.success(data?.message, {
        position: 'top-right',
      });
      setCookie('onbording', true, 365);
      switch (true) {
        case auth.getUser?.role.name.startsWith('IT'):
          router?.replace('users-list');
          isLoading.value = false;
          break;

        case auth.getUser?.role.name.startsWith('FLEET'):
          router?.replace('fleets-list');
          isLoading.value = false;
          break;

        default:
          break;
      }
    })
    .catch((error) => {
      isLoading.value = false;
      toast.error(error?.message, {
        position: 'top-right',
      });
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
      <AutoForm
        class="mb-0 mt-6 space-y-4 p-4 sm:p-6 lg:p-8"
        @submit="handleSubmit"
        :schema="formChangePasswordSchema"
        :field-config="{
          password: {
            label: 'Mot de passe',
            component: 'password',
            inputProps: {
              placeholder: '*********',
              autocomplete: 'current-password',
            },
          },
        }"
      >
        <Button type="submit" class="mt-4 w-full text-center">
          <span v-if="isLoading" class="loaderBtn"></span>
          <span v-else> Enregistrer mon mot de passe </span>
        </Button>
      </AutoForm>
    </div>
  </div>
</template>
