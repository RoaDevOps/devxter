# ==========================================================================
# ETAPA 1: Compilación de TypeScript y empaquetado con Vite
# ==========================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos manifiestos de dependencias para aprovechar la caché de capas de Docker
COPY package.json package-lock.json ./
RUN npm ci

# Copiamos el código fuente y generamos el build de producción en /app/dist
COPY . .
RUN npm run build

# ==========================================================================
# ETAPA 2: Servidor de producción ligero con NGINX
# ==========================================================================
FROM nginx:1.27-alpine AS production

# Limpiamos los archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiamos únicamente el bundle compilado desde la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]