<script lang="ts" setup>
import DataTable from '@/components/DataTable.vue';
import DropdownAction from '@/components/data-table-dropdown.vue';
import Badge from '@/components/ui/badge/Badge.vue';
import Button from '@/components/ui/button/Button.vue';
import Card from '@/components/ui/card/Card.vue';
import CardContent from '@/components/ui/card/CardContent.vue';
import CardHeader from '@/components/ui/card/CardHeader.vue';
import CardTitle from '@/components/ui/card/CardTitle.vue';
import CostAdd from '@/pages/fleet/CostAdd.vue';
import { fleetStore } from '@/store/fleet.ts';
import { CostType, VehicleType } from '@/utils/types';
import { ColumnDef } from '@tanstack/vue-table';
import {
  AlertTriangle,
  ArrowUpDown,
  BrainCircuit,
  Car,
  CheckCircle,
  Clock,
  Fuel,
  Gauge,
  Loader2,
  Wrench,
} from 'lucide-vue-next';
import { computed, h, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const vehicle = fleetStore();
const router = useRouter();
const route = useRoute();

const v = computed(() => vehicle.getFleet as (VehicleType & { id: string }) | undefined);

onBeforeMount(async () => {
  vehicle.prediction = null;
  vehicle.predictionError = null;
  await vehicle.fetchFleet(route.params.id as string);
  await vehicle.fetchCost(route.params.id as string);

  const f = vehicle.getFleet as any;
  if (f?.prediction_estimation_jours != null) {
    vehicle.prediction = {
      estimation_jours: f.prediction_estimation_jours,
      estimation_mois: f.prediction_estimation_mois,
      fourchette_min_mois: f.prediction_fourchette_min_mois,
      fourchette_max_mois: f.prediction_fourchette_max_mois,
      recommandation: f.prediction_recommandation,
    };
  }
});

const handleDelete = async (id: string) => {
  await vehicle.deleteCost(id);
};

const handlePredict = async () => {
  await vehicle.fetchPrediction(route.params.id as string);
  await vehicle.fetchFleet(route.params.id as string);
};

const predictionLevel = computed(() => {
  if (!vehicle.prediction) return null;
  const jours = vehicle.prediction.estimation_jours;
  if (jours <= 30) return 'critical';
  if (jours <= 90) return 'warning';
  return 'good';
});

const columns: ColumnDef<CostType>[] = [
  {
    accessorKey: 'maintenance_date',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Date de maintenance', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'font-medium' },
        row.getValue('maintenance_date') !== null
          ? new Intl.DateTimeFormat('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: '2-digit',
            }).format(new Date(row.getValue('maintenance_date')))
          : '--'
      );
    },
  },
  {
    accessorKey: 'cost',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Coût', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('cost'));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat('fr-Fr', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount);

      return h('div', { class: ' font-medium' }, formatted);
    },
  },

  {
    accessorKey: 'description',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Motif', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      );
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, row.getValue('description'));
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const cost = row.original as CostType & { id: string };
      return h(
        'div',
        { class: 'relative' },
        h(DropdownAction, {
          data: vehicle,
          url_update: false,
          detail: false,
          handleDelete: () => handleDelete(cost.id),
        })
      );
    },
  },
];
</script>

