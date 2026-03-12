import { STORAGE_KEY } from '@/utils/storage';
import { defineStore } from 'pinia';
import { API_ENDPOINT } from './api-endpoint';
import type { User } from './user';

export const authStore = defineStore('auth', {
  state() {
    return { user: undefined };
  },
  getters: {
    getUser: (state) => state.user as User | undefined,
  },

  actions: {
    async signin(payload: { email: string; password: string }) {
      const response = await fetch(`${API_ENDPOINT}/it/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Si la réponse n'est pas ok (status 400 par exemple)
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    },

    async session() {
      const response = await fetch(`${API_ENDPOINT}/it/session`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY)}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
      });

      const data = await response.json();

      // Si la réponse n'est pas ok (status 400 par exemple)
      if (!response.ok) {
        throw new Error(data.message);
      }

      this.user = data.data;
      return data;
    },

    async signout(id: string) {
      await fetch(`${API_ENDPOINT}/it/sign-out/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY)}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        method: 'POST',
      });
    },
    async updateUser(password: Record<string, any>, id: string) {
      const response = await fetch(`${API_ENDPOINT}/it/change-password`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY)}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify({
          password: password.password,
          userId: id,
        }),
      });
      const { data } = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data;
    },
  },
});
