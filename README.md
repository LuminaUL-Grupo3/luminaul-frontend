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

REVISAR ARCHIVOS .md del DRIVE