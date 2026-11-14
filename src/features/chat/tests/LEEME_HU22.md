# Verificación de SPEC04 en navegador

La revisión parte del main 9fbd075 y se publica en SPEC04-interfaz-avisos-tiempo-real. Incluye HU 2.2, chat, disponibilidad y notificaciones en vivo. El backend correspondiente es SPEC04-notificaciones-tiempo-real. Se conservan rutas, contratos y dependencias.

Con backend y frontend locales activos, ejecutar desde el frontend:

```powershell
$env:HU22_WEB_URL='http://localhost:5190'
$env:HU22_ARTIFACT_DIR='RUTA_DE_EVIDENCIAS'
node src/features/chat/tests/hu22.browser.mjs
```

La prueba requiere las cuentas locales lider.prueba, usuario.prueba y solicitante.prueba, con dominio @aloe.ulima.edu.pe. HU22_PASSWORD permite indicar su contraseña fuera de la interfaz. El script crea un grupo de prueba mediante la API, no borra grupos existentes y deja el escenario disponible para revisión. Solo permite un destino localhost. No usar cuentas reales.

Se verificaron 25 recorridos: cierre de sesión y movimiento reducido; entrega sin recargar y lectura sincronizada; prioridad y preferencia de pop-ups; temporizador de diez segundos y barra agotada antes de retirar el aviso; ubicación de Disponibilidad en Mi espacio; filtros de publicaciones sin conservar el aviso anterior; búsqueda, aceptación, rechazo y estado vacío de solicitudes; chat entre sesiones, borradores ante ACK tardío, aislamiento entre salas, persistencia, reacción/respuesta, Ver más en mensajes largos y diseño móvil de grupos, perfil, horario, reseñas, moderación y publicaciones. La aceptación comprueba que dos clics inmediatos produzcan una sola petición y que el botón quede deshabilitado hasta confirmar el servidor. Leído aparece a la derecha, debajo de la categoría.

El servidor y PostgreSQL son reales. Playwright retiene los ACK de los dos casos asíncronos y la respuesta HTTP de aceptación para observar el estado pendiente. La API sigue procesando la decisión real. Estas retenciones pertenecen al test; no hay rutas de depuración ni demoras artificiales en producción. Las capturas y el resultado se escriben en HU22_ARTIFACT_DIR. El resumen está en evidence/hu22-browser.json.

La presentación separa RequestsPage, JoinRequestCard y useJoinRequestDecision. El chat proyecta la bandeja con eventos confirmados y agrupa la actualización de contadores durante 250ms, sin cambiar la autoridad del servidor sobre lecturas. Los resultados no representan una auditoría completa de las demás SPEC.

Los avisos de acciones y los de Socket.IO comparten una pila a la derecha. Cada uno dispone de diez segundos y 240 ms para la salida; la X adelanta esa salida. Con movimiento reducido se elimina el desplazamiento y la barra informa el tiempo por pasos. La preferencia se guarda por cuenta en ese navegador; la entrega y el historial no se desactivan. La suspensión obliga a cerrar la sesión independientemente de esa preferencia.
