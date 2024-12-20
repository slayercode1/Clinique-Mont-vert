<script setup lang="ts">
import { AutoForm } from '@/components/ui/auto-form';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'vue-router';
import { authStore } from '@/store/auth';
import { toast } from 'vue-sonner';
import { useTokenStore } from '@/store/token.ts';
import { ref } from 'vue';

const auth = authStore();
const token = useTokenStore();
const router = useRouter();
const isLoading = ref<boolean>(false);

const formSignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const handleSubmit = (value: { email: string; password: string }) => {
  isLoading.value = true;
  auth
    .signin(value)
    .then((data) => {
      token.login(data.data.token);
      isLoading.value = false;
      if (document.cookie.includes('onbording')) {
        router.replace('/users-list');
      } else {
        router.replace('/change-password');
      }
    })
    .catch((error) => {
      isLoading.value = false;
      toast.error(error.message, {
        position: 'top-right',
      });
    });
};
</script>

<template>
  <div class="grid place-items-center h-screen w-screen">
    <div class="w-[450px]">
      <h1 class="text-center text-2xl font-bold text-black sm:text-3xl">CLINIQUE MONT-VERT</h1>

      <AutoForm
        class="mb-0 mt-6 space-y-4 p-4 sm:p-6 lg:p-8"
        @submit="handleSubmit"
        :schema="formSignInSchema"
        :field-config="{
          email: {
            label: 'Addresse e-mail',
            inputProps: {
              type: 'email',
              placeholder: 'e.g: exxemple@exemple.com',
            },
          },
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
          <span v-else> Connexion </span>
        </Button>
      </AutoForm>
    </div>
  </div>
</template>
