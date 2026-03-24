import { authFetch } from '@/utils/storage';
import type { CostType, VehicleType } from '@/utils/types';
import { defineStore } from 'pinia';
import { API_ENDPOINT } from './api-endpoint';

export const fleetStore = defineStore('fleet', {
  state() {
    return {
      fleets: [] as VehicleType[] & { id?: string },
      costs: [] as CostType[],
      fleet: undefined as VehicleType | undefined,
      prediction: null as {
        estimation_jours: number;
        estimation_mois: number;
        fourchette_min_mois: number;
        fourchette_max_mois: number;
        recommandation: string;
      } | null,
      predictionLoading: false,
      predictionError: null as string | null,
    };
  },
  getters: {
    getFleets: (state) => state.fleets,
    getFleet: (state) => state.fleet,
    getCosts: (state) => state.costs,
    countAll: (state) => state.fleets?.length,
    countService: (state) => state.fleets?.filter((r) => r.state === 'IN_USE').length,
    countInRepair: (state) => state.fleets?.filter((r) => r.state === 'IN_REPAIR').length,
    countAvailable: (state) => state.fleets?.filter((r) => r.state === 'AVAILABLE').length,
  },
  actions: {
    async fetchFleets() {
      const response = await authFetch(`${API_ENDPOINT}/fleet/vehicles`);
      const { data } = await response.json();
      this.fleets = data;
    },

    async fetchFleet(id: string) {
      const response = await authFetch(`${API_ENDPOINT}/fleet/vehicle/${id}`);
      const { data } = await response.json();
      this.fleet = data;
    },

    async fetchCost(id: string) {
      const response = await authFetch(`${API_ENDPOINT}/fleet/vehicle_cost/${id}`);
      const { data } = await response.json();
      this.costs = data;
    },

    async createFleet(vehicle: VehicleType) {
      const response = await authFetch(`${API_ENDPOINT}/fleet/create-vehicle`, {
        method: 'POST',
        body: JSON.stringify(vehicle),
      });
      const { data } = await response.json();
      if (!response.ok) throw new Error(data.message);
      this.fleets = [data, ...this.fleets];
      return data;
    },

    async createCost(cost: CostType) {
      const response = await authFetch(`${API_ENDPOINT}/fleet/create-cost`, {
        method: 'POST',
        body: JSON.stringify(cost),
      });
      const { data } = await response.json();
      if (!response.ok) throw new Error(data.message);
      this.costs = [data, ...this.costs];
      return data;
    },

    async updateFleet(vehicle: Partial<VehicleType>, id: string) {
      const response = await authFetch(`${API_ENDPOINT}/fleet/update-vehicle/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(vehicle),
      });
      const { data } = await response.json();
      if (!response.ok) throw new Error(data.message);
      this.fleets = this.fleets.map((f: VehicleType & { id?: string }) =>
        f.id === data.id ? data : f
      );
      return data;
    },

    async deleteCost(id: string) {
      const response = await authFetch(`${API_ENDPOINT}/fleet/delete-cost/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        this.costs = this.costs.filter(
          (cost: CostType) => (cost as CostType & { id?: string }).id !== id
        );
      }
    },

    async fetchPrediction(id: string) {
      this.predictionLoading = true;
      this.predictionError = null;
      this.prediction = null;
      try {
        const response = await authFetch(`${API_ENDPOINT}/fleet/predict/${id}`, {
          method: 'POST',
        });
        const result = await response.json();
        if (!response.ok) {
          this.predictionError = result.message || 'Erreur lors de la prédiction';
          return;
        }
        this.prediction = result.data;
      } catch {
        this.predictionError = 'Service de prédiction indisponible';
      } finally {
        this.predictionLoading = false;
      }
    },

    async deleteVehicle(id: string) {
      const response = await authFetch(`${API_ENDPOINT}/fleet/delete-vehicle/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        this.fleets = this.fleets.filter(
          (vehicle: VehicleType & { id?: string }) => vehicle.id !== id
        );
      }
    },
  },
});
