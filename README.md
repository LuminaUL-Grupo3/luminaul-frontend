# LuminaUL Frontend (React 19 + TypeScript + Vite)

Frontend web de la plataforma **LuminaUL**, desarrollado con **React 19**, **TypeScript 5**, **Vite**, **TanStack Query v5**, **Zustand** y estilos CSS accesibles bajo la identidad visual institucional de la Universidad de Lima.

---

## 1. Requisitos Previos

* **Node.js:** Versión 20 o superior (recomendado Node.js 22 LTS).
* **Backend NestJS:** En ejecución en `http://localhost:8000`.

---

## 2. Instalación y Ejecución

### 2.1 Instalar dependencias
```bash
npm install
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

---

## 3. Pruebas Funcionales

```bash
# Pruebas funcionales en navegador con Playwright
npm run test:browser
```
