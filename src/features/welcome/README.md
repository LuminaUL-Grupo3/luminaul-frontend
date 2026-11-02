# Presentación pública e identidad de LuminaUL

La presentación, el logo y el aspecto del acceso fueron solicitados expresamente además del alcance original de grupos y chat. La primera entrega se integró en main mediante el PR #26; `SPEC04-ajustes-integracion-final` contiene únicamente los ajustes posteriores para revisión del equipo.

## Recorrido

- `/`: presentación pública para visitantes; conserva el feed dentro de Layout cuando existe una sesión.
- `/nosotros`: presentación disponible también para usuarios autenticados. Acepta los enlaces `#como-funciona`, `#proposito` y `#preguntas`.
- `/login`, `/registro`, `/verificar`, `/recuperar`, `/restablecer`: mantienen los formularios, validadores y servicios de SPEC-01 con un marco visual nuevo.
- Las rutas privadas mantienen su protección. El cierre de sesión del layout utiliza el diálogo del equipo y, al confirmar, vuelve a la presentación.

## Contenido y diseño

La propuesta parte del propósito, alcance y Product Vision Board del informe de Software I: conectar estudiantes de la Universidad de Lima, compartir conocimientos, facilitar asesorías y grupos de estudio, y coordinar con flexibilidad. Misión, visión, objetivo y valores son una redacción de presentación basada en esa propuesta; no se presentan como citas textuales del informe.

Se respeta que la plataforma no procesa pagos ni realiza reservas oficiales de cubículos. Las vistas de ejemplo explican situaciones de uso; no muestran contadores, testimonios ni mensajes atribuidos a usuarios reales. No se promete que SPEC-05/06/07 esté terminada.

El logo vectorial representa un libro abierto y un punto de luz, por el significado de LuminaUL descrito en Software I. `Brand.tsx` comparte el símbolo y la palabra en presentación, acceso y cabecera privada. `public/favicon.svg` utiliza el mismo emblema. No se usa el escudo oficial de la universidad. Las pantallas se cargan por dominio con `React.lazy` y `Suspense`, para que la presentación no descargue todos los módulos privados al entrar.

La presentación combina naranja, tonos crema y verde, titulares Space Grotesk y acentos Instrument Serif. Las fuentes se alojan en `public/fonts/`, con las licencias OFL de sus autores. El texto del resto de las pantallas conserva su tipografía del equipo. `welcome.css` limita los estilos de la presentación; `auth.css` los limita al marco `.auth-refresh`.

