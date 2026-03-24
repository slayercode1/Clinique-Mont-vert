import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma.js';

dotenv.config({ quiet: true });

const JWT_EXPIRY = '8h';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export const signIn = async (request: Request, response: Response): Promise<any> => {
  const { email, password: p } = request.body as {
    email: string;
    password: string;
  };
  try {
    if (!email || !p)
      return response.status(400).json({
        success: false,
        message: 'Email or password is missing',
      });

    const accountExist = await prisma.user
      .findFirst({
        where: { email },
        include: { role: true },
      })
      .catch(() => null);

    // Message identique pour éviter l'énumération d'utilisateurs
    if (!accountExist || accountExist.status === 'INACTIF') {
      return response.status(400).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    const passwordIsValid = await bcrypt.compare(p, accountExist.password);
    if (!passwordIsValid)
      return response.status(400).json({
        success: false,
        message: 'Identifiants invalides',
      });

    const privateKey = process.env.JWT_SECRET_KEY as string;
    const accessToken = jwt.sign({ id: accountExist.id }, privateKey, { expiresIn: JWT_EXPIRY });

    await prisma.session.deleteMany({ where: { userid: accountExist.id } });

    await prisma.session.create({
      data: {
        token: accessToken,
        userid: accountExist.id,
        expired_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
      },
    });

    const { password, ...userWithoutPassword } = accountExist;

    return response.status(200).json({
      success: true,
      data: { ...userWithoutPassword, token: accessToken },
    });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la connexion',
    });
  }
};

export const signOut = async (request: Request, response: Response): Promise<any> => {
  try {
    const currentUser = (request as any).user;
    if (!currentUser) return response.status(401).json({ success: false, message: 'Non autorisé' });

    await prisma.session.deleteMany({ where: { userid: currentUser.id } });

    return response.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la déconnexion',
    });
  }
};

export const changePassword = async (request: Request, response: Response): Promise<any> => {
  try {
    const currentUser = (request as any).user;
    const { password } = request.body as { password: string };

    if (!password || password.length < 8 || password.length > 128) {
      return response.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir entre 8 et 128 caractères',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!user)
      return response.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash, isChangePassword: true },
    });

    return response.status(200).json({
      success: true,
      message: 'Votre mot de passe a été modifié avec succès.',
    });
  } catch (_e) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la modification du mot de passe',
    });
  }
};

export const getSession = async (request: Request, response: Response): Promise<any> => {
  const currentUser = (request as any).user;
  if (!currentUser?.id) {
    return response.status(401).json({ success: false, message: 'Non autorisé' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        role: {
          include: {
            PermissionOnRole: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      return response.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    const { password, ...userWithoutPassword } = user;
    return response.status(200).json({ success: true, data: userWithoutPassword });
  } catch (_error) {
    return response.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération de la session',
    });
  }
};
