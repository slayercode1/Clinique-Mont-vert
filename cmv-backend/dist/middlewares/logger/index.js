import chalk from "chalk";
export const logger = (req, res, next) => {
    const start = Date.now(); // capture le début de la requête
    // Couleurs pour les méthodes HTTP
    let methodColor = chalk.blue;
    if (req.method === "GET") {
        methodColor = chalk.green;
    }
    else if (req.method === "POST") {
        methodColor = chalk.cyan;
    }
    else if (req.method === "PUT") {
        methodColor = chalk.yellow;
    }
    else if (req.method === "DELETE") {
        methodColor = chalk.red;
    }
    // Affichage des logs avec couleurs
    // écoute la fin de la réponse pour calculer le temps d'exécution
    res.on("finish", () => {
        const duration = Date.now() - start; // temps écoulé
        console.log(`${methodColor(req.method)} ${chalk.blue(req.originalUrl)} ${chalk.grey(`${duration}ms`)}`);
    });
    next();
};
