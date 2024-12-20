<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AutoForm } from '@/components/ui/auto-form';
import { fleetStore } from '@/store/fleet.ts';
import { toast } from 'vue-sonner';
import { createCostSchema } from '@/utils/schemas/create-vehicle.schema.ts';

const route = useRoute();
const router = useRouter();
const vehicle = fleetStore();
const isLoading = ref<boolean>(false);

const isOpen = computed(() => route.fullPath === `/costs-list/${route.params.id}/cost-add`);

const createCost = (values: any) => {
  isLoading.value = true;
  vehicle
    .createCost({
      cost: values.cost,
      maintenance_date: values.maintenance_date,
      description: values.description,
      vehicleId: route.params.id as string,
    })
    .then(() => {
      router.push(`/costs-list/${route.params.id}`);
      toast.success('Le coût a été créé.', {
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
  <Dialog :open="isOpen">
    <DialogContent
      class="sm:max-w-[425px]"
      :close="() => router.push(`/costs-list/${route.params.id}`)"
    >
      <DialogHeader>
        <DialogTitle>Ajouter un coût</DialogTitle>
      </DialogHeader>
      <div>
        <AutoForm :schema="createCostSchema.omit({ vehicleId: true }) as any" @submit="createCost">
          <Button class="mt-4" type="submit">
            <span v-if="isLoading" class="loaderBtn"></span>
            <span v-else>Enregistrer</span>
          </Button>
        </AutoForm>
      </div>
    </DialogContent>
  </Dialog>
</template>
