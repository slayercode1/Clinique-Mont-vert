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
import { fleetStore } from '@/store/fleet.ts';
import { createVehicleSchema } from '@/utils/schemas/create-vehicle.schema.ts';
import { VehicleType } from '@/utils/types';
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

const vehicle = fleetStore();
const isLoading = ref<boolean>(false);

const form = useForm({
  validationSchema: toTypedSchema(createVehicleSchema),
});

const createVehicle = (values: VehicleType) => {
  isLoading.value = true;
  vehicle
    .createFleet(values)
    .then(() => {
      toast.success('Le véhicle a été créé.', {
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
};
</script>

<template>
  <Dialog :open="props.open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Ajouter un véhicule</DialogTitle>
        <DialogDescription>Remplissez les informations pour ajouter un nouveau véhicule.</DialogDescription>
      </DialogHeader>
      <AutoForm :form="form" :grid="true" :schema="createVehicleSchema" @submit="createVehicle">
        <div class="flex justify-end mt-2">
          <span v-if="isLoading" class="loaderBtn"></span>
          <Button v-else type="submit">Enregistrer</Button>
        </div>
      </AutoForm>
    </DialogContent>
  </Dialog>
</template>
