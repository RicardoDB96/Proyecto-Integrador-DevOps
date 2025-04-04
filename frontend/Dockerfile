# Usar una imagen base de Node.js
FROM node:22-alpine AS builder
 
# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos y instalar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del código y construir la aplicación
COPY . .
RUN npm run build

# Usar Nginx para servir el frontend
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80 para el frontend
EXPOSE 80

# Ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]