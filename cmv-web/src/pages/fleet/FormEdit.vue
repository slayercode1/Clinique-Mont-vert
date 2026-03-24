<script lang="ts" setup>
import { AutoForm } from '@/components/ui/auto-form';
import { Button } from '@/components/ui/button';
import { fleetStore } from '@/store/fleet.ts';
import { createVehicleSchema } from '@/utils/schemas/create-vehicle.schema.ts';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

const vehicle = fleetStore();
const router = useRouter();
const route = useRoute();
const isLoading = ref<boolean>(false);

const form = useForm({
  validationSchema: toTypedSchema(createVehicleSchema),
});
onMounted(async () => {
  await vehicle.fetchFleet(route.params.id as string);
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
});

const updateVehicle = (values: any) => {
  isLoading.value = true;
  vehicle
    .updateFleet(values, route.params.id as string)
    .then(() => {
      router.replace({ path: '/fleets-list' });
      toast.success('Le véhicule a bien été modifier.', {
        position: 'top-right',
      });
      isLoading.value = false;
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
  <div class="w-full">
    <div class="p-2 w-full mt-8">
      <h1 class="text-2xl font-bold mb-10">Espace Automobile</h1>
      <p class="text-base font-bold mb-4">Modifier un véhicule</p>
      <div class="px-4 relative h-auto lg:h-60">
        <AutoForm :form="form" :grid="true" :schema="createVehicleSchema" @submit="updateVehicle">
          <div class="md:absolute md:bottom-0 md:right-5">
            <span v-if="isLoading" class="loaderBtn"></span>
            <Button v-else type="submit"> Modifier</Button>
          </div>
        </AutoForm>
      </div>
    </div>
  </div>
</template>
