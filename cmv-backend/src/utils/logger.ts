import bunyan from 'bunyan';
import * as path from 'node:path';

// Obtenez le chemin vers le dossier logs à partir de la racine du projet
const logsDir = path.resolve(__dirname, 'logs');

export const logger = bunyan.createLogger({
  name: 'cmv',
  streams: [
    { level: 'error', path: path.join(logsDir, 'error.json') },
    { level: 'debug', path: path.join(logsDir, 'debug.json') },
  ],
  src: true,
});
