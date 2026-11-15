# LuminaUL Frontend (React 19 + TypeScript + Vite 6)

Frontend web de la plataforma **LuminaUL**, desarrollado con **React 19**, **TypeScript 5.9**, **Vite 6**, **TanStack Query v5**, **Zustand 5** y estilos CSS accesibles bajo la identidad visual institucional de la Universidad de Lima.

---

## 1. Requisitos Previos

* **Node.js:** Versión `>= 22.12`.
* **Backend NestJS:** En ejecución en `http://localhost:8000` (el proxy de Vite reenvía `/api` y `/socket.io` vía `BACKEND_URL`).

---

## 2. Instalación y Ejecución

### 2.1 Instalar dependencias
```bash
npm ci
```

### 2.2 Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación estará accesible en: `http://localhost:5173`.

### 2.3 Compilación para Producción
```bash
npm run build
```
* Ejecuta `tsc --noEmit && vite build --configLoader runner`, emitiendo chunks lazy por dominio en `dist/assets/` (las rutas de `AppRoutes.tsx` importan los barriles públicos `@/features/<feature>`).

---

## 3. Convenciones de Arquitectura Implementadas

* **Server State y Caché:** Todas las features consumen datos remotos mediante TanStack Query v5 usando claves raíz centralizadas en `src/config/queryKeys.ts` (`posts`, `courses`, `profile`, `reviews`, `moderation`, `chatGroups`, `admin`, `notifications`).
* **RBAC en Interfaz (`student` vs `admin`):** El rol `admin` no accede a flujos exclusivos de alumnos (`"Crear publicación"`, creación en `PostEditor`, `"Crear grupo"`, `"Me interesa"` / `"Solicitar ingreso"`), conservando lectura de grupos/publicaciones, edición moderadora (`/:id`), reportes y panel `/admin`.
* **Feature Boundaries y Estilos:** Cada dominio expone su API pública en `index.ts` y encapsula sus estilos específicos (`features/<feature>/styles/` o CSS de componente).

---

## 4. Pruebas Automatizadas

```bash
# Pruebas unitarias (Node test runner - 30 tests)
npm run test:unit

# Pruebas de integración API
npm run test:integration

# Pruebas funcionales en navegador con Playwright
npm run test:browser
```
