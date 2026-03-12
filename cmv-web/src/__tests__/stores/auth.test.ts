import { authStore } from '@/store/auth';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function mockFetchOk(data: unknown) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

function mockFetchFail(data: unknown) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: false,
    json: async () => data,
  });
}

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('fake-token');
  });

  describe('signin', () => {
    it('returns data on success', async () => {
      const responseData = { success: true, data: { token: 'abc123', id: 'user-1' } };
      mockFetchOk(responseData);
      const store = authStore();
      const result = await store.signin({ email: 'user@example.com', password: 'pass' });
      expect(result).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/it/sign-in'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws Error on failure', async () => {
      mockFetchFail({ message: 'Invalid credentials' });
      const store = authStore();
      await expect(store.signin({ email: 'user@example.com', password: 'wrong' })).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('session', () => {
    it('sets store.user on success', async () => {
      const userData = {
        id: 'user-1',
        email: 'user@example.com',
        role: { id: 'r1', name: 'Admin' },
      };
      mockFetchOk({ success: true, data: userData });
      const store = authStore();
      await store.session();
      expect(store.getUser).toEqual(userData);
    });

    it('throws Error on failure', async () => {
      mockFetchFail({ message: 'Unauthorized' });
      const store = authStore();
      await expect(store.session()).rejects.toThrow('Unauthorized');
    });

    it('sends Authorization header', async () => {
      mockFetchOk({ success: true, data: {} });
      const store = authStore();
      await store.session();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/it/session'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }),
        })
      );
    });
  });

  describe('signout', () => {
    it('calls fetch with the user id in URL', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });
      const store = authStore();
      await store.signout('user-1');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/it/sign-out/user-1'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
