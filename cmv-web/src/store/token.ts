import { STORAGE_KEY } from '@/utils/storage';
import { defineStore } from 'pinia';

interface AuthState {
  isAuthenticated: boolean;
}

export const useTokenStore = defineStore('token', {
  state: (): AuthState => ({
    isAuthenticated: false,
  }),

  getters: {
    getIsAuthenticated(): boolean {
      return this.isAuthenticated;
    },
  },

  actions: {
    initializeAuth() {
      const token = localStorage.getItem(STORAGE_KEY);
      this.isAuthenticated = token !== null;
    },

    login(token: string) {
      localStorage.setItem(STORAGE_KEY, token);
      this.isAuthenticated = true;
    },

    logout() {
      localStorage.removeItem(STORAGE_KEY);
      this.isAuthenticated = false;
    },
  },
});
