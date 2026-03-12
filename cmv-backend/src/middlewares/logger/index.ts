import chalk from 'chalk';
import type { NextFunction, Request, Response } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now(); // capture le début de la requête

  // Couleurs pour les méthodes HTTP
  let _methodColor = chalk.blue;
  if (req.method === 'GET') {
    _methodColor = chalk.green;
  } else if (req.method === 'POST') {
    _methodColor = chalk.cyan;
  } else if (req.method === 'PUT') {
    _methodColor = chalk.yellow;
  } else if (req.method === 'DELETE') {
    _methodColor = chalk.red;
  }

  // Affichage des logs avec couleurs

  // écoute la fin de la réponse pour calculer le temps d'exécution
  res.on('finish', () => {
    const _duration = Date.now() - start; // temps écoulé
  });

  next();
};
