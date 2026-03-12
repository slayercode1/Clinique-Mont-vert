import { authFetch } from '@/utils/storage';
import { defineStore } from 'pinia';
import { API_ENDPOINT } from './api-endpoint';

export type Resource = {
  id?: string;
  type: string;
  resource: string;
  location: string;
  state?: 'IN_USE' | 'OUT_OF_SERVICE' | 'IN_REPAIR';
  purchase_date: string | Date;
  supplier: string;
  expired_at: string | Date;
};

export const resourceStore = defineStore('resource', {
  state() {
    return {
      resources: [] as Resource[],
      resource: undefined as Resource | undefined,
    };
  },
  getters: {
    getResources: (state) => state.resources,
    getResource: (state) => state.resource,
    countAll: (state) => state.resources.length,
    countService: (state) => state.resources.filter((r) => r.state === 'IN_USE').length,
    countInRepair: (state) => state.resources.filter((r) => r.state === 'IN_REPAIR').length,
    countOutOfService: (state) =>
      state.resources.filter((r) => r.state === 'OUT_OF_SERVICE').length,
  },
  actions: {
    async fetchResources() {
      const response = await authFetch(`${API_ENDPOINT}/it/resources`);
      if (!response.ok) throw new Error(response.statusText);
      const { data } = await response.json();
      this.resources = data;
    },

    async fetchResource(id: string) {
      const response = await authFetch(`${API_ENDPOINT}/it/resource/${id}`);
      if (!response.ok) throw new Error(response.statusText);
      const { data } = await response.json();
      this.resource = data;
    },

    async createResource(resource: Resource) {
      const response = await authFetch(`${API_ENDPOINT}/it/resource`, {
        method: 'POST',
        body: JSON.stringify(resource),
      });
      if (!response.ok) {
        const { data } = await response.json();
        throw new Error(data.message);
      }
      const { data } = await response.json();
      this.resources = [data, ...this.resources];
      return data;
    },

    async updateResource(resource: unknown, id: string) {
      const response = await authFetch(`${API_ENDPOINT}/it/resource/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(resource),
      });
      if (!response.ok) {
        const { data } = await response.json();
        throw new Error(data.message);
      }
      const { data } = await response.json();
      this.resources = this.resources.map((r: Resource) => (r.id === data.id ? data : r));
      return data;
    },

    async deleteResource(id: string) {
      await authFetch(`${API_ENDPOINT}/it/delete-resource/${id}`, {
        method: 'DELETE',
      });
    },
  },
});
