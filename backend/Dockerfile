# Usar una imagen base de Node.js ligera
FROM node:18-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar solo package.json y package-lock.json antes de instalar dependencias (optimiza el cacheo)
COPY package.json package-lock.json ./

# Instalar dependencias sin incluir las de desarrollo
RUN npm install --omit=dev

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que corre la aplicación (ajusta si es necesario)
EXPOSE 5000

# Especificar la variable de entorno para producción
ENV NODE_ENV=production

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]
