# Clinique Mont-Vert

Ce projet consiste à réaliser une partie d'une applications pour un clique fictif dans le cadre d'un formation pour améliorer la communication.


## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)

## Technologie utiliser

**cmv-web:** Vuejs, Vitejs, shadcn/ui

**cmv-backend:** Node, Express, prisma


## Run Locally

Clone the project

```bash
  git clone https://github.com/slayercode1/Clinique-Mont-vert.git
```

Go to the project directory

```bash
  cd Clinique-Mont-vert
```

Install dependencies

```bash
  cd cmv-backend && npm install
  cd cmv-web && npm install
```

Start the All server

```bash
  cd cmv-backend && npm run dev
  cd cmv-web && npm run dev
```


## Environment Variables

Creer un .env a la racine du dossier cmv-backend et mettre les envirommennt ci-dessous

``PORT_GATEWAY``  
``PORT_SERVICE_IT``  
``PORT_SERVICE_FLEET``  
``CORS_ORIGIN``  
``JWT_SECRET_KEY``  
``DATABASE_URL``  


## Running Tests

Dans le dossier cmv-backend lancer la command ci-dessous

```bash
  npm run test
```


## Déploiement

Pour déployer ce projet, suivez les étapes suivantes :

1. Le déploiement est déclenché automatiquement via GitHub Actions.
2. Lorsqu'une pull request est fusionnée dans la branche `main`, le workflow est lancé.
3. Le workflow inclut les étapes suivantes :
    - **Tests :** Exécute la suite de tests définie pour garantir la qualité et le bon fonctionnement du code.
    - **Build :** Compile l'application pour une utilisation en production.
    - **Déploiement :** Déploie l'application compilée sur un serveur privé virtuel (VPS).
4. Le VPS reçoit la version mise à jour de l'application, assurant ainsi un déploiement fluide.

Assurez-vous que le fichier de workflow GitHub Actions est correctement configuré et que les identifiants du VPS sont stockés de manière sécurisée dans les secrets du dépôt.


### features

- [ ] Ajouter les routes pour les services dans le postman
- [ ] Finir d'ajouter les test pour les services

