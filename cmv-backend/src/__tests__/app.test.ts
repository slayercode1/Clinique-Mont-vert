import { describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';

const mockAxios = jest.fn();

jest.unstable_mockModule('axios', () => ({
  default: mockAxios,
}));

jest.unstable_mockModule('../utils/prisma.js', () => ({
  default: {
    user: { findFirst: jest.fn(), findUnique: jest.fn() },
    session: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    permissionOnRole: { findMany: jest.fn() },
  },
}));

const { default: gateway } = await import('../app.js');

describe('Gateway app', () => {
  it('returns 404 for unknown service', async () => {
    const res = await request(gateway).get('/unknown-service/some-path');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Service not found' });
  });

  it('proxies to known service and returns response', async () => {
    mockAxios.mockResolvedValue({
      status: 200,
      headers: { 'content-type': 'application/json' },
      data: { success: true },
    });
    const res = await request(gateway).get('/it/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('returns error from proxied service', async () => {
    const axiosError: any = new Error('Not found');
    axiosError.response = { status: 404, data: { error: 'Not found' } };
    mockAxios.mockRejectedValue(axiosError);
    const res = await request(gateway).get('/it/missing');
    expect(res.status).toBe(404);
  });
});
