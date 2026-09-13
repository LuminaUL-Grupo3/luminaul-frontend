# Implementación de Software II

LuminaUL conecta estudiantes de la Universidad de Lima mediante publicaciones de texto, grupos, chat, perfiles, horarios y reseñas. La moderación y la administración gestionan reportes y apelaciones.

Frontend React y backend NestJS están escritos en TypeScript estricto. El backend separa controladores, servicios, políticas y DAO; utiliza contratos de correo, moderación, almacenamiento y base de datos con inyección de dependencias. Strategy, Adapter y eventos internos tienen implementaciones concretas. El frontend comparte cliente HTTP, formularios, avisos y confirmaciones accesibles con diseño naranja y movimiento reducido.

Esta migración se preparó con asistencia de IA a solicitud del equipo. El código y sus decisiones deben revisarse y sustentarse. No hay textos de asistencia de IA en las pantallas del producto. La existencia de módulos para las 38 historias no certifica automáticamente sus 100 criterios ni la aprobación del curso.

Decisiones a contrastar con el backlog: anonimización de cuenta y conservación de mensajes en HU 3.6; reglas locales de moderación en HU 6.2; límites de historial y ausencia de despliegue productivo. Las pruebas cubren contratos y escenarios concretos, no toda combinación posible.

Estas ramas conservan main como ancestro y proponen la migración completa para revisión del equipo. No se ha fusionado la migración en main.
