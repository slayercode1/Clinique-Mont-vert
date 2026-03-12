import { beforeEach, describe, expect, it, jest } from '@jest/globals';

process.env.JWT_SECRET_KEY = 'test-secret';

const mockUserFindFirst = jest.fn();
const mockUserFindUnique = jest.fn();
const mockUserUpdate = jest.fn();
const mockSessionCreate = jest.fn();
const mockSessionDelete = jest.fn();

const mockPrismaClient = {
  user: {
    findFirst: mockUserFindFirst,
    findUnique: mockUserFindUnique,
    update: mockUserUpdate,
  },
  session: {
    create: mockSessionCreate,
    delete: mockSessionDelete,
  },
};

jest.unstable_mockModule('../../utils/prisma.js', () => ({
  default: mockPrismaClient,
}));

const mockBcryptCompare = jest.fn();
const mockBcryptHash = jest.fn();

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    compare: mockBcryptCompare,
    hash: mockBcryptHash,
  },
}));

const mockJwtSign = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: mockJwtSign,
    verify: jest.fn(),
  },
}));

const { signIn, signOut, changePassword } = await import('../../it_service/service/auth.js');

function makeReqRes(body?: unknown, params?: Record<string, string>) {
  const req = { body: body ?? {}, params: params ?? {} } as any;
  const jsonFn = jest.fn<() => any>().mockReturnThis();
  const res = {
    status: jest.fn<(code: number) => any>().mockReturnValue({ json: jsonFn }),
    json: jsonFn,
  } as any;
  return { req, res, jsonFn };
}

describe('signIn', () => {
  beforeEach(() => {
    mockUserFindFirst.mockReset();
    mockBcryptCompare.mockReset();
    mockJwtSign.mockReset();
    mockSessionCreate.mockReset();
  });

  it('returns 400 when email is missing', async () => {
    const { req, res, jsonFn } = makeReqRes({ password: 'pass' });
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Email or password is missing' })
    );
  });

  it('returns 400 when password is missing', async () => {
    const { req, res, jsonFn } = makeReqRes({ email: 'user@example.com' });
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Email or password is missing' })
    );
  });

  it('returns 400 when user not found', async () => {
    mockUserFindFirst.mockResolvedValue(null);
    const { req, res, jsonFn } = makeReqRes({ email: 'user@example.com', password: 'pass' });
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Credentials are not valid' })
    );
  });

  it('returns 400 when account is INACTIF', async () => {
    mockUserFindFirst.mockResolvedValue({
      id: '1',
      email: 'u@e.com',
      password: 'hash',
      status: 'INACTIF',
    });
    const { req, res, jsonFn } = makeReqRes({ email: 'u@e.com', password: 'pass' });
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Votre compte est Inacif' })
    );
  });

  it('returns 400 when password is wrong', async () => {
    mockUserFindFirst.mockResolvedValue({
      id: '1',
      email: 'u@e.com',
      password: 'hash',
      status: 'ACTIF',
    });
    mockBcryptCompare.mockResolvedValue(false);
    const { req, res, jsonFn } = makeReqRes({ email: 'u@e.com', password: 'wrong' });
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Credentials are not valid' })
    );
  });

  it('returns 200 with token on success', async () => {
    const user = { id: '1', email: 'u@e.com', password: 'hash', status: 'ACTIF', role: {} };
    mockUserFindFirst.mockResolvedValue(user);
    mockBcryptCompare.mockResolvedValue(true);
    mockJwtSign.mockReturnValue('fake-token');
    mockSessionCreate.mockResolvedValue({});
    const { req, res, jsonFn } = makeReqRes({ email: 'u@e.com', password: 'pass' });
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ token: 'fake-token' }),
      })
    );
  });
});

describe('signOut', () => {
  beforeEach(() => {
    mockUserFindUnique.mockReset();
    mockSessionDelete.mockReset();
  });

  it('returns 401 when user not found', async () => {
    mockUserFindUnique.mockResolvedValue(null);
    const { req, res, jsonFn } = makeReqRes({}, { id: 'user-1' });
    await signOut(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ message: 'User not found' }));
  });

  it('returns 200 on successful logout', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'user-1' });
    mockSessionDelete.mockResolvedValue({});
    const { req, res, jsonFn } = makeReqRes({}, { id: 'user-1' });
    await signOut(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ message: 'User is logout' }));
  });
});

describe('changePassword', () => {
  beforeEach(() => {
    mockUserFindUnique.mockReset();
    mockBcryptHash.mockReset();
    mockUserUpdate.mockReset();
  });

  it('returns 401 when user not found', async () => {
    mockUserFindUnique.mockResolvedValue(null);
    const { req, res, jsonFn } = makeReqRes({ userId: 'user-1', password: 'newpass' });
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ message: 'User not found' }));
  });

  it('returns 200 on successful password change', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'user-1' });
    mockBcryptHash.mockResolvedValue('new-hash');
    mockUserUpdate.mockResolvedValue({});
    const { req, res, jsonFn } = makeReqRes({ userId: 'user-1', password: 'newpass' });
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
