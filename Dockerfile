# Usar una imagen base de Node.js
FROM node:22-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar package.json y package-lock.json primero para optimizar la caché de Docker
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar el resto de los archivos al contenedor
COPY . .

# Exponer el puerto en el que corre el backend
EXPOSE 5001

# Comando por defecto para ejecutar la API
CMD ["node", "server.js"]
