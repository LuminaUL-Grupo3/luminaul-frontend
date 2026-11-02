# Presentación pública e identidad de LuminaUL

Esta ampliación se incorpora en `SPEC04-grupos-chat-tiempo-real` para revisión del equipo. No abre un pull request ni modifica main. La presentación, el logo y el aspecto del acceso fueron solicitados expresamente además del alcance original de grupos y chat.

## Recorrido

- `/`: presentación pública para visitantes; conserva el feed dentro de Layout cuando existe una sesión.
- `/nosotros`: presentación disponible también para usuarios autenticados. Acepta los enlaces `#como-funciona`, `#proposito` y `#preguntas`.
- `/login`, `/registro`, `/verificar`, `/recuperar`, `/restablecer`: mantienen los formularios, validadores y servicios de SPEC-01 con un marco visual nuevo.
- Las rutas privadas mantienen su protección. El cierre de sesión del layout utiliza el diálogo del equipo y, al confirmar, vuelve a la presentación.

## Contenido y diseño

La propuesta parte del propósito, alcance y Product Vision Board del informe de Software I: conectar estudiantes de la Universidad de Lima, compartir conocimientos, facilitar asesorías y grupos de estudio, y coordinar con flexibilidad. Misión, visión, objetivo y valores son una redacción de presentación basada en esa propuesta; no se presentan como citas textuales del informe.

Se respeta que la plataforma no procesa pagos ni realiza reservas oficiales de cubículos. Las vistas de ejemplo explican situaciones de uso; no muestran contadores, testimonios ni mensajes atribuidos a usuarios reales. No se promete que SPEC-05/06/07 esté terminada.

El logo vectorial representa un libro abierto y un punto de luz, por el significado de LuminaUL descrito en Software I. `Brand.tsx` comparte el símbolo y la palabra en presentación, acceso y cabecera privada. `public/favicon.svg` utiliza el mismo emblema. No se usa el escudo oficial de la universidad.

La presentación combina naranja, tonos crema y verde, titulares Space Grotesk y acentos Instrument Serif. Las fuentes se alojan en `public/fonts/`, con las licencias OFL de sus autores. El texto del resto de las pantallas conserva su tipografía del equipo. `welcome.css` limita los estilos de la presentación; `auth.css` los limita al marco `.auth-refresh`.

La imagen de estudio se utiliza de forma ilustrativa y representa un campus genérico. Archivo consumido por la web: `public/media/estudio-en-comunidad.webp` (1536 × 1024, aproximadamente 202 KiB). Se conserva el contenido de la imagen original y se cambia únicamente su codificación para reducir la descarga. El archivo de partida se obtuvo con la herramienta integrada de imágenes; no se incorporan dependencias de generación al proyecto.

## Interacciones y accesibilidad

- Pestañas con roles y relaciones accesibles, flechas, Inicio y Fin.
- Menú móvil con `aria-expanded`, enlaces funcionales y cierre mediante Escape.
- FAQ desplegable con controles HTML operables por teclado.
- Enlaces de acceso, registro, propósito y retorno a la comunidad.
- Animación de entrada de secciones, tarjetas y botones; movimiento reducido respetado.
- Validaciones, estados y confirmaciones dentro de la interfaz. No se usa `window.alert`, `window.confirm` ni `window.prompt`.
- Imágenes con texto alternativo, fuentes locales y disposición comprobada a 320, 390, 768 y 1440 px.

## Pruebas realizadas

La suite real compartida con SPEC-04 ahora incluye cuatro grupos de comprobaciones de presentación/acceso: raíz pública y contenido, interacción por teclado y móvil, registro + OTP + login, y cierre de sesión con cancelación y protección de rutas. El resultado conjunto es de 17 grupos aprobados. No se reemplazan respuestas de negocio por mocks. El correo y el usuario de registro son fixtures aleatorios exclusivos de `luminaul_spec04_test`, eliminados al finalizar.

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

El main revisado ya contenía SPEC-01, SPEC-02 y SPEC-03. Se verificaron los PR fusionados de SPEC-03: frontend #17 y backend #6. Además, se incorporaron los ajustes posteriores publicados por el equipo: frontend `859515b` cambia la eliminación de cuenta a `/auth/me`; backend `415de10` conserva `/auth/me` y admite el alias `/auth/account`. Se preservan las autorías originales de esos commits mediante merge dentro de SPEC-04. No se integra la rama pendiente de SPEC-05 ni se crea un PR de SPEC-04.

## Prompt de la imagen

Herramienta: generación integrada `image_gen`, imagen nueva, fondo opaco. Prompt final:

Use case: photorealistic-natural. Asset type: editorial hero photograph for LuminaUL, a student collaboration website from a university software project in Lima, Peru. Primary request: A beautiful candid scene of three Latin American university students in their early twenties learning together around a laptop and open notebooks at an outdoor wooden study table in a contemporary sunlit campus courtyard. One student is explaining a diagram in a notebook, the others listen and smile naturally; believable hands and relaxed poses. Scene: warm pale concrete architecture softly out of focus, a small amount of green foliage, a calm urban campus atmosphere; this is a fictional illustrative campus, not a photograph of any named university. Style: premium natural editorial photography, gentle film texture, true-to-life skin and clothing, no excessive retouching. Composition: landscape 3:2 frame, medium wide shot, students grouped centrally with comfortable headroom, enough table visible in lower third; faces and hands well composed for a website crop. Lighting: soft warm daylight, bright cream and apricot highlights, subtle terracotta/orange clothing accents, deep natural green details, inviting and thoughtful mood. Constraints: image only, no text, no captions, no logos, no visible branded laptop marks, no watermark, no UI, no decorative graphic overlays.
