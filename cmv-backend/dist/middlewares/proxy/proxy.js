import axios from 'axios';
// Définition des routes des services avec leurs URL respectives
const serviceRoutes = {
    it: 'http://localhost:3001', // URL pour le service 'it'
    fleet: 'http://localhost:3002', // URL pour le service 'fleet'
};
// Fonction proxy pour rediriger les requêtes vers les services en fonction du nom du service
export const proxy = async (request, // Objet Request d'Express (détails de la requête entrante)
response // Objet Response d'Express (utilisé pour envoyer la réponse)
) => {
    // Récupération du nom du service à partir des paramètres de la requête (par exemple /proxy/it)
    const serviceName = request.params.service;
    // Recherche de l'URL du service à partir du nom du service
    const serviceUrl = serviceRoutes[serviceName];
    // Si l'URL du service n'est pas trouvée, on renvoie une erreur 404
    if (!serviceUrl) {
        return response.status(404).json({ error: 'Service not found' });
    }
    // Log pour afficher l'URL complète à laquelle la requête sera envoyée (pour le débogage)
    console.log(`${serviceUrl}${request.path}`);
    try {
        // Envoi de la requête HTTP au service cible en utilisant axios
        const responseFromAxios = await axios({
            method: request.method, // Utilise le même type de méthode (GET, POST, etc.) que la requête d'origine
            url: `${serviceUrl}${request.path}`, // Construction de l'URL complète en combinant l'URL du service et le chemin de la requête
            data: request.body, // Envoi des données de la requête, si elles existent (pour POST, PUT, etc.)
            headers: request.headers, // Envoi des mêmes en-têtes que ceux de la requête d'origine
        });
        // Renvoyer la réponse du service avec les en-têtes et les données reçues
        return response
            .status(200) // Réponse HTTP 200 si la requête réussit
            .set(Object.entries(responseFromAxios.headers)) // Réglage des en-têtes de la réponse en fonction des en-têtes reçus
            .send(responseFromAxios.data); // Envoi des données renvoyées par le service
    }
    catch (err) {
        // En cas d'erreur, on attrape l'erreur et on renvoie un message d'erreur approprié
        const error = err;
        // Réponse avec le code d'état de l'erreur et les données d'erreur
        response
            .status(error.response?.status || 500) // Si l'erreur contient un code de statut, l'utiliser, sinon 500
            .json(error.response?.data || { error: 'Internal server error' }); // Renvoi de l'erreur ou d'un message générique
    }
};
