import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma.js';
dotenv.config();
export const jwtErrorHandler = async (request, response, next) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return response.sendStatus(401);
    // Vérifier le token
    const user = jwt.verify(token, String(process.env.JWT_SECRET_KEY));
    // Vérifier si le token est stocké dans la base de données
    const storedToken = await prisma.session.findUnique({
        where: {
            userid: user.id,
        },
    });
    if (storedToken?.token !== token)
        return response.sendStatus(401);
    // Ajouter l'utilisateur à la requête pour l'utiliser dans les routes suivantes
    request['user'] = user;
    next();
};
