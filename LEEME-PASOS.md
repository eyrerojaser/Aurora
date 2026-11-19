# Aurora – versión limpia, sin Replit (15 nov 2026)

Esta versión ya no depende de Replit. Funciona en cualquier hosting que pueda
correr una app de Python y tenga una base de datos Postgres.

## Qué necesita el hosting

1. **Correr Python** con el comando del archivo `Procfile` (lo detectan solos la
   mayoría de los hostings). Las librerías están en `requirements.txt`.
2. **Una base de datos Postgres.** Puede estar vacía: la app crea sus tablas sola
   la primera vez que arranca.

## Variables que hay que poner en el hosting

| Variable | Qué es |
| --- | --- |
| `DATABASE_URL` | La dirección de la base de datos Postgres (la da el hosting). |
| `ADMIN_PASSWORD` | La contraseña del panel admin. Elige una nueva. |
| `SESSION_SECRET` | Un texto largo al azar. Mantiene las sesiones abiertas. |
| `APP_URL` | La dirección pública de la app, por ejemplo `https://tu-dominio.com`. |
| `RESEND_API_KEY` | La clave de tu cuenta de Resend (envía el código de acceso y los avisos). |
| `EMAIL_FROM` | El email remitente, de un dominio verificado en Resend. |
| `STRIPE_SECRET_KEY` | La clave secreta de tu cuenta de Stripe. |
| `STRIPE_WEBHOOK_SECRET` | La clave del webhook de Stripe (apunta a `/api/premium/webhook`). |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Claves de las notificaciones. Están en `Aurora-CLAVES-para-el-hosting.txt`, en Descargas. |
| `VAPID_EMAIL` | `mailto:` seguido de tu email de contacto. |
| `PREMIUM_EMAILS` | Opcional. Emails con Premium sin pagar (el tuyo, para probar), separados por coma. |

Sin `DATABASE_URL` la app no guarda nada. Sin `RESEND_API_KEY` y `EMAIL_FROM`
nadie puede entrar, porque el código de acceso llega por email. Sin las de
Stripe no se puede cobrar. Las demás funciones siguen andando.

## Prueba esto antes de avisar a tus clientas

1. Entra a la app con tu nombre y email → debe llegarte un código de 6 dígitos.
2. Abre `/admin/lista-espera` con la contraseña nueva.
3. Voltea algunas Cartas de Poder y guarda una entrada en el diario.

## Qué cambió respecto al zip original

- **Acceso:** código de 6 dígitos por email (15 minutos, 5 intentos). La sesión dura 90 días.
- **Archivos privados:** el servidor solo entrega la interfaz. `server.py`, notas
  y configuración devuelven 404.
- **Admin:** la contraseña solo vive en la variable `ADMIN_PASSWORD`. La lista de
  espera pide login.
- **Lectura de Cartas Españolas:** se quitó de Aurora porque es otra app. Sus
  piezas están en la carpeta `Cartas-Espanolas-piezas`, en Descargas. Las Cartas
  de Poder siguen en Aurora.
- **Sin Replit:** se quitó todo lo que dependía de Replit; la app crea sus tablas
  sola; se añadió `Procfile` y se arregló `requirements.txt`.
- **Premium:** el servidor comprueba el pago antes de guardar en Mi Collage, El Año
  donde Florezco y Calendario de Hábitos.
- **Fotos:** se reducen a 1280 px antes de guardarse; tope de 20 MB por envío.
- **Notificaciones:** un solo service worker (antes eran dos y se pisaban). Los
  recordatorios avisan mientras Aurora está abierta.
- **Mensajes de Apoyo:** el antiguo "AI Coach" cambió de nombre; no usa IA.
- **Se quitó del proyecto:** `.git`, `aurora_backup.sql` y las capturas de
  `attached_assets` (se conservan las 18 imágenes de adorno que la app usa).

## Limpieza del 15 nov (lo roto y lo repetido)

- **Quitado por estar roto:** "Buscar fotos online" (diario, collage y tablero),
  la página del mug NFC, el formulario de opinión y los bloques de datos y
  estadísticas de Mi Progreso. Todos llamaban a partes del servidor que no existen.
- **Quitado por repetido o sin uso:** Hábitos Inteligentes y el sistema viejo de
  hábitos (queda el Calendario de Hábitos), la sección "Collage Premium" (queda
  Mi Collage), el reproductor de música, `admin.html`, `sw.js` y los archivos de Replit.
- **Arreglado:** las metas creadas ahora sí aparecen (antes se guardaban pero
  no se mostraban); las gratitudes vuelven a aparecer al recargar.
- Lo quitado está en `Descargas/_to_delete/quitado-de-aurora`, por si acaso.

## Importante: qué se guarda en la nube y qué no

- **En la nube (servidor):** cuenta, metas, Mi Collage, El Año donde Florezco,
  Calendario de Hábitos y Premium.
- **Solo en el teléfono de cada usuaria:** el diario, las gratitudes, los
  rituales, las afirmaciones y las cartas reveladas. Si cambia de teléfono o
  borra los datos del navegador, los pierde.
