# LuminaUL Frontend · Software II

Frontend de LuminaUL construido con React, TypeScript, Vite y CSS responsive. La interfaz usa la identidad naranja de la Universidad de Lima, transiciones y animaciones accesibles en las interacciones, y consume los flujos persistidos del backend NestJS.

## Ejecutar

Requiere Node.js 24 LTS y la API NestJS ejecutándose en `http://127.0.0.1:3000`.

~~~powershell
npm ci
npm run dev
~~~

Abre `http://localhost:5173`, que coincide con `WEB_ORIGIN` del backend. Vite reenvía `/api`, `/uploads` y `/socket.io` al backend local. Para validar el artefacto:

~~~powershell
npm run build
npm run test:feedback
~~~

Las pruebas de interacciones necesitan Vite ejecutándose y Microsoft Edge instalado; usan respuestas simuladas sin modificar usuarios. `npm run test:browser` comprueba navegación y chat reales con las cuentas demo del backend. Los resultados se guardan en `analysis/validation/`.

Backend compatible: [codex/software-ii-backend](https://github.com/LuminaUL-Grupo3/luminaul-new-backend/tree/codex/software-ii-backend). Lee [las decisiones y límites](docs/IMPLEMENTACION.md) antes de integrar esta migración.

## Estructura

- `src/app.tsx`: rutas protegidas y composición de la aplicación.
- `src/api.ts`: cliente HTTP tipado con cookies y manejo de errores.
- `src/auth-pages.tsx`: registro, verificación, inicio y recuperación de sesión.
- `src/publication-pages.tsx`, `group-pages.tsx`, `chat-page.tsx`: historias de publicaciones, grupos y chat.
- `src/profile-pages.tsx`, `moderation-pages.tsx`: perfil, reseñas, moderación y administración.
- `src/styles.css`: sistema visual naranja, responsive, foco accesible y animaciones.
