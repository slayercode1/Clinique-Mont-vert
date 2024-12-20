<script lang="ts" setup>
import { AutoForm } from '@/components/ui/auto-form';
import { Button } from '@/components/ui/button';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { Resource, resourceStore } from '@/store/resource';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { ref } from 'vue';
import { createResourceSchema, resourceSchema } from '@/utils/schemas/create-resource.schema.ts';

const router = useRouter();
const resource = resourceStore();
const isloading = ref<boolean>(false);

const form = useForm({
  validationSchema: toTypedSchema(createResourceSchema),
});

const createResource = (values: Resource) => {
  isloading.value = true;
  resource
    .createResource(values)
    .then(() => {
      router.replace({ path: '/resources-list' });
      toast.success('La ressource a été créé.', {
        position: 'top-right',
      });
      isloading.value = false;
    })
    .catch((error) => {
      toast.error(error.message, {
        position: 'top-right',
      });
      isloading.value = false;
    });
};

</script>

<template>
  <div class="flex w-full">
    <div class="p-2 w-full mt-8">
      <h1 class="text-2xl font-bold mb-10">Espace Information</h1>
      <p class="text-base font-bold mb-4">Nouvelle Ressource</p>
      <div class="px-4 relative h-auto md:h-1/2 lg:h-1/2">
        <AutoForm
          :field-config="{}"
          :form="form"
          :grid="true"
          :schema="resourceSchema"
          @submit="createResource"
        >
          <div class="md:absolute md:bottom-0 md:right-5">
            <Button type="submit">
              <span v-if="isloading" class="loaderBtn"></span>
              <span v-else> Enregistre</span>
            </Button>
          </div>
        </AutoForm>
      </div>
    </div>
  </div>
</template>