La portada utiliza una fotografía real del edificio F1 y los jardines del campus de la Universidad de Lima, publicada en su [página oficial del campus](https://www.ulima.edu.pe/campus). Archivo local: `public/media/campus-ulima.webp` (1860 × 900, aproximadamente 319 KiB), conservado sin alteraciones visuales. [Archivo de origen](https://www.ulima.edu.pe/sites/default/files/styles/webp/public/hub/banner/Adaptaci%C3%B3n-Im%C3%A1genes-Web-Ulima-11.jpg.webp?itok=uqC4qAYS). Crédito: Universidad de Lima; los derechos corresponden a su titular, sin atribuirle una licencia abierta ni un respaldo institucional a LuminaUL. La imagen enlaza a la fuente en su pie. Por solicitud del usuario, se alterna con `public/media/estudio-en-comunidad.webp`, la ilustración de estudiantes ya existente (1536 × 1024); esta segunda imagen representa un campus genérico y no se atribuye a la universidad. El carrusel cambia cada tres segundos mediante un fundido de 800 ms, permite pausar o elegir una foto y detiene el avance automático con movimiento reducido. El crédito de la universidad aparece solo cuando se muestra su fotografía. **Los formularios de acceso, registro y recuperación no incluyen fotografías ni paneles promocionales.**

## Interacciones y accesibilidad

- Pestañas con roles y relaciones accesibles, flechas, Inicio y Fin.
- Menú móvil con `aria-expanded`, enlaces funcionales y cierre mediante Escape.
- FAQ desplegable con controles HTML operables por teclado.
- Enlaces de acceso, registro, propósito y retorno a la comunidad.
- Animación de entrada de secciones, tarjetas y botones; movimiento reducido respetado.
- Validaciones, estados y confirmaciones dentro de la interfaz. No se usa `window.alert`, `window.confirm` ni `window.prompt`.
- Imágenes con texto alternativo, fuentes locales y disposición comprobada a 320, 390, 768 y 1440 px.

## Pruebas realizadas

La suite real compartida con SPEC-04 incluye cuatro grupos de comprobaciones de presentación/acceso: raíz pública y contenido, interacción por teclado y móvil, registro + OTP + login, y cierre de sesión con cancelación y protección de rutas. Se añade una comprobación de integración de reseñas con el historial de grupos del main actualizado. No se reemplazan respuestas de negocio por mocks. El correo y el usuario de registro son fixtures aleatorios exclusivos de `luminaul_spec04_test`, eliminados al finalizar junto con los grupos y la reseña de prueba.

Resultado final del 1 de noviembre de 2026: build del frontend y compilación del backend aprobados, suite conjunta de 18 grupos de comprobaciones aprobada y 17 pruebas de SPEC-05 del equipo aprobadas. La suite de autenticación/publicaciones del backend pasó sus 22 pruebas durante la integración. Los módulos privados se cargan por separado y el build ya no emite el aviso de un único bloque superior a 500 kB.

Para comprobar también el frontend compilado, ejecutar `npm run build` en frontend y, antes del runner, establecer `SPEC04_PREVIEW=1`. El runner servirá `dist` con Vite Preview en 5176. El corte y la restauración de red de la prueba se realizan desde Playwright sobre la conexión real, reenviando sus paquetes al backend; no se importa un archivo de desarrollo desde la página ni se exponen funciones internas de prueba.

El runner obtiene el código OTP emitido por SPEC-01 leyendo únicamente esa base local de test; no hay un endpoint nuevo que revele códigos ni una excepción de autenticación para la demostración. **El transporte de correo de main sigue siendo `ConsoleMailSender`**: las entregas reales de email requieren el adaptador de correo del equipo de SPEC-01. En local, sus códigos se consultan en la consola del backend; las cuentas de demostración ya están verificadas.

Las capturas y resultados se guardan en `analysis/spec04/` y no se publican en el commit. Ver la guía del chat para preparar PostgreSQL nativo y ejecutar el runner. Las pruebas existentes de frontend se ejecutan con el backend activo; por ejemplo, para esta copia local:

```powershell
$env:BACKEND_URL='http://127.0.0.1:8004'
$env:TEST_EMAIL='spec04.lider@aloe.ulima.edu.pe'
$env:TEST_PASSWORD='LuminaSpec04!2026'
npm test
```

Sin `TEST_EMAIL` y `TEST_PASSWORD`, la suite HTTP omite las comprobaciones positivas que necesitan una cuenta, manteniendo las comprobaciones públicas y negativas. Se corrigieron las expectativas antiguas de acceso anónimo y los UUID inválidos, sin debilitar permisos de la aplicación. Con las credenciales locales anteriores pasan las 30 comprobaciones unitarias y 14 HTTP de esa suite.

## Base integrada

El main inicial ya contenía SPEC-01, SPEC-02 y SPEC-03. Se verificaron los PR fusionados de SPEC-03: frontend #17 y backend #6. Además, se incorporaron los ajustes publicados por el equipo: frontend `859515b` cambia la eliminación de cuenta a `/auth/me`; backend `415de10` conserva `/auth/me` y admite el alias `/auth/account`.

Mientras se preparaba esta revisión, el equipo fusionó también SPEC-05 y los ajustes de SPEC-03: frontend main `1da721f7528e1320051d633efd32bc19354d27e6` (PR #23 y #24), backend main `25df6c06882a75a148b0f4921036b8766aeac2d4` (PR #11 y #12). Esos main se incorporaron mediante merge a SPEC-04, preservando los módulos y autorías del equipo. La prueba adicional comprueba publicación, consulta, permisos y borrado lógico de una reseña tras una expulsión de grupo. No se reimplementa SPEC-05 y se prepara un PR de SPEC-04 para revisión.

## Revisión final

La revisión posterior al PR #26 parte del frontend main 1d8539f y del backend main 3a9d545, que incluye la reorganización modular de Lau. SPEC-04 conserva sus contratos y reutiliza el único bus de eventos registrado por main. La portada utiliza la fotografía real de Ulima con enlace de crédito; el acceso y registro permanecen sin fotos. Los ajustes complementarios se entregan en PR para revisión, sin fusionarlos automáticamente.
