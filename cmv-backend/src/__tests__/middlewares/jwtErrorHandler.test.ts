import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET_KEY = 'test-secret';

const mockFindUnique = jest.fn();

const mockPrismaClient = {
  session: {
    findUnique: mockFindUnique,
  },
};

jest.unstable_mockModule('../../utils/prisma.js', () => ({
  default: mockPrismaClient,
}));

const { jwtErrorHandler } = await import('../../middlewares/jwt/jwtErrorHandler.js');

function makeReqRes(authHeader?: string) {
  const req = {
    headers: authHeader ? { authorization: authHeader } : {},
  } as any;
  const res = {
    sendStatus: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;
  const next = jest.fn();
  return { req, res, next };
}

describe('jwtErrorHandler middleware', () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  it('returns 401 when no Authorization header', async () => {
    const { req, res, next } = makeReqRes();
    await jwtErrorHandler(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', async () => {
    const { req, res, next } = makeReqRes('Bearer invalid.token.here');
    await jwtErrorHandler(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when valid token but no session in DB', async () => {
    const token = jwt.sign({ id: 'user-1', firstname: 'John', lastname: 'Doe' }, 'test-secret');
    mockFindUnique.mockResolvedValue(null);
    const { req, res, next } = makeReqRes(`Bearer ${token}`);
    await jwtErrorHandler(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token does not match stored session', async () => {
    const token = jwt.sign({ id: 'user-1', firstname: 'John', lastname: 'Doe' }, 'test-secret');
    mockFindUnique.mockResolvedValue({ token: 'different-token', userid: 'user-1' });
    const { req, res, next } = makeReqRes(`Bearer ${token}`);
    await jwtErrorHandler(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and sets req.user when token matches session', async () => {
    const payload = { id: 'user-1', firstname: 'John', lastname: 'Doe' };
    const token = jwt.sign(payload, 'test-secret');
    mockFindUnique.mockResolvedValue({ token, userid: 'user-1' });
    const { req, res, next } = makeReqRes(`Bearer ${token}`);
    await jwtErrorHandler(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ id: 'user-1', firstname: 'John', lastname: 'Doe' });
  });
});
