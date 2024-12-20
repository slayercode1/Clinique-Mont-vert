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
      const token = localStorage.getItem('ssid');
      this.isAuthenticated = token !== null;
    },

    // Se connecter
    login(token: string) {
      localStorage.setItem('ssid', token);
      this.isAuthenticated = true;
    },

    // Se déconnecter
    logout() {
      localStorage.removeItem('ssid');
      this.isAuthenticated = false;
    },
  },
});
