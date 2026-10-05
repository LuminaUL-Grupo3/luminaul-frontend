# Frontend de Robert

Base: avances actuales de `LuminaUL-Grupo3/luminaul-frontend`, con las ramas de solicitudes ya incorporadas a main. Se conserva la paleta naranja, DM Sans/Manrope y la distribución del equipo.

- **2.1**: `JoinGroupDialog` comparte el formulario de solicitud entre publicación y detalle. Consulta datos reales del grupo, valida el mensaje, evita doble envío y muestra confirmación con estado pending persistente.
- **2.2**: `RequestsPage`, `JoinRequestCard` y `useJoinRequests` conservan los endpoints y acciones del equipo. Se agrega contador, actualización manual, enlace al grupo, bloqueo de decisiones simultáneas y estilos usando la paleta existente.
- **3.2**: `AuthPage` valida correo institucional y contraseña antes de POST `/auth/login`. `SessionProvider` consulta GET `/auth/me`. Un 404 ya no concede acceso de demostración.
- **3.7**: el botón de la barra lateral pide confirmación con el modal de la aplicación. Cancelar no envía HTTP. Ante fallo de red se conserva la sesión; al confirmar correctamente se revoca por POST `/auth/logout` y se vuelve al login.

`ApiClient` centraliza cookies y errores. Las microanimaciones usan CSS y se desactivan con `prefers-reduced-motion`. No se usa window.alert/confirm/prompt ni se muestran cuentas o contraseñas locales en las pantallas.

## Corrección de cuentas, perfil y horario

Se conectan registro, verificación, reenvío, recuperación y cambio de contraseña al backend actual del equipo. Las validaciones aparecen dentro de los formularios. La pantalla de verificación local abre Mailpit en **http://localhost:8026**; en producción no muestra este enlace. Para entrega al correo institucional, el backend debe tener un proveedor SMTP configurado.

Mi perfil y Editar perfil muestran datos de `/profiles/me`; no sustituyen errores con carrera, habilidades o calificaciones ficticias. Una cuenta recién creada permite completar esos datos. La carga de foto usa multipart y conserva la URL entregada por el servidor. El horario consulta el perfil, valida inicio/fin, informa los cruces y permite crear/editar/eliminar franjas propias con confirmaciones del diseño existente. Las reseñas y el promedio se consultan en la base real.

La API traduce un error técnico de ruta inexistente a un aviso de función todavía no disponible. Este aviso no hace pasar una operación fallida por exitosa: el dato no se guarda y el estado no se modifica. Registro y perfil cuentan con sus rutas reales; esta traducción queda para módulos aún pendientes.

## Ejecutar

Con el backend en 8000: `npm.cmd ci`, después `npm.cmd run dev`, y abrir http://localhost:5173. Vite aproxima las rutas de API al backend, con cookies del mismo origen. `BACKEND_URL` permite cambiar el destino del proxy. `VITE_API_URL` es opcional si el despliegue usa un origen de API explícito; ese backend debe permitir cookies del origen del frontend.

`npm.cmd run build` verifica TypeScript y genera el bundle. `npm.cmd run test:integration` prepara servicios reales en el entorno aislado 5174/8001 y ejecuta `tests/sprint2.mjs` y `tests/accounts-profile.mjs`: login, solicitudes, logout, registro/correo/verificación, edición de perfil, horario, móvil y movimiento reducido. Requiere el backend compilado, sus dependencias instaladas y PostgreSQL/Mailpit de Docker Compose encendidos. El backend se busca en `../backend`; `LUMINAUL_BACKEND_DIR` admite otra ubicación. `-- --accounts-only` repite solo el navegador de cuentas después de preparar la base de pruebas con el comando completo.

Se conservan las pantallas del equipo. Siguen pendientes chat/notificaciones, reportes/moderación, eliminación de cuenta y administración completa. Se necesita acordar también los campos adicionales de edición de publicación con quien mantiene ese módulo. No debe afirmarse que todo el producto esté conectado por esta revisión.
