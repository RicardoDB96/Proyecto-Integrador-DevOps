# Use a lightweight Node.js image to build the frontend
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --omit=dev # Install only production dependencies

# Copy the entire frontend code
COPY . .

# Build the frontend (React/Vue/Next.js)
RUN npm run build

# Use NGINX to serve the frontend in production
FROM nginx:stable-alpine

# Copy the built frontend files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the frontend
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
