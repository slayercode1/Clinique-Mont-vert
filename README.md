# Clinique Mont-Vert

Application de gestion interne pour une clinique fictive, developpee dans le cadre d'une formation.

## Technologies

| Couche | Stack |
|--------|-------|
| **Frontend** (`cmv-web`) | Vue 3, Vite, Tailwind CSS v4, shadcn-vue, Pinia, TanStack Table |
| **Backend** (`cmv-backend`) | Node.js, Express, Prisma, PostgreSQL, Redis |
| **Infra** | Docker, Caddy (reverse proxy + HTTPS auto), GitHub Actions (CI/CD) |

## Demarrage local

```bash
git clone https://github.com/slayercode1/Clinique-Mont-vert.git
cd Clinique-Mont-vert
```

### Avec Docker (recommande)

```bash
docker compose -f compose.dev.yaml up --build
```

### Sans Docker

```bash
# Backend
cd cmv-backend && npm install && npm run dev

# Frontend (dans un autre terminal)
cd cmv-web && npm install && npm run dev
```

Le frontend tourne sur `http://localhost:5173` et proxy automatiquement `/it/*` et `/fleet/*` vers le backend sur le port `3000`.

## Variables d'environnement

### Backend (`cmv-backend/.env`)

```env
# Database
POSTGRES_USER=cmv_user
POSTGRES_PASSWORD=mot_de_passe_fort
POSTGRES_DB=cmv_db
DATABASE_URL=postgresql://cmv_user:mot_de_passe_fort@db:5432/cmv_db

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=cle_secrete_longue_et_aleatoire

# Server
PORT=3000
NODE_ENV=production

# Mail
MAIL_HOST=smtp.provider.com
MAIL_PORT=587
MAIL_USER=noreply@domaine.com
MAIL_PASS=mot_de_passe_smtp
MAIL_FROM=noreply@domaine.com
```

### Frontend (`cmv-web/.env`)

```env
VITE_API_URL=
```

> En production, laisser `VITE_API_URL` vide. Caddy route `/it/*` et `/fleet/*` vers le backend. Le frontend fait ses appels en relatif.

## Deploiement en production

### Architecture

```
Internet → Caddy (ports 80/443) → web (Nginx, SPA)
                                 → server (Node.js API)
                                    → PostgreSQL
                                    → Redis
```

### Configuration Caddy (`Caddyfile`)

Placer ce fichier a la racine du projet :

```caddyfile
cmv.votredomaine.com {
    # API backend - routes /it/* et /fleet/*
    @api path /it/* /fleet/*
    handle @api {
        reverse_proxy server:3000
    }

    # Frontend SPA (fallback)
    handle {
        reverse_proxy web:80
    }

    # Headers de securite
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
    }

    encode gzip zstd
}
```

> Caddy gere automatiquement les certificats HTTPS via Let's Encrypt. Remplacer `cmv.votredomaine.com` par votre domaine reel.

### Docker Compose (`compose.yaml`)

```yaml
services:
  db:
    image: postgres:17-alpine
    env_file: ./cmv-backend/.env
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-net
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-net
    restart: unless-stopped

  server:
    build:
      context: ./cmv-backend
    env_file: ./cmv-backend/.env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-net
      - caddy-net
    restart: unless-stopped

  web:
    build:
      context: ./cmv-web
    depends_on:
      - server
    networks:
      - app-net
      - caddy-net
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
    depends_on:
      - web
      - server
    networks:
      - caddy-net
    restart: unless-stopped

networks:
  app-net:
  caddy-net:
    external: true

volumes:
  postgres-data:
  redis-data:
  caddy-data:
  caddy-config:
```

### Deployer

```bash
# Creer le network Caddy (une seule fois)
docker network create caddy-net

# Lancer les services
docker compose up -d --build

# Initialiser la base de donnees (premier deploiement)
docker compose exec server npx prisma migrate deploy
docker compose exec server npx prisma db seed
```

### CI/CD

Le deploiement est automatise via GitHub Actions :
1. Un push/merge sur `main` declenche le workflow
2. Le workflow build, teste et deploie sur le VPS
3. Les secrets (SSH, env) sont stockes dans les secrets du repo GitHub

## Tests

```bash
# Backend
cd cmv-backend && npm run test

# Frontend
cd cmv-web && npm run test
```

## Structure du projet

```
Clinique-Mont-vert/
├── cmv-backend/          # API Express + Prisma
│   ├── prisma/           # Schema et migrations
│   ├── src/
│   │   ├── fleet_service/  # Service gestion automobile
│   │   ├── it_service/     # Service informatique (users, tickets, resources)
│   │   ├── middlewares/    # JWT, RBAC, validation
│   │   └── utils/          # Mailer, cache, Redis
│   └── Dockerfile
├── cmv-web/              # SPA Vue 3
│   ├── src/
│   │   ├── components/   # UI components (shadcn-vue)
│   │   ├── pages/        # Pages (auth, users, tickets, resources, fleet)
│   │   ├── store/        # Pinia stores
│   │   └── utils/        # Schemas Zod, helpers
│   ├── nginx.conf        # Config Nginx pour le container
│   └── Dockerfile
├── Caddyfile             # Reverse proxy production
├── compose.yaml          # Docker Compose production
└── compose.dev.yaml      # Docker Compose developpement
```
