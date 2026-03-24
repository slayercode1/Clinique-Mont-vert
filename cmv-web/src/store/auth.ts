import { authFetch, authHeaders } from '@/utils/storage';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    },

    async session() {
      const response = await fetch(`${API_ENDPOINT}/it/session`, {
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      this.user = data.data;
      return data;
    },

    async signout() {
      await authFetch(`${API_ENDPOINT}/it/sign-out`, {
        method: 'POST',
      });
    },

    async updateUser(password: Record<string, any>) {
      const response = await authFetch(`${API_ENDPOINT}/it/change-password`, {
        method: 'PATCH',
        body: JSON.stringify({
          password: password.password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.data?.message);
      }

      return data;
    },
  },
});
