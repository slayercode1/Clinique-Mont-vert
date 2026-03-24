import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();

const mockPrismaClient = {
  user: {
    findUnique: mockFindUnique,
  },
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
    mockFindUnique.mockReset();
    mockFindMany.mockReset();
  });

  it('returns 401 when no user on request', async () => {
    const { req, res, next } = makeReqRes(undefined);
    await RBAC('read', 'resource')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Non autorisé' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when user not found in DB', async () => {
    mockFindUnique.mockResolvedValue(null);
    const { req, res, next } = makeReqRes({ id: 'user-1' });
    await RBAC('read', 'resource')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Utilisateur introuvable' });
  });

  it('calls next() when user has required permission', async () => {
    mockFindUnique.mockResolvedValue({ roleId: 'role-1' });
    mockFindMany.mockResolvedValue([{ permission: { action: 'read', resource: 'resource' } }]);
    const { req, res, next } = makeReqRes({ id: 'user-1' });
    await RBAC('read', 'resource')(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user lacks permission', async () => {
    mockFindUnique.mockResolvedValue({ roleId: 'role-1' });
    mockFindMany.mockResolvedValue([{ permission: { action: 'write', resource: 'other' } }]);
    const { req, res, next } = makeReqRes({ id: 'user-1' });
    await RBAC('read', 'resource')(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Accès refusé' });
  });

  it('returns 403 when user has no permissions at all', async () => {
    mockFindUnique.mockResolvedValue({ roleId: 'role-1' });
    mockFindMany.mockResolvedValue([]);
    const { req, res, next } = makeReqRes({ id: 'user-1' });
    await RBAC('read', 'resource')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next(error) when prisma throws', async () => {
    const err = new Error('DB error');
    mockFindUnique.mockRejectedValue(err);
    const { req, res, next } = makeReqRes({ id: 'user-1' });
    await RBAC('read', 'resource')(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
