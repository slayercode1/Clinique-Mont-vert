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
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const props = defineProps<{
  open: boolean;
  vehicleId: string | null;
}>();

const vehicle = fleetStore();
const isLoading = ref<boolean>(false);

const form = useForm({
  validationSchema: toTypedSchema(createVehicleSchema),
});

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.vehicleId) {
      await vehicle.fetchFleet(props.vehicleId);
      form.setFieldValue('brand', vehicle.getFleet?.brand);
      form.setFieldValue('state', vehicle.getFleet?.state);
      form.setFieldValue('kilometres', vehicle.getFleet?.kilometres);
      form.setFieldValue('model', vehicle.getFleet?.model);
      form.setFieldValue('year', vehicle.getFleet?.year);
      form.setFieldValue('maintenance_date', vehicle.getFleet?.maintenance_date);
    }
  },
  { immediate: true }
);

const updateVehicle = (values: any) => {
  if (!props.vehicleId) return;
  isLoading.value = true;
  vehicle
    .updateFleet(values, props.vehicleId)
    .then(() => {
      toast.success('Le véhicule a bien été modifier.', {
        position: 'top-right',
      });
      isLoading.value = false;
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
        <DialogTitle>Modifier un véhicule</DialogTitle>
        <DialogDescription>Modifiez les informations du véhicule.</DialogDescription>
      </DialogHeader>
      <AutoForm :form="form" :grid="true" :schema="createVehicleSchema" @submit="updateVehicle">
        <div class="flex justify-end mt-2">
          <span v-if="isLoading" class="loaderBtn"></span>
          <Button v-else type="submit">Modifier</Button>
        </div>
      </AutoForm>
    </DialogContent>
  </Dialog>
</template>
