import { authFetch } from '@/utils/storage';
import type { TicketType, UserType } from '@/utils/types';
import { defineStore } from 'pinia';
import { API_ENDPOINT } from './api-endpoint';
import type { Resource } from './resource';

export interface Ticket {
  id: string;
  status: 'IN_PROGRESS' | 'TODO' | 'BLOCKED';
  priority: 'HIGT' | 'MEDIUM' | 'LOW';
  created_at: string;
  validated_at: string | null;
  employeeId: string;
  decription: string;
  service: string;
  resolvedById: string;
  material: Resource[];
  employee: Omit<UserType, 'password'>;
  resolvedBy: Omit<UserType, 'password'>;
  assign: Omit<UserType & { id: string }, 'password'>;
}

export const ticketStore = defineStore('ticket', {
  state() {
    return { tickets: [] as Ticket[], ticket: undefined };
  },
  getters: {
    getTickets: (state) => state.tickets,
    getTicket: (state) => state.ticket as Ticket | undefined,
    countAll: (state) => state.tickets.length,
    countTodo: (state) => state.tickets.filter((r) => r.status === 'TODO').length,
    countInProgress: (state) => state.tickets.filter((r) => r.status === 'IN_PROGRESS').length,
    countBlocked: (state) => state.tickets.filter((r) => r.status === 'BLOCKED').length,
  },
  actions: {
    async fetchTickets() {
      const response = await authFetch(`${API_ENDPOINT}/it/tickets`);
      if (!response.ok) throw new Error(response.statusText);
      const { data } = await response.json();
      this.tickets = data;
    },

    async fetchTicket(id: string) {
      const response = await authFetch(`${API_ENDPOINT}/it/ticket/${id}`);
      if (!response.ok) throw new Error(response.statusText);
      const { data } = await response.json();
      this.ticket = data;
    },

    async createTicket(ticket: TicketType) {
      const response = await authFetch(`${API_ENDPOINT}/it/ticket`, {
        method: 'POST',
        body: JSON.stringify(ticket),
      });
      if (!response.ok) {
        const { data } = await response.json();
        throw new Error(data.message);
      }
      const { data } = await response.json();
      this.tickets = [data, ...this.tickets];
      return data;
    },

    async updateTicket(payload: unknown, id: string) {
      const response = await authFetch(`${API_ENDPOINT}/it/ticket/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const { data } = await response.json();
        throw new Error(data.message);
      }
      const { data } = await response.json();
      this.tickets = this.tickets.map((t: Ticket) => (t.id === data.id ? data : t));
      if ((this.ticket as Ticket | undefined)?.id === id) {
        this.ticket = data;
      }
      return data;
    },

    async deleteTicket(id: string) {
      await authFetch(`${API_ENDPOINT}/it/delete-ticket/${id}`, {
        method: 'DELETE',
      });
    },
  },
});
