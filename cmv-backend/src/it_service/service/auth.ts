import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../../utils/prisma.js';

dotenv.config();

export const signIn = async (
  request: Request,
  response: Response
): Promise<any> => {
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
        where: {
          email: email,
        },
        include: {
          role: {
            include: {
              PermissionOnRole: {
                include: {
                  role: true,
                  permission: true,
                },
              },
            },
          },
        },
      })
      .catch((err: any) => {
        console.log(err);
      });

    if (!accountExist)
      return response.status(400).json({
        success: false,
        message: 'Credentials are not valid',
      });

    if (accountExist.status === 'INACTIF')
      return response.status(400).json({
        success: false,
        message: 'Votre compte est Inacif',
      });

    const passwordIsValid = await bcrypt.compare(p, accountExist.password);
    if (!passwordIsValid)
      return response.status(400).json({
        success: false,
        message: 'Credentials are not valid',
      });

    const { password, ...userWithoutPassword } = accountExist;

    //create jwt
    const privateKey = process.env.JWT_SECRET_KEY as string;
    const accessToken = jwt.sign(
      {
        ...userWithoutPassword,
      },
      privateKey
    );
    //save in db
    await prisma.session.create({
      data: {
        token: accessToken,
        userid: accountExist.id,
        expired_at: new Date().toISOString(),
      },
    });
    //return user
    return response.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        token: accessToken,
      },
    });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la connexion`,
    });
  }
};

export const signOut = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const id = request.params.id;
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user)
      return response.status(401).json({
        success: false,
        message: 'User not found',
      });

    await prisma.session.delete({
      where: { userid: user.id },
    });

    return response.status(200).json({
      success: true,
      message: 'User is logout',
    });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la déconnexion`,
    });
  }
};

export const changePassword = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { userId, password, isChangePassword } = request.body as {
      userId: string;
      password: string;
      isChangePassword: boolean;
    };

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user)
      return response.status(401).json({
        success: false,
        message: 'User not found',
      });
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        isChangePassword: isChangePassword,
      },
    });
    return response.status(200).json({
      success: true,
      message: 'Votre mot de passe a été bien changer.',
    });
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la modification de mot de passe`,
    });
  }
};

export const getSession = async (
  request: Request,
  response: Response
): Promise<any> => {
  const id = (request as any).user?.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        role: {
          include: {
            PermissionOnRole: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const { password, ...userWithoutPassword } = user as any;
    return response.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: `Une erreur est survenue lors de la récupération de la session`,
    });
  }
};
