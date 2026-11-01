# ==========================================
# STAGE 1: Compilación de la Aplicación Web (Vite + React)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY vite.config.mjs ./
COPY index.html ./
COPY src/ ./src/

RUN npm run build

# ==========================================
# STAGE 2: Servidor Web Nginx de Producción
# ==========================================
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

