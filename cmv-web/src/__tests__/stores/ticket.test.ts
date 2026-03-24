import { type Ticket, ticketStore } from '@/store/ticket';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sampleTicket: Ticket = {
  id: 'ticket-1',
  status: 'TODO',
  priority: 'HIGT',
  created_at: '2024-01-01T00:00:00.000Z',
  validated_at: null,
  employeeId: 'emp-1',
  decription: 'Fix printer',
  service: 'IT',
  resolvedById: '',
  material: [],
  employee: {
    lastname: 'Doe',
    firstname: 'John',
    email: 'j@e.com',
    password: '',
    status: 'ACTIF',
    roleId: 'r1',
    serviceId: 's1',
  } as any,
  resolvedBy: {
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    status: 'ACTIF',
    roleId: 'r1',
    serviceId: 's1',
  } as any,
  assign: {
    id: 'a1',
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    status: 'ACTIF',
    roleId: 'r1',
    serviceId: 's1',
  } as any,
};

function mockFetchOk(data: unknown) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
  });
}

function mockFetchFail(data: unknown) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: false,
    status: 400,
    json: async () => data,
  });
}

describe('ticketStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('fake-token');
  });

  describe('fetchTickets', () => {
    it('populates store.tickets on success', async () => {
      mockFetchOk({ data: [sampleTicket] });
      const store = ticketStore();
      await store.fetchTickets();
      expect(store.tickets).toEqual([sampleTicket]);
    });

    it('throws on fetch error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({}),
      });
      const store = ticketStore();
      await expect(store.fetchTickets()).rejects.toThrow('Server Error');
    });
  });

  describe('createTicket', () => {
    it('prepends new ticket to store on success', async () => {
      const newTicket = { ...sampleTicket, id: 'ticket-2' };
      mockFetchOk({ data: newTicket });
      const store = ticketStore();
      store.tickets = [sampleTicket];
      const payload = {
        employeeId: 'emp-1',
        priority: 'LOW' as const,
        description: 'New issue',
        materialId: 'mat-1',
      };
      await store.createTicket(payload);
      expect(store.tickets[0]).toEqual(newTicket);
      expect(store.tickets).toHaveLength(2);
    });

    it('throws on failure', async () => {
      mockFetchFail({ data: { message: 'Create failed' } });
      const store = ticketStore();
      const payload = {
        employeeId: 'emp-1',
        priority: 'LOW' as const,
        description: 'issue',
        materialId: 'mat-1',
      };
      await expect(store.createTicket(payload)).rejects.toThrow();
    });
  });

  describe('updateTicket', () => {
    it('updates matching ticket in store on success', async () => {
      const updated = { ...sampleTicket, status: 'IN_PROGRESS' as const };
      mockFetchOk({ data: updated });
      const store = ticketStore();
      store.tickets = [sampleTicket];
      await store.updateTicket({ status: 'IN_PROGRESS' }, 'ticket-1');
      expect(store.tickets[0].status).toBe('IN_PROGRESS');
    });

    it('also updates store.ticket if it matches the id', async () => {
      const updated = { ...sampleTicket, status: 'IN_PROGRESS' as const };
      mockFetchOk({ data: updated });
      const store = ticketStore();
      store.tickets = [sampleTicket];
      (store as any).ticket = sampleTicket;
      await store.updateTicket({ status: 'IN_PROGRESS' }, 'ticket-1');
      expect((store.ticket as Ticket | undefined)?.status).toBe('IN_PROGRESS');
    });

    it('throws on failure', async () => {
      mockFetchFail({ data: { message: 'Update failed' } });
      const store = ticketStore();
      await expect(store.updateTicket({}, 'ticket-1')).rejects.toThrow();
    });
  });

  describe('getters', () => {
    it('countAll returns total count', () => {
      const store = ticketStore();
      store.tickets = [sampleTicket, { ...sampleTicket, id: 'ticket-2' }];
      expect(store.countAll).toBe(2);
    });

    it('countTodo returns TODO count', () => {
      const store = ticketStore();
      store.tickets = [
        { ...sampleTicket, status: 'TODO' },
        { ...sampleTicket, id: 't2', status: 'IN_PROGRESS' },
      ];
      expect(store.countTodo).toBe(1);
    });

    it('countInProgress returns IN_PROGRESS count', () => {
      const store = ticketStore();
      store.tickets = [
        { ...sampleTicket, status: 'TODO' },
        { ...sampleTicket, id: 't2', status: 'IN_PROGRESS' },
        { ...sampleTicket, id: 't3', status: 'IN_PROGRESS' },
      ];
      expect(store.countInProgress).toBe(2);
    });

    it('countBlocked returns BLOCKED count', () => {
      const store = ticketStore();
      store.tickets = [
        { ...sampleTicket, status: 'TODO' },
        { ...sampleTicket, id: 't2', status: 'BLOCKED' as any },
      ];
      expect(store.countBlocked).toBe(1);
    });
  });
});
