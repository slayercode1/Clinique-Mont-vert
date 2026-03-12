import { describe, expect, it, jest } from '@jest/globals';
import { z } from 'zod';
import { validateData } from '../../middlewares/validation/validationZod.js';

const testSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function makeReqRes(body: unknown) {
  const req = { body } as any;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;
  const next = jest.fn();
  return { req, res, next };
}

describe('validateData middleware', () => {
  it('calls next() for valid data', () => {
    const { req, res, next } = makeReqRes({ email: 'user@example.com', password: 'secret123' });
    validateData(testSchema)(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid email', () => {
    const { req, res, next } = makeReqRes({ email: 'not-an-email', password: 'secret123' });
    validateData(testSchema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid data', details: expect.any(Array) })
    );
  });

  it('returns 400 for password too short', () => {
    const { req, res, next } = makeReqRes({ email: 'user@example.com', password: '123' });
    validateData(testSchema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for empty body', () => {
    const { req, res, next } = makeReqRes({});
    validateData(testSchema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    const jsonArg = (res.json.mock.calls[0] as any[])[0];
    expect(jsonArg.details).toBeInstanceOf(Array);
    expect(jsonArg.details.length).toBeGreaterThan(0);
  });

  it('details array contains error message strings', () => {
    const { req, res, next } = makeReqRes({ email: 'bad', password: 'x' });
    validateData(testSchema)(req, res, next);
    const jsonArg = (res.json.mock.calls[0] as any[])[0];
    expect(jsonArg.details).toBeInstanceOf(Array);
    for (const d of jsonArg.details) {
      expect(typeof d.message).toBe('string');
    }
  });
});
