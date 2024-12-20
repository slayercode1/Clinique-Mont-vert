import * as dotenv from 'dotenv';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma.js';

dotenv.config();

export const jwtErrorHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = request.headers['authorization'] as string;

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return response.sendStatus(401);

  // Vérifier le token
  const user = jwt.verify(token!, String(process.env.JWT_SECRET_KEY)) as {
    id: string;
    firstname: string;
    lastname: string;
  };

  // Vérifier si le token est stocké dans la base de données
  const storedToken = await prisma.session.findUnique({
    where: {
      userid: user.id,
    },
  });

  if (storedToken?.token !== token) return response.sendStatus(401);
  // Ajouter l'utilisateur à la requête pour l'utiliser dans les routes suivantes
  (request as any)['user'] = user;
  next();
};
