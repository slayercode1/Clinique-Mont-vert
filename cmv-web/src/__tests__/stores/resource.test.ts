import { type Resource, resourceStore } from '@/store/resource';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sampleResource: Resource = {
  id: 'res-1',
  type: 'Laptop',
  resource: 'Dell XPS',
  location: 'Bureau 1',
  state: 'IN_USE',
  purchase_date: '2024-01-01',
  supplier: 'Dell',
  expired_at: '2027-01-01',
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

describe('resourceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('fake-token');
  });

  describe('fetchResources', () => {
    it('populates store.resources on success', async () => {
      mockFetchOk({ data: [sampleResource] });
      const store = resourceStore();
      await store.fetchResources();
      expect(store.resources).toEqual([sampleResource]);
    });

    it('throws on fetch error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({}),
      });
      const store = resourceStore();
      await expect(store.fetchResources()).rejects.toThrow('Server Error');
    });
  });

  describe('createResource', () => {
    it('prepends new resource to store on success', async () => {
      const existingResource: Resource = { ...sampleResource, id: 'res-0' };
      const newResource: Resource = { ...sampleResource, id: 'res-2' };
      mockFetchOk({ data: newResource });
      const store = resourceStore();
      store.resources = [existingResource];
      await store.createResource(newResource);
      expect(store.resources[0]).toEqual(newResource);
      expect(store.resources).toHaveLength(2);
    });

    it('throws on failure', async () => {
      mockFetchFail({ data: { message: 'Create failed' } });
      const store = resourceStore();
      await expect(store.createResource(sampleResource)).rejects.toThrow();
    });
  });

  describe('updateResource', () => {
    it('updates matching resource in store on success', async () => {
      const updated = { ...sampleResource, location: 'Bureau 2' };
      mockFetchOk({ data: updated });
      const store = resourceStore();
      store.resources = [sampleResource];
      await store.updateResource({ location: 'Bureau 2' }, 'res-1');
      expect(store.resources[0].location).toBe('Bureau 2');
    });

    it('throws on failure', async () => {
      mockFetchFail({ data: { message: 'Update failed' } });
      const store = resourceStore();
      await expect(store.updateResource({}, 'res-1')).rejects.toThrow();
    });
  });

  describe('deleteResource', () => {
    it('does not throw on successful delete', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
      const store = resourceStore();
      await expect(store.deleteResource('res-1')).resolves.not.toThrow();
    });
  });

  describe('getters', () => {
    it('countAll returns total resources', () => {
      const store = resourceStore();
      store.resources = [sampleResource, { ...sampleResource, id: 'res-2' }];
      expect(store.countAll).toBe(2);
    });

    it('countService returns IN_USE count', () => {
      const store = resourceStore();
      store.resources = [
        { ...sampleResource, state: 'IN_USE' },
        { ...sampleResource, id: 'res-2', state: 'IN_REPAIR' },
      ];
      expect(store.countService).toBe(1);
    });

    it('countInRepair returns IN_REPAIR count', () => {
      const store = resourceStore();
      store.resources = [
        { ...sampleResource, state: 'IN_REPAIR' },
        { ...sampleResource, id: 'res-2', state: 'IN_REPAIR' },
      ];
      expect(store.countInRepair).toBe(2);
    });

    it('countOutOfService returns OUT_OF_SERVICE count', () => {
      const store = resourceStore();
      store.resources = [
        { ...sampleResource, state: 'OUT_OF_SERVICE' },
        { ...sampleResource, id: 'res-2', state: 'IN_USE' },
      ];
      expect(store.countOutOfService).toBe(1);
    });
  });
});
