<script lang="ts" setup>
import { AutoForm } from '@/components/ui/auto-form';
import { Button } from '@/components/ui/button';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { Resource, resourceStore } from '@/store/resource';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { onMounted, ref } from 'vue';
import { resourceSchema } from '@/utils/schemas/create-resource.schema.ts';

const router = useRouter();
const resource = resourceStore();
const isloading = ref<boolean>(false);
const route = useRoute();

const updateForm = useForm({
  validationSchema: toTypedSchema(resourceSchema),

});

onMounted(async () => {
  await resource.fetchResource(route.params.id as string);
  // Assurez-vous que `updateForm` est bien une instance de votre gestionnaire de formulaire
  updateForm.setFieldValue('type', resource.getResource?.type || '');
  updateForm.setFieldValue('expired_at', new Date(resource.getResource!.expired_at) || '');
  updateForm.setFieldValue('purchase_date', new Date(resource.getResource!.purchase_date) || '');
  updateForm.setFieldValue('location', resource.getResource?.location || '');
  updateForm.setFieldValue('supplier', resource.getResource?.supplier || '');
  updateForm.setFieldValue('resource', resource.getResource?.resource || '');
});


const updateResource = (values: Resource) => {
  isloading.value = true;
  resource
    .updateResource(values, route.params.id as string)
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
          :form="updateForm"
          :grid="true"
          :schema="resourceSchema"
          @submit="updateResource"
        >
          <div class="md:absolute md:bottom-0 md:right-5">
            <Button type="submit">
              <span v-if="isloading" class="loaderBtn"></span>
              <span v-else> Modifier</span>
            </Button>
          </div>
        </AutoForm>
      </div>
    </div>
  </div>
</template>
