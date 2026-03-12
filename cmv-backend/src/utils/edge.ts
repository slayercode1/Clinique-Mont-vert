import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Edge } from 'edge.js';

// Obtenir le chemin absolu du fichier actuel
const __filename = fileURLToPath(import.meta.url);

// Obtenir le répertoire contenant le fichier actuel
const __dirname = dirname(__filename);

// Création d'une instance du moteur Edge.js avec des options
const edge = new Edge({ cache: false }); // Désactiver le cache pour faciliter le développement

// Configuration de la localisation des templates
edge.mount(path.join(__dirname, '../../views/emails'));

// Exportation de la fonction `render`, liée à l'instance d'Edge.js
// Cela permet de l'utiliser directement pour rendre des templates
export const render = edge.render.bind(edge);
