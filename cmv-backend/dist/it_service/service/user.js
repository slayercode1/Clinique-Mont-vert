import bcrypt from 'bcrypt';
import { sendemail } from './task.js';
import prisma from '../../utils/prisma.js';
export const getUsers = async (_, response) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                firstname: {
                    not: 'technique',
                },
            },
            include: {
                role: true,
            },
        });
        const serializedUsers = users.map((user) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return response.status(200).json({ success: true, data: serializedUsers });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des utilisateurs',
        });
    }
};
export const getRoles = async (_, response) => {
    try {
        const role = await prisma.role.findMany();
        return response.status(200).json({ success: true, data: role });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des roles',
        });
    }
};
export const createUser = async (request, response) => {
    const body = request.body;
    try {
        const passwordHash = await bcrypt.hash(body.password, 10);
        const role = await prisma.role.findUnique({
            where: {
                id: body.roleId,
            },
        });
        const user = await prisma.user.create({
            data: {
                firstname: body.firstname,
                lastname: body.lastname,
                email: body.email,
                password: passwordHash,
                status: body.status,
                roleId: role.id,
            },
        });
        const { password, ...userWithoutPassword } = user;
        //Todo: Send a email with mdp to user
        sendemail('password.edge', { user: user, paswword: body.password }, user.email, 'Mot de passe temporaire pour première connexion', response);
        return response
            .status(200)
            .json({ success: true, data: userWithoutPassword });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: `Une erreur est survenue lors de la creation de utilisateurs`,
        });
    }
};
export const updateUsers = async (request, response) => {
    const body = request.body;
    const id = request.params.id;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user)
            return response.status(404).json({
                success: false,
                message: "L'utilisateur n'a pas etait trouver ",
            });
        const userUpdate = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                roleId: body.roleId,
                email: body.email,
                firstname: body.firstname,
                lastname: body.lastname,
                status: body.status,
            },
            include: {
                role: true,
            },
        });
        const { password, ...userWithoutPassword } = userUpdate;
        return response
            .status(200)
            .json({ success: true, data: userWithoutPassword });
    }
    catch (e) {
        return response.status(500).json({
            success: false,
            message: `Une erreur est survenue lors de la modification de utilisateurs ${id}`,
        });
    }
};
