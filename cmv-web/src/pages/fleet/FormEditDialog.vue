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
      const f = vehicle.getFleet;
      if (!f) return;
      form.setFieldValue('brand', f.brand);
      form.setFieldValue('state', f.state);
      form.setFieldValue('kilometres', f.kilometres);
      form.setFieldValue('model', f.model);
      form.setFieldValue('year', f.year);
      form.setFieldValue('maintenance_date', f.maintenance_date);
      form.setFieldValue('date_circulation', f.date_circulation);
      form.setFieldValue('carburant', f.carburant);
      form.setFieldValue('usage', f.usage);
      form.setFieldValue('km_moyen_annuel', f.km_moyen_annuel);
      form.setFieldValue('km_derniere_revision', f.km_derniere_revision);
      form.setFieldValue('jours_depuis_derniere_revision', f.jours_depuis_derniere_revision);
      form.setFieldValue('km_depuis_derniere_revision', f.km_depuis_derniere_revision);
      form.setFieldValue('nb_revisions_effectuees', f.nb_revisions_effectuees);
      form.setFieldValue('intervalle_recommande_jours', f.intervalle_recommande_jours);
      form.setFieldValue('intervalle_recommande_km', f.intervalle_recommande_km);
      form.setFieldValue('condition_vehicule', f.condition_vehicule);
      form.setFieldValue('nb_pannes_historique', f.nb_pannes_historique);
      form.setFieldValue('age_vehicule', f.age_vehicule);
      form.setFieldValue('taux_utilisation_km', f.taux_utilisation_km);
      form.setFieldValue('taux_utilisation_jours', f.taux_utilisation_jours);
      form.setFieldValue('revisions_par_an', f.revisions_par_an);
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
