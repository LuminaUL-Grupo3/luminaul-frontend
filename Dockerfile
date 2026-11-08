# ==========================================
# STAGE 1: Compilación de la Aplicación Web (Vite + React)
# ==========================================
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL="/api"
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ==========================================
# STAGE 2: Servidor Web Caddy de Producción
# ==========================================
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]

