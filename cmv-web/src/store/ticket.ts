import { defineStore } from 'pinia';
import { Resource } from './resource';
import { TicketType, UserType } from '@/utils/types';
import { API_ENDPOINT } from './api-endpoint';

export interface Ticket {
  id: string;
  status: 'IN_PROGRESS' | 'TODO' | 'BLOCKED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at: string;
  validated_at: string | null;
  employeeId: string;
  description: string;
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
      try {
        const response = await fetch(`${API_ENDPOINT}/it/tickets`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json', // optional, depending on the API requirements
          },
        });
        const { data } = await response.json();
        this.tickets = data;
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    },

    async fetchTicket(id: string) {
      try {
        const response = await fetch(`${API_ENDPOINT}/it/ticket/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ssid')}`,
            'Content-Type': 'application/json', // optional, depending on the API requirements
          },
        });
        const { data } = await response.json();
        this.ticket = data;
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    },

    async createTicket(ticket: TicketType) {
      const response = await fetch(`${API_ENDPOINT}/it/ticket`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json', // optional, depending on the API requirements
        },
        body: JSON.stringify(ticket),
      });
      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      this.tickets = [data, ...this.tickets];
      return data;
    },

    async updateTicket(payload: unknown, id: string) {
      const response = await fetch(`${API_ENDPOINT}/it/ticket/${id}`, {
        method: 'PATCH',
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
      this.tickets = this.tickets.map((ticket: any) => (ticket.id === data.id ? data : ticket));
      if ((this.ticket as any)?.id === id) {
        this.ticket = data;
      }
      return data;
    },

    async deleteTicket(id: string) {
      await fetch(`${API_ENDPOINT}/it/delete-ticket/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ssid')}`,
          'Content-Type': 'application/json',
        },
      });
    },
  },
});
