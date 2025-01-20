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
      try {
        const response = await fetch(`${API_ENDPOINT}/it/resources`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json', // optional, depending on the API requirements
          },
        });
        const { data } = await response.json();
        this.resources = data;
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    },

    async fetchResource(id: string) {
      try {
        const response = await fetch(`${API_ENDPOINT}/it/resource/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json', // optional, depending on the API requirements
          },
        });
        const { data } = await response.json();
        this.resource = data;
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    },

    async createResource(resource: Resource) {
      const response = await fetch(`${API_ENDPOINT}/it/resource`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(resource),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.resources = [data, ...this.resources];
      return data;
    },

    async updateResource(resource: unknown, id: string) {
      const response = await fetch(`${API_ENDPOINT}/it/resource/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(resource),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.resources = this.resources.map((resource: any) =>
        resource.id === data.id ? data : resource,
      );
      return data;
    },

    async deleteResource(id: string) {
      await fetch(`${API_ENDPOINT}/it/delete-resource/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json',
        },
      });
    },
  },
});
