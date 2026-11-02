# SPEC-04 — Interfaz de grupos y conversación

Rama `SPEC04-grupos-chat-tiempo-real`, basada en el frontend `main` `739590b35798828a8de792bc28aac5a8a0514a3c` del 1 de noviembre de 2026. Se conecta a la rama del mismo nombre de `luminaul-new-backend`, no al backend anterior.

## Qué cambia

- `/grupos`: grupos propios y directorio paginado, filtros, creación con validaciones y estados reales.
- `/grupos/:id`: integrantes autorizados, solicitud con presentación y modal de éxito, cupos y estado pendiente; salida, expulsión y transferencia del líder con confirmación.
- `/solicitudes`: pendientes de los grupos liderados y decisiones conectadas al backend.
- `/mensajes` y `/mensajes/:id`: bandeja, historial paginado y chat Socket.IO con ACK; presencia por usuario, escritura, reacciones, respuestas y lecturas.

Se conserva el naranja, las fuentes, la disposición general y los componentes compartidos de main. Las mejoras se limitan a esta carpeta: cajas fluidas, estados de carga/error, microanimaciones, mensajes accesibles y adaptación móvil. No se modifican rutas, layout ni estilos globales. Los formularios y confirmaciones utilizan el diseño de la aplicación; no se usan `alert` ni `confirm` nativos. Se respeta `prefers-reduced-motion`.

## Organización para entender el código

| Carpeta | Función |
| --- | --- |
| `types/contracts.ts` | Respuestas REST, eventos y ACK explícitos de SPEC-04. |
| `services/messagingService.ts` | Repositorio HTTP canónico del dominio. |
| `services/apiClient.ts` | Reexporta el cliente real `src/config/api.ts` de main; conserva la sesión del equipo. |
| `services/socketClient.ts` | Singleton Socket.IO y comandos con timeout/ACK. |
| `hooks/useGroupQueries.ts` | TanStack Query, paginación, mutaciones e invalidación. |
| `hooks/useChatSocket.ts` | Ciclo de sala, eventos, reconexión y reconciliación de mensajes. |
| `pages/` | Composición de pantallas y permisos visibles. |
| `components/` | Componentes visuales y acciones accesibles. |
| `styles/chat.css` | Estilos limitados a `.spec04` y comportamiento móvil. |
| `tests/` | Pruebas contra servicios y navegador reales. |

El protocolo antiguo nombraba clientes compartidos en `src/services/`, pero esas rutas no existen en el main revisado. Por eso se adapta el cliente real dentro del feature sin crear otro sistema de autenticación ni modificar zonas compartidas. Los contratos se mantienen alineados con el backend; los tipos y wrappers antiguos siguen disponibles para no romper importaciones históricas del equipo. Las páginas activas usan `messagingService` y `types/contracts.ts`; no se deben reutilizar las rutas prototipo `/chats`, `/groups/:id/leave` o `/groups/:id/admin` del wrapper antiguo.

## Comportamiento del chat

El envío no se agrega como exitoso hasta recibir ACK. Si la conexión o la confirmación fallan se conserva el texto y, al reintentar sin editarlo, la misma clave `clientMessageId`. El servidor persiste una sola vez y la interfaz combina por ID. No se habilitan envíos invisibles mientras está desconectado.

El historial se consulta por REST y se vuelve a consultar al recuperar la conexión. Los eventos nuevos se conservan separados para que una consulta concurrente no sobrescriba mensajes recientes. Las claves privadas de Query incluyen la cuenta; al salir de una conversación se retiran listeners y se emite `chat:leave_room`, sin desconectar el socket global. Al cerrar sesión o cambiar de cuenta, el singleton sí se desconecta.

Lectura significa conversación enfocada y último mensaje visible, no solo recibir un evento en segundo plano. La presencia cuenta personas en la sala, aunque tengan varias pestañas. Escritura usa temporizadores efímeros, sin filas en la base de datos. Reacciones, respuestas y lecturas se confirman y persisten en backend. Una expulsión elimina el acceso y la conversación privada de la vista; un mensaje ocultado pierde también su texto citado.

## Ejecutar y probar

Primero preparar el backend según su guía `src/modules/group-messaging/README.md`. Luego, desde la raíz del frontend en PowerShell:

```powershell
npm ci
$env:BACKEND_URL='http://127.0.0.1:8004'
npm run dev -- --port 5175
```

Abrir `http://localhost:5175/login`. Cuentas exclusivamente locales: `spec04.lider@aloe.ulima.edu.pe`, `spec04.usuario@aloe.ulima.edu.pe` y `spec04.otro@aloe.ulima.edu.pe`; contraseña común `LuminaSpec04!2026`. No aparecen como credenciales en las pantallas. Probar con perfiles o ventanas independientes.

```powershell
npm run build
$env:SPEC04_TEST_DATABASE_URL='postgresql://postgres:TU_CLAVE_POSTGRES@127.0.0.1:5432/luminaul_spec04_test'
node src/features/chat/tests/run-integration.mjs
```

El runner espera ambos repos en carpetas hermanas `frontend`/`backend`; si no, establecer `SPEC04_BACKEND_DIR` con la ruta del backend. Usa la base local exclusiva `luminaul_spec04_test` indicada por `SPEC04_TEST_DATABASE_URL` y servidores propios en 8005/5176. Sustituir la contraseña y el puerto del ejemplo por los de tu PostgreSQL instalado directamente. Requiere dependencias instaladas, backend compilado, PostgreSQL activo y Edge disponible (`BROWSER_CHANNEL=chrome` para Chrome). Los artefactos quedan en `analysis/spec04`, ignorados por Git.

Resultado del 1 de noviembre de 2026: build aprobado y suite conjunta de 13 grupos de comprobaciones aprobada. En navegador se probaron tres cuentas reales, solicitud/aprobación, mensajes únicos, presencia con dos pestañas, escritura, reacciones, lecturas, respuestas, desconexión, reconexión, moderación, expulsión, móvil de 390 px, movimiento reducido y ausencia de diálogos nativos. No se sustituyen respuestas de negocio por mocks.

La suite conjunta se repitió después de adaptar el arranque: los 13 grupos volvieron a pasar contra PostgreSQL 16.15 nativo en Windows, sin necesitar contenedores.

## Coordinación con el equipo

Las tareas 4.1–4.4 corresponden a SPEC-04. El motor de moderación, las notificaciones de plataforma y las funcionalidades de las otras SPEC siguen siendo responsabilidad de sus módulos. El bridge `chat:message_hidden` está preparado; no implica que SPEC-06 esté terminada. No se incorporan adjuntos, encuestas, mensajes privados, edición ni mensajes fijados.

La entrega se ejecuta directamente con Node y PostgreSQL: esta rama retira `Dockerfile`, `.dockerignore` y el `nginx.conf` que solo utilizaba aquella imagen. No incorpora infraestructura de contenedores. El backend base tiene dos pendientes de integración documentados en su guía: lock incompleto para `npm ci` y generación de rutas absolutas de Swagger en Windows. La ejecución local utiliza los comandos alternativos comprobados. Las ramas requieren revisión e integración del equipo antes de desplegarse; subirlas no modifica main.
