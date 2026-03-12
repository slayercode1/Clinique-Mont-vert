import * as dotenv from 'dotenv';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma.js';

dotenv.config({ quiet: true });

export const jwtErrorHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = request.headers.authorization as string;
  const token = authHeader?.split(' ')[1];

  if (!token) return response.sendStatus(401);

  let payload: { id: string };
  try {
    payload = jwt.verify(token, String(process.env.JWT_SECRET_KEY)) as { id: string };
  } catch {
    return response.sendStatus(401);
  }

  const storedSession = await prisma.session.findUnique({
    where: { userid: payload.id },
  });

  if (!storedSession || storedSession.token !== token) {
    return response.sendStatus(401);
  }

  if (new Date(storedSession.expired_at) < new Date()) {
    await prisma.session.delete({ where: { userid: payload.id } });
    return response.sendStatus(401);
  }

  (request as any).user = payload;
  next();
};
