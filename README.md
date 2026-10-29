# LuminaUL Frontend · Software II

Frontend de LuminaUL construido con **React 19**, **TypeScript**, **Vite** y **CSS responsive**. La interfaz adopta la identidad visual institucional de la Universidad de Lima, transiciones y animaciones fluidas, y consume los flujos persistidos del backend NestJS.

---

## 🚀 Requisitos Previos

* **Node.js** v20 o v22+ LTS.
* **Backend LuminaUL** ejecutándose en `http://127.0.0.1:8000`.

---

## 🛠️ Instalación y Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar en modo desarrollo
```bash
npm run dev
```

La aplicación web estará disponible en `http://localhost:5173`.

Vite incluye un proxy inverso que reenvía automáticamente las llamadas a la API REST (`/api`, `/posts`, `/auth`, `/profiles`, etc.) y las conexiones WebSockets (`/socket.io`) al backend en `http://127.0.0.1:8000`.

---

## 👥 Cuentas de Prueba Pre-Sembradas

Para iniciar sesión y probar la interfaz, puedes utilizar cualquiera de las cuentas demo inicializadas en la base de datos (`npm run db:init` en el backend):

| Rol | Correo | Contraseña | Vistas y Módulos a Probar |
| :--- | :--- | :--- | :--- |
| **Alumno 1** | `demo.student@ulima.edu.pe` | `Password123!` | Feed de publicaciones, Gestión de Grupo demo y Chat en tiempo real. |
| **Alumno 2** | `carlos.mendoza@aloe.ulima.edu.pe` | `Password123!` | Reseñas cruzadas a Alumno 1, Reportes de moderación y solicitud de unión. |
| **Admin** | `admin@aloe.ulima.edu.pe` | `Password123!` | Panel de administración y auditoría en `/admin`. |

---

## 🧪 Pruebas y Construcción

```bash
# Validar tipado y compilar para producción:
npm run build

# Pruebas unitarias:
npm run test:unit

# Pruebas de integración:
npm run test:integration

# Pruebas de feedback visual:
npm run test:feedback
```

---

## 📚 Enlaces de Interés

* [**Especificaciones Técnicas (SPECS.md)**](../docs/SPECS.md)
* [**Protocolo de Desarrollo con IA (AGENTS.md)**](../luminaul-new-backend/AGENTS.md)
