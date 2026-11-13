# Verificación de SPEC04 en navegador

La revisión parte del main 9fbd075 y se publica en SPEC04-front-diseno-profesional. Incluye los cambios de HU 2.2 y del chat de SPEC04-hu22-fluidez-pruebas, además de presentación clara en el layout, el feed y el diálogo de confirmación. Se conservan rutas, contratos y dependencias.

Con backend y frontend locales activos, ejecutar desde el frontend:

```powershell
$env:HU22_WEB_URL='http://localhost:5190'
$env:HU22_ARTIFACT_DIR='RUTA_DE_EVIDENCIAS'
node src/features/chat/tests/hu22.browser.mjs
```

La prueba requiere las cuentas locales lider.prueba, usuario.prueba y solicitante.prueba, con dominio @aloe.ulima.edu.pe. HU22_PASSWORD permite indicar su contraseña fuera de la interfaz. El script crea un grupo de prueba mediante la API, no borra grupos existentes y deja el escenario disponible para revisión. Solo permite un destino localhost. No usar cuentas reales.

Se verificaron 17 recorridos: contraste y cancelación del cierre de sesión, movimiento reducido, búsqueda y filtro, aceptación y notificación personal, rechazo, estado vacío, chat entre sesiones, conservación del siguiente borrador ante ACK tardío, aislamiento entre salas ante ACK tardío, persistencia, reacción/respuesta y diseño móvil de grupos, perfil, horario, reseñas, moderación y publicaciones. La aceptación comprueba además que dos clics inmediatos produzcan una sola petición y que el botón quede deshabilitado hasta confirmar el servidor.

El servidor y PostgreSQL son reales. Playwright retiene los ACK de los dos casos asíncronos y la respuesta HTTP de aceptación para observar el estado pendiente. La API sigue procesando la decisión real. Estas retenciones pertenecen al test; no hay rutas de depuración ni demoras artificiales en producción. Las capturas y el resultado se escriben en HU22_ARTIFACT_DIR. El resumen está en evidence/hu22-browser.json.

La presentación separa RequestsPage, JoinRequestCard y useJoinRequestDecision. El chat proyecta la bandeja con eventos confirmados y agrupa la actualización de contadores durante 250ms, sin cambiar la autoridad del servidor sobre lecturas. Los resultados no representan una auditoría completa de las demás SPEC.
