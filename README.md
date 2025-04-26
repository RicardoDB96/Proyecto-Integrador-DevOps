# Reservo - Plataforma de Reservas para Salones de Eventos

## Descripción
El objetivo de este repositorio es desarrollar una **aplicación web** que permita a los clientes visualizar, reservar y gestionar salones eventos de manera eficiente. La plataforma ofrece funcionalidades como:

- Gestión de cuentas de usuario
- Visualización de fechas disponibles
- Procesamiento de pagos
- Galerías de eventos pasados

La implementación de la **metodología DevOps** asegura:

- Entrega continua de mejoras
- Alta calidad de código
- Respuesta ágil a las necesidades del mercado

## Tabla de Contenidos
- [Características](#caracteristicas)
- [Metodología DevOps](#metodologia-devops)
- [Tecnologías](#tecnologias)
- [GitHub Actions (CI/CD)](#github-actions-cicd)

## Características <a name="caracteristicas"></a>

1. **Autenticación y Autorización**: Registro y login de usuarios con contraseñas cifradas.
2. **Panel de Usuario**: Visualización y gestión de reservas.
3. **Calendario de Eventos**: Interfaz para buscar y seleccionar fechas disponibles.
4. **Procesamiento de Pagos**: Integración con pasarela de pagos.
5. **Galería Multimedia**: Subida y visualización de imágenes de eventos pasados.

## Metodología DevOps <a name="metodologia-devops"></a>

Para este proyecto se adoptan prácticas DevOps que brindan varios beneficios:

- **Integración y Entrega Continua (CI/CD)**  
  Automatización de pruebas y despliegues para ciclos de desarrollo rápidos.

- **Colaboración Mejorada**  
  Cultura unificada entre equipos de desarrollo y operaciones, eliminando silos.

- **Escalabilidad y Flexibilidad**  
  Adaptación dinámica a variaciones en la demanda y nuevos negocios.

- **Mejora Continua**  
  Monitoreo, retroalimentación y evolución constante de procesos y herramientas.

## Tecnologías <a name="tecnologias"></a>

- **Backend**: Node.js + Express
- **Base de Datos**: MongoDB con Mongoose
- **Frontend**: React, Tailwind CSS y Bootstrap
- **Autenticación**: Bcrypt.js para cifrado de contraseñas
- **Gestión de Multimedia**: Multer
- **Cloud & Orquestación**: Google Cloud Platform (GCP), Google Kubernetes Engine (GKE)

## GitHub Actions (CI/CD <a name="github-actions-cicd"></a>
Se define una acción en .github/workflows/ci-cd.yml que se activa al hacer push en master:

- Configura Node.js para frontend y backend.
- Instala dependencias en ambas carpetas.
- Construye artefactos (npm run build).
- Login en Docker y construcción de imágenes.
- Push de imágenes a Docker Hub.
- Autenticación en GKE.
- Despliegue en Kubernetes actualizando imágenes.