<template>
  <div class="w-full">
    <div class="p-2 w-full md:w-[calc(100%-50px)] mt-8">
      <h1 class="text-2xl font-bold mb-4">Espace Automobile</h1>
      <template v-if="v">
      <p class="text-xl font-bold mb-4">{{ v.brand }} {{ v.model }} ({{ v.year }})</p>

      <!-- Vehicle Details Card -->
      <Card class="mb-6">
        <CardHeader class="pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <Car class="h-5 w-5 text-primary" />
            Détails du véhicule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="flex items-center gap-2">
              <Fuel class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Carburant</p>
                <p class="font-medium">{{ v.carburant || '--' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Gauge class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Kilométrage</p>
                <p class="font-medium">{{ Number(v.kilometres).toLocaleString('fr-FR') }} km</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Car class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Usage</p>
                <p class="font-medium">{{ v.usage || '--' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Mise en circulation</p>
                <p class="font-medium">{{ v.date_circulation ? new Intl.DateTimeFormat('fr-FR').format(new Date(v.date_circulation)) : '--' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Gauge class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Km moyen annuel</p>
                <p class="font-medium">{{ v.km_moyen_annuel ? Number(v.km_moyen_annuel).toLocaleString('fr-FR') + ' km' : '--' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Wrench class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Révisions effectuées</p>
                <p class="font-medium">{{ v.nb_revisions_effectuees ?? '--' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Wrench class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Condition</p>
                <p class="font-medium">{{ v.condition_vehicule != null ? v.condition_vehicule + '/10' : '--' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <AlertTriangle class="h-4 w-4 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground">Pannes historique</p>
                <p class="font-medium">{{ v.nb_pannes_historique ?? '--' }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Prediction Card -->
      <Card class="mb-6">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg flex items-center gap-2">
              <BrainCircuit class="h-5 w-5 text-primary" />
              Prédiction IA - Jours avant panne
            </CardTitle>
            <Button
              :disabled="vehicle.predictionLoading"
              @click="handlePredict"
            >
              <Loader2 v-if="vehicle.predictionLoading" class="mr-2 h-4 w-4 animate-spin" />
              <BrainCircuit v-else class="mr-2 h-4 w-4" />
              {{ vehicle.predictionLoading ? 'Analyse en cours...' : 'Lancer la prédiction' }}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <!-- Error state -->
          <div v-if="vehicle.predictionError" class="flex items-center gap-2 text-destructive">
            <AlertTriangle class="h-5 w-5" />
            <span>{{ vehicle.predictionError }}</span>
          </div>

          <!-- Result state -->
          <div v-else-if="vehicle.prediction" class="space-y-4">
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center justify-center w-16 h-16 rounded-full"
                  :class="{
                    'bg-red-100 text-red-700': predictionLevel === 'critical',
                    'bg-yellow-100 text-yellow-700': predictionLevel === 'warning',
                    'bg-green-100 text-green-700': predictionLevel === 'good',
                  }"
                >
                  <AlertTriangle v-if="predictionLevel === 'critical'" class="h-8 w-8" />
                  <Clock v-else-if="predictionLevel === 'warning'" class="h-8 w-8" />
                  <CheckCircle v-else class="h-8 w-8" />
                </div>
                <div>
                  <p class="text-3xl font-bold">
                    {{ Math.round(vehicle.prediction.estimation_jours) }}
                  </p>
                  <p class="text-sm text-muted-foreground">jours estimés avant panne (~{{ vehicle.prediction.estimation_mois }} mois)</p>
                </div>
              </div>
              <Badge
                :variant="predictionLevel === 'critical' ? 'destructive' : predictionLevel === 'warning' ? 'outline' : 'default'"
              >
                {{ predictionLevel === 'critical' ? 'Critique' : predictionLevel === 'warning' ? 'Attention' : 'Bon état' }}
              </Badge>
            </div>
            <div class="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Fourchette : {{ vehicle.prediction.fourchette_min_mois }} - {{ vehicle.prediction.fourchette_max_mois }} mois</span>
              <span v-if="(v as any)?.prediction_date">
                · Prédit le {{ new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date((v as any).prediction_date)) }}
              </span>
            </div>
            <p class="text-sm">{{ vehicle.prediction.recommandation }}</p>
          </div>

          <!-- Empty state -->
          <p v-else class="text-sm text-muted-foreground">
            Cliquez sur "Lancer la prédiction" pour estimer le nombre de jours avant une potentielle panne.
          </p>
        </CardContent>
      </Card>

      <DataTable
        :click="() => router.push(`/costs-list/${route.params.id}/cost-add`)"
        :columns="columns"
        :data="vehicle.getCosts"
        btn_text="Ajouter un  coût"
        permission-role="FLEET_ADMIN"
      />
      </template>
      <div v-else class="flex items-center justify-center py-12">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
    <CostAdd />
  </div>
</template>
