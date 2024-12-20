<script lang="ts" setup>
import { AutoForm } from '@/components/ui/auto-form';
import { Button } from '@/components/ui/button';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { fleetStore } from '@/store/fleet.ts';
import { VehicleType } from '@/utils/types';
import { createVehicleSchema } from '@/utils/schemas/create-vehicle.schema.ts';

const vehicle = fleetStore();
const router = useRouter();
const route = useRoute();
const isLoading = ref<boolean>(false);

const createVehcile = (values: VehicleType) => {
  isLoading.value = true;
  vehicle
    .createFleet(values)
    .then(() => {
      router.replace({ path: '/fleets-list' });
      toast.success('Le véhicle a été créé.', {
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

const form = useForm({
  validationSchema: toTypedSchema(createVehicleSchema),
});
</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full mt-8">
      <h1 class="text-2xl font-bold mb-10">Espace Automobile</h1>
      <p class="text-base font-bold mb-4">Ajouter un véhicule</p>
      <div class="px-4 relative h-auto md:h-h-60 lg:h-60">
        <AutoForm :form="form" :grid="true" :schema="createVehicleSchema" @submit="createVehcile">
          <div class="md:absolute md:bottom-0 md:right-5">
            <span v-if="isLoading" class="loaderBtn"></span>
            <Button v-else type="submit"> Enregistrer</Button>
          </div>
        </AutoForm>
      </div>
    </div>
  </div>
</template>
