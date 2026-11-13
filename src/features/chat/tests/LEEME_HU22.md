# Verificación de SPEC04 en navegador

La rama SPEC04-hu22-fluidez-pruebas parte del main 9fbd075. Los cambios productivos se limitan a features/chat y ajustes compartidos de presentación en styles.css. Se conservan rutas, contratos y dependencias.

Con backend y frontend locales activos, ejecutar desde el frontend:

```powershell
$env:HU22_WEB_URL='http://localhost:5190'
$env:HU22_ARTIFACT_DIR='RUTA_DE_EVIDENCIAS'
node src/features/chat/tests/hu22.browser.mjs
```

La prueba requiere las cuentas locales lider.prueba, usuario.prueba y solicitante.prueba, con dominio @aloe.ulima.edu.pe. HU22_PASSWORD permite indicar su contraseña fuera de la interfaz. El script crea un grupo de prueba mediante la API, no borra grupos existentes y deja el escenario disponible para revisión. Solo permite un destino localhost. No usar cuentas reales.

Se verificaron 15 recorridos: búsqueda y filtro, aceptación y notificación personal, rechazo, estado vacío, chat entre sesiones, conservación del siguiente borrador ante ACK tardío, aislamiento entre salas ante ACK tardío, persistencia, reacción/respuesta y diseño móvil de grupos, perfil, horario, reseñas, moderación y publicaciones.

El servidor y PostgreSQL son reales. Playwright retiene de forma controlada únicamente el ACK de los dos casos asíncronos indicados. Esa retención es parte del test; no hay rutas de depuración ni demoras artificiales en producción. Las capturas y el resultado se escriben en HU22_ARTIFACT_DIR. El resumen está en evidence/hu22-browser.json.

La presentación separa RequestsPage, JoinRequestCard y useJoinRequestDecision. El chat proyecta la bandeja con eventos confirmados y agrupa la actualización de contadores durante 250ms, sin cambiar la autoridad del servidor sobre lecturas. Los resultados no representan una auditoría completa de las demás SPEC.
