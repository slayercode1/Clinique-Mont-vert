import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Edge } from 'edge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const edge = new Edge({ cache: false });
edge.mount(path.join(__dirname, '../../views/emails'));

export const render = edge.render.bind(edge);
