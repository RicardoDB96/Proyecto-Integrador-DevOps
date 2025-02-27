# Usar una imagen base de Node.js
FROM node:22-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos necesarios
COPY package.json package-lock.json ./

# Instalar solo las dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Exponer el puerto del backend
EXPOSE 5001

# Comando por defecto para ejecutar la API
CMD ["node", "server.js"]
