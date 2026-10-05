# Implementación de Software II

LuminaUL conecta estudiantes de la Universidad de Lima mediante publicaciones de texto, grupos, chat, perfiles, horarios y reseñas. La moderación y la administración gestionan reportes y apelaciones.

Frontend React y backend NestJS del equipo están escritos en TypeScript. El backend separa Controller → Service → Repository, con inyección de dependencias. La integración de correo usa el contrato `MailDelivery` y el adaptador SMTP; perfiles y horarios usan TypeORM y un componente de almacenamiento de fotos. El frontend comparte cliente HTTP, formularios, avisos y confirmaciones accesibles con diseño naranja y movimiento reducido.


Están conectadas las solicitudes, login/logout, registro/verificación/recuperación, perfiles, horarios y reseñas. Chat, notificaciones, moderación, eliminación de cuenta y administración completa requieren nuevos endpoints del equipo. Las pruebas cubren contratos y escenarios concretos; no certifican todas las historias ni todos los patrones del sílabo.

La rama `feature/robert-integracion-cuentas-perfil` conserva main como ancestro y permite revisar esta integración sin fusionarla con main. Consulta `INTEGRACION_ROBERT.md` para arranque, contratos y pruebas.
