import { authFetch } from '@/utils/storage';
import type { Payload, UserType } from '@/utils/types';
import { defineStore } from 'pinia';
import { API_ENDPOINT } from './api-endpoint';

export type User = UserType & {
  role: {
    id: string;
    name: string;
  };
  id: string;
  isChangePassword: boolean;
};

export const userStore = defineStore('user', {
  state() {
    return {
      users: [] as User[],
      user: undefined as User | undefined,
      roles: [] as { id: string; name: string }[],
      services: [] as { id: string; name: string }[],
      permissions: [],
    };
  },
  getters: {
    getUsers: (state) => state.users,
    getUser: (state) => state.user,
    getRoles: (state) => state.roles,
    getServices: (state) => state.services,
    getPermissions: (state) => state.permissions,
    count: (state) => state.users.length,
  },
  actions: {
    async fetchUsers() {
      const response = await authFetch(`${API_ENDPOINT}/it/users`);
      const { data } = await response.json();
      this.users = data;
    },

    async fetchUser(id: string) {
      const response = await authFetch(`${API_ENDPOINT}/it/user/${id}`);
      const { data } = await response.json();
      this.user = data;
    },

    async fetchRoles() {
      const response = await authFetch(`${API_ENDPOINT}/it/roles`);
      const { data } = await response.json();
      this.roles = data;
    },

    async fetchServices() {
      const response = await authFetch(`${API_ENDPOINT}/it/services`);
      const { data } = await response.json();
      this.services = data;
    },

    async fetchPermissions() {
      const response = await authFetch(`${API_ENDPOINT}/it/permissions`);
      const { data } = await response.json();
      this.permissions = data;
    },

    async createUser(user: UserType) {
      const response = await authFetch(`${API_ENDPOINT}/it/user`, {
        method: 'POST',
        body: JSON.stringify(user),
      });
      const { data } = await response.json();
      if (!response.ok) throw new Error(data.message);
      this.users = [data, ...this.users];
      return data;
    },

    async updateuser(user: UserType, id: string) {
      const response = await authFetch(`${API_ENDPOINT}/it/user/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(user),
      });
      const { data } = await response.json();
      if (!response.ok) throw new Error(data.message);
      this.users = this.users.map((u: User) => (u.id === data.id ? data : u));
      return data;
    },

    async deleteUser(id: string) {
      const response = await authFetch(`${API_ENDPOINT}/it/delete-user/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        this.users = this.users.filter((user) => user.id !== id);
      }
    },

    async createRole(name: string) {
      const response = await authFetch(`${API_ENDPOINT}/it/role`, {
        method: 'POST',
        body: JSON.stringify(name),
      });
      const { data } = await response.json();
      if (!response.ok) throw new Error(data.message);
      this.roles = [data, ...this.roles];
      return data;
    },

    async createService(name: string) {
      const response = await authFetch(`${API_ENDPOINT}/it/service`, {
        method: 'POST',
        body: JSON.stringify(name),
      });
      const { data } = await response.json();
      if (!response.ok) throw new Error(data.message);
      this.services = [data, ...this.services];
      return data;
    },

    async createOrUpdatePermission(payload: Payload) {
      const response = await authFetch(`${API_ENDPOINT}/it/permission`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const { data } = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    },
  },
});
