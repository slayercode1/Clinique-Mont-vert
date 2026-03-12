import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockFindMany = jest.fn();

const mockPrismaClient = {
  permissionOnRole: {
    findMany: mockFindMany,
  },
};

jest.unstable_mockModule('../../utils/prisma.js', () => ({
  default: mockPrismaClient,
}));

const { RBAC } = await import('../../middlewares/role/rbac.js');

function makeReqRes(user?: unknown) {
  const req = { user } as any;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;
  const next = jest.fn();
  return { req, res, next };
}

describe('RBAC middleware', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  it('calls next() when user has required permission', async () => {
    mockFindMany.mockResolvedValue([{ permission: { action: 'read', resource: 'resource' } }]);
    const { req, res, next } = makeReqRes({ role: { id: 'role-1' } });
    await RBAC('read', 'resource')(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user lacks permission', async () => {
    mockFindMany.mockResolvedValue([{ permission: { action: 'write', resource: 'other' } }]);
    const { req, res, next } = makeReqRes({ role: { id: 'role-1' } });
    await RBAC('read', 'resource')(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Access denied' });
  });

  it('returns 403 when user has no permissions at all', async () => {
    mockFindMany.mockResolvedValue([]);
    const { req, res, next } = makeReqRes({ role: { id: 'role-1' } });
    await RBAC('read', 'resource')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next(error) when prisma throws', async () => {
    const err = new Error('DB error');
    mockFindMany.mockRejectedValue(err);
    const { req, res, next } = makeReqRes({ role: { id: 'role-1' } });
    await RBAC('read', 'resource')(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  it('uses anonymous roleId when no user on request', async () => {
    mockFindMany.mockResolvedValue([]);
    const { req, res, next } = makeReqRes(undefined);
    await RBAC('read', 'resource')(req, res, next);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { roleId: 'anonymous' } })
    );
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
