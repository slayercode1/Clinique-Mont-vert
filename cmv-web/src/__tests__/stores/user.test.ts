import { type User, userStore } from '@/store/user';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sampleUser: User = {
  id: 'user-1',
  lastname: 'Doe',
  firstname: 'John',
  email: 'john@example.com',
  password: 'hashed',
  status: 'ACTIF',
  roleId: 'role-1',
  serviceId: 'service-1',
  role: { id: 'role-1', name: 'Admin' },
  isChangePassword: false,
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

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('fake-token');
  });

  describe('fetchUsers', () => {
    it('populates store.users on success', async () => {
      mockFetchOk({ data: [sampleUser] });
      const store = userStore();
      await store.fetchUsers();
      expect(store.users).toEqual([sampleUser]);
    });

    it('throws on fetch error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
      const store = userStore();
      await expect(store.fetchUsers()).rejects.toThrow('Network error');
    });
  });

  describe('createUser', () => {
    it('prepends new user to store on success', async () => {
      const newUser = { ...sampleUser, id: 'user-2', email: 'new@example.com' };
      mockFetchOk({ data: newUser });
      const store = userStore();
      store.users = [sampleUser];
      const payload = {
        lastname: 'New',
        firstname: 'User',
        email: 'new@example.com',
        password: 'password',
        status: 'ACTIF' as const,
        roleId: 'role-1',
        serviceId: 'service-1',
      };
      await store.createUser(payload);
      expect(store.users[0]).toEqual(newUser);
      expect(store.users).toHaveLength(2);
    });

    it('throws on failure', async () => {
      mockFetchFail({ message: 'Create failed' });
      const store = userStore();
      const payload = {
        lastname: 'Err',
        firstname: 'User',
        email: 'err@example.com',
        password: 'password',
        status: 'ACTIF' as const,
        roleId: 'r1',
        serviceId: 's1',
      };
      await expect(store.createUser(payload)).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    it('removes user from store on success', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
      const store = userStore();
      store.users = [sampleUser, { ...sampleUser, id: 'user-2' }];
      await store.deleteUser('user-1');
      expect(store.users).toHaveLength(1);
      expect(store.users[0].id).toBe('user-2');
    });

    it('does not modify store on failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Server Error',
        json: async () => ({}),
      });
      const store = userStore();
      store.users = [sampleUser];
      await store.deleteUser('user-1');
      expect(store.users).toHaveLength(1);
    });
  });

  describe('fetchRoles', () => {
    it('populates store.roles on success', async () => {
      const roles = [
        { id: 'role-1', name: 'Admin' },
        { id: 'role-2', name: 'User' },
      ];
      mockFetchOk({ data: roles });
      const store = userStore();
      await store.fetchRoles();
      expect(store.roles).toEqual(roles);
    });

    it('throws on error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
      const store = userStore();
      await expect(store.fetchRoles()).rejects.toThrow('Network error');
    });
  });

  describe('getters', () => {
    it('count returns users length', () => {
      const store = userStore();
      store.users = [sampleUser, { ...sampleUser, id: 'user-2' }];
      expect(store.count).toBe(2);
    });

    it('getRoles returns roles array', () => {
      const store = userStore();
      store.roles = [{ id: 'r1', name: 'Admin' }];
      expect(store.getRoles).toEqual([{ id: 'r1', name: 'Admin' }]);
    });
  });
});
