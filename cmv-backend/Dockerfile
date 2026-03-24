ARG NODE_VERSION=22-alpine

# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npx prisma generate

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY views ./views

EXPOSE 3000

CMD ["node", "dist/app.js"]
