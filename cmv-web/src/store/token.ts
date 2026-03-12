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
    // Getter pour vérifier si l'utilisateur est authentifié
    getIsAuthenticated(): boolean {
      return this.isAuthenticated;
    },
  },

  actions: {
    // Vérifie le token au démarrage
    initializeAuth() {
      const token = localStorage.getItem(STORAGE_KEY);
      this.isAuthenticated = token !== null;
    },

    // Se connecter
    login(token: string) {
      localStorage.setItem(STORAGE_KEY, token);
      this.isAuthenticated = true;
    },

    // Se déconnecter
    logout() {
      localStorage.removeItem(STORAGE_KEY);
      this.isAuthenticated = false;
    },
  },
});
