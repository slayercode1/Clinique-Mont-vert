import { defineStore } from 'pinia';
import { Payload, UserType } from '@/utils/types';
import { API_ENDPOINT } from './api-endpoint';

//Pour ajouter un champ a un type exitant
export type User = UserType & {
  role: {
    id: string;
    name: string;
  };
  id: string;
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
    count(state) {
      return state.users.length;
    },
  },
  actions: {
    async fetchUsers() {
      try {
        const response = await fetch(`${API_ENDPOINT}/it/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();
        this.users = data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },

    async fetchUser(id: string) {
      try {
        const response = await fetch(`${API_ENDPOINT}/it/user/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();
        this.user = data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },

    async fetchRoles() {
      try {
        const response = await fetch(`${API_ENDPOINT}/it/roles`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();
        this.roles = data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },

    async fetchServices() {
      try {
        const response = await fetch(`${API_ENDPOINT}/it/services`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();
        this.services = data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },

    async fetchPermissions() {
      try {
        const response = await fetch(`${API_ENDPOINT}/it/permissions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();

        this.permissions = data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },

    async createUser(user: UserType) {
      const response = await fetch(`${API_ENDPOINT}/it/user`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(user),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.users = [data, ...this.users];
      return data;
    },

    async updateuser(user: UserType, id: string) {
      const response = await fetch(`${API_ENDPOINT}/it/user/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(user),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.users = this.users.map((user: any) => (user.id === data.id ? data : user));
      return data;
    },

    async deleteUser(id: string) {
      try {
        const response = await fetch(`${API_ENDPOINT}/it/delete-user/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          this.users = this.users.filter((user) => user.id !== id);
        } else {
          console.error('Erreur lors de la suppression de l’utilisateur:', response.statusText);
        }
      } catch (error) {
        console.error('Une erreur est survenue:', error);
      }
    },

    async createRole(name: string) {
      const response = await fetch(`${API_ENDPOINT}/it/role`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(name),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.roles = [data, ...this.roles];
      return data;
    },

    async createService(name: string) {
      const response = await fetch(`${API_ENDPOINT}/it/service`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(name),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.services = [data, ...this.services];
      return data;
    },

    async createOrUpdatePermission(payload: Payload) {
      const response = await fetch(`${API_ENDPOINT}/it/permission`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(payload),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    },
  },
});
