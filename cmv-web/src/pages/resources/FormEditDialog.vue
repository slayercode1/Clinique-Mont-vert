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
import { resourceSchema } from '@/utils/schemas/create-resource.schema.ts';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const props = defineProps<{
  open: boolean;
  resourceId: string | null;
}>();

const resource = resourceStore();
const isloading = ref<boolean>(false);

const updateForm = useForm({
  validationSchema: toTypedSchema(resourceSchema),
});

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.resourceId) {
      await resource.fetchResource(props.resourceId);
      updateForm.setFieldValue('type', resource.getResource?.type || '');
      updateForm.setFieldValue('expired_at', new Date(resource.getResource!.expired_at) || '');
      updateForm.setFieldValue(
        'purchase_date',
        new Date(resource.getResource!.purchase_date) || ''
      );
      updateForm.setFieldValue('location', resource.getResource?.location || '');
      updateForm.setFieldValue('supplier', resource.getResource?.supplier || '');
      updateForm.setFieldValue('resource', resource.getResource?.resource || '');
    }
  },
  { immediate: true }
);

const updateResource = (values: Resource) => {
  if (!props.resourceId) return;
  isloading.value = true;
  resource
    .updateResource(values, props.resourceId)
    .then(() => {
      toast.success('La ressource a été modifiée.', {
        position: 'top-right',
      });
      isloading.value = false;
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
        <DialogTitle>Modifier la Ressource</DialogTitle>
        <DialogDescription>Modifiez les informations de la ressource.</DialogDescription>
      </DialogHeader>
      <AutoForm
        :field-config="{}"
        :form="updateForm"
        :grid="true"
        :schema="resourceSchema"
        @submit="updateResource"
      >
        <div class="flex justify-end mt-2">
          <Button type="submit" :disabled="isloading">
            <span v-if="isloading" class="loaderBtn"></span>
            <span v-else>Modifier</span>
          </Button>
        </div>
      </AutoForm>
    </DialogContent>
  </Dialog>
</template>
