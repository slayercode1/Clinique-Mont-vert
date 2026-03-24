<script lang="ts" setup>
import { AutoForm } from '@/components/ui/auto-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Resource, resourceStore } from '@/store/resource';
import { createResourceSchema, resourceSchema } from '@/utils/schemas/create-resource.schema.ts';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { toast } from 'vue-sonner';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const props = defineProps<{
  open: boolean;
}>();

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
      toast.success('La ressource a été créé.', {
        position: 'top-right',
      });
      isloading.value = false;
      form.resetForm();
      emit('close');
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
  <Dialog :open="props.open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Nouvelle Ressource</DialogTitle>
        <DialogDescription>Remplissez les informations pour ajouter une nouvelle ressource.</DialogDescription>
      </DialogHeader>
      <AutoForm
        :field-config="{}"
        :form="form"
        :grid="true"
        :schema="resourceSchema"
        @submit="createResource"
      >
        <div class="flex justify-end mt-2">
          <Button type="submit" :disabled="isloading">
            <span v-if="isloading" class="loaderBtn"></span>
            <span v-else>Enregistrer</span>
          </Button>
        </div>
      </AutoForm>
    </DialogContent>
  </Dialog>
</template>
