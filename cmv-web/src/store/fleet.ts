import { defineStore } from 'pinia';
import { CostType, VehicleType } from '@/utils/types';
import { API_ENDPOINT } from './api-endpoint';

export const fleetStore = defineStore('fleet', {
  state() {
    return {
      fleets: [] as VehicleType[] & { id?: string },
      costs: [] as CostType[],
      fleet: undefined as VehicleType | undefined,
    };
  },
  getters: {
    getFleets: (state) => state.fleets,
    getFleet: (state) => state.fleet,
    getCosts: (state) => state.costs,
    countAll(state) {
      return state.fleets?.length;
    },
    countService: (state) => state.fleets?.filter((r) => r.state === 'IN_USE').length,
    countInRepair: (state) => state.fleets?.filter((r) => r.state === 'IN_REPAIR').length,
    countAvailable: (state) => state.fleets?.filter((r) => r.state === 'AVAILABLE').length,
  },
  actions: {
    async fetchFleets() {
      try {
        const response = await fetch(`${API_ENDPOINT}/fleet/vehicles`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();
        this.fleets = data;
      } catch (error) {
        console.error('Error fetching fleets:', error);
      }
    },

    async fetchFleet(id: string) {
      try {
        const response = await fetch(`${API_ENDPOINT}/fleet/vehicle/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();
        this.fleet = data;
      } catch (error) {
        console.error('Error fetching costs:', error);
      }
    },

    async fetchCost(id: string) {
      try {
        const response = await fetch(`${API_ENDPOINT}/fleet/vehicle_cost/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();
        this.costs = data;
      } catch (error) {
        console.error('Error fetching costs:', error);
      }
    },

    async createFleet(vehicle: VehicleType) {
      const response = await fetch(`${API_ENDPOINT}/fleet/create-vehicle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(vehicle),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.fleets = [data, ...this.fleets];
      return data;
    },

    async createCost(cost: CostType) {
      const response = await fetch(`${API_ENDPOINT}/fleet/create-cost`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(cost),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.costs = [data, ...this.costs];
      return data;
    },

    async updateFleet(vehicle: Partial<VehicleType>, id: string) {
      const response = await fetch(`${API_ENDPOINT}/fleet/update-vehicle/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(vehicle),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.fleets = this.fleets.map((fleet: any) => (fleet.id === data.id ? data : fleet));
      return data;
    },

    async deleteCost(id: string) {
      const response = await fetch(`${API_ENDPOINT}/fleet/delete-cost/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.costs = this.costs.filter(cost => (cost as any).id !== id);
      } else {
        console.error('Erreur lors de la suppression du coût:', response.statusText);
      }
    },

    async deleteVehicle(id: string) {
      const response = await fetch(`${API_ENDPOINT}/fleet/delete-vehicle/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.fleets = this.fleets.filter(vehicle => (vehicle as any).id !== id);
      } else {
        console.error('Erreur lors de la suppression du véhicule:', response.statusText);
      }
    },
  },
});
