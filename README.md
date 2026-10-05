# LuminaUL Frontend · Software II

Frontend de LuminaUL construido con React, TypeScript, Vite y CSS responsive. La interfaz usa la identidad naranja de la Universidad de Lima, transiciones y animaciones accesibles en las interacciones, y consume los flujos persistidos del backend NestJS.

## Ejecutar

Requiere Node.js 22.12 o superior y el backend del equipo en `http://127.0.0.1:8000`.

~~~powershell
npm ci
npm run dev
~~~

Abre `http://localhost:5173`, que coincide con `WEB_ORIGIN` del backend. Vite reenvía las rutas de API y `/uploads` al backend local. Para validar el artefacto:

~~~powershell
npm run build
npm run test:feedback
~~~

`test:feedback` usa respuestas simuladas y Microsoft Edge. `npm run test:integration` inicia servicios reales en 5174/8001 y usa únicamente `luminaul_equipo_test`: prueba autenticación, solicitudes, registro con correo SMTP, perfil y horario. Requiere haber compilado el backend y tener su PostgreSQL/Mailpit locales encendidos. Busca el backend en `../backend`; si está en otra carpeta, define `LUMINAUL_BACKEND_DIR` con esa ubicación. Resultados en `analysis/validation/`.

Backend compatible: [rama de integración de cuentas y perfil del equipo](https://github.com/LuminaUL-Grupo3/luminaul-new-backend/tree/feature/robert-integracion-cuentas-perfil). Lee [la guía de integración](docs/INTEGRACION_ROBERT.md) para ejecutar y conocer el alcance.

## Estructura

- `src/app.tsx`: rutas protegidas y composición de la aplicación.
- `src/api.ts`: cliente HTTP tipado con cookies y manejo de errores.
- `src/auth-pages.tsx`: registro, verificación, inicio y recuperación de sesión.
- `src/publication-pages.tsx`, `group-pages.tsx`, `chat-page.tsx`: historias de publicaciones, grupos y chat.
- `src/profile-pages.tsx`, `moderation-pages.tsx`: perfil, reseñas, moderación y administración.
- `src/styles.css`: sistema visual naranja, responsive, foco accesible y animaciones.
