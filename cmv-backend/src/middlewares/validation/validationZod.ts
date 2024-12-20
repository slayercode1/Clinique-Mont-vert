import { z, ZodError } from 'zod';
import { NextFunction, Request, Response } from 'express';

// Middleware pour valider les données de la requête à l'aide de Zod
export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validation des données de la requête (req.body) avec le schéma Zod fourni
      schema.parse(req.body);
      // Si la validation réussit, on passe au middleware suivant
      next();
    } catch (error) {
      // Gestion des erreurs si la validation échoue
      if (error instanceof ZodError) {
        // Si l'erreur est une ZodError, on formate les messages d'erreur
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join('.')} is ${issue.message}`,
        }));
        // Renvoie une réponse avec statut 400 et les détails des erreurs
        res.status(400).json({ error: 'Invalid data', details: errorMessages });
      } else {
        // Si l'erreur n'est pas une ZodError, renvoie une erreur interne serveur
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
}
