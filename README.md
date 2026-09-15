# Mis XV Años · Laura Trujillo

Invitación digital interactiva. **HTML5, CSS3 y JavaScript ES6+ puros** — sin
frameworks, sin bundlers, sin dependencias que instalar.

Se abre con doble clic en `index.html` desde un servidor estático y se publica
tal cual en Vercel, Netlify, GitHub Pages o cualquier hosting estático.

---

## 1 · Lo único que tienes que editar

Todo el contenido vive en **`js/config.js`**. No hace falta tocar el HTML, el
CSS ni el JavaScript.

Los campos en `null` están **pendientes**: la invitación los muestra como
«Por confirmar» de forma elegante y esconde los botones que aún no podrían
funcionar. En cuanto los rellenes, esa parte se activa sola.

### Pendientes de confirmar

| Campo en `js/config.js` | Qué es | Estado |
|---|---|---|
| `event.date` | Fecha y hora exactas | ⬜ |
| `parents.father` | Nombre del padre | ⬜ |
| `parents.mother` | Nombre de la madre | ⬜ |
| `venue.name` | Nombre del salón | ⬜ |
| `venue.address` | Dirección | ⬜ |
| `venue.mapsUrl` | Enlace de Google Maps | ⬜ |
| `whatsapp.number` | Número para confirmar | ⬜ |
| `music.title` | Nombre de la canción | ⬜ |

### La fecha

`event.date` es la **única fuente real** de la fecha. El día de la semana, el
mes, el año y la hora se calculan solos con `Intl.DateTimeFormat` en
`es-CO` / `America/Bogota`. Nunca se escriben a mano.

```js
date: '2026-11-28T19:00:00-05:00',   // ISO 8601 con el -05:00 de Colombia
```

> **Ojo con la referencia de Canva.** El diseño muestra «25 de noviembre de
> 2026 · sábado», pero el **25/11/2026 cae miércoles**. El sábado más cercano
> es el **28**. Confirma cuál de los dos es el correcto: la web calculará el
> día de la semana automáticamente y siempre dirá la verdad.

### El teléfono

Formato internacional, solo dígitos:

```js
number: '573208107990',    // 57 = Colombia, sin +, sin espacios
```

El enlace `https://wa.me/...` se arma en JavaScript; el número no aparece
escrito en el HTML.

---

## 2 · Fotografías

Se colocan en `assets/images/` con los nombres que indica
`assets/images/LEEME.txt`. Mientras no existan, cada marco muestra un
elegante espacio de espera — nunca una imagen rota.

- Formato **WebP** (o AVIF), calidad 80.
- `hero.webp` en vertical, ~1200 × 1600 px.
- El resto, ~1000 px de lado mayor.
- Menos de 300 KB cada una. Conviértelas gratis en <https://squoosh.app>.

Si una cara queda cortada, ajusta el encuadre sin tocar la imagen:

```js
hero: { src: '...', position: '50% 25%' }   // sube el encuadre
```

---

## 3 · Música

Coloca la canción en `assets/audio/cancion.mp3` (menos de 3 MB, recortada a
1–2 minutos; se reproduce en bucle).

El control flotante **solo aparece si el archivo existe de verdad**. Si falta,
se retira en silencio y la invitación funciona igual.

La música nunca suena antes de que la persona pulse «Abrir invitación», como
exigen los navegadores móviles.

---

## 4 · Publicar

No hay nada que compilar. Sube la carpeta entera.

- **Vercel** — `vercel` en la carpeta, o arrastra la carpeta en vercel.com/new.
- **Netlify** — arrastra la carpeta a app.netlify.com/drop.
- **GitHub Pages** — sube el repo y activa Pages sobre la rama `main`.

### Un último paso antes de compartir por WhatsApp

En `index.html`, cambia las dos rutas de la imagen de vista previa por su
versión **absoluta** con tu dominio real:

```html
<meta property="og:image"   content="https://TU-DOMINIO/og-image.jpg">
<meta name="twitter:image"  content="https://TU-DOMINIO/og-image.jpg">
```

WhatsApp necesita la URL completa para mostrar la tarjeta con la foto.
Puedes comprobar cómo se verá en <https://www.opengraph.xyz>.

---

## 5 · Estructura

```
/
├── index.html          Marcado semántico + biblioteca de ornamentos SVG
├── css/styles.css      Todos los estilos (mobile first)
├── js/config.js        ← LOS DATOS. Lo único que se edita.
├── js/app.js           Lógica: fecha, cuenta regresiva, galería, enlaces…
├── assets/images/      Fotografías
├── assets/audio/       cancion.mp3
├── assets/icons/       (libre)
├── favicon.svg
└── og-image.jpg        Vista previa 1200×630 para WhatsApp
```

Separación estricta: **datos** en `config.js`, **lógica** en `app.js`,
**estilos** en `styles.css`, **marcado** en `index.html`.

---

## 6 · Detalles que ya están resueltos

- Portada a `100svh` con transición de apertura de ~900 ms.
- Cuenta regresiva al segundo, sin valores negativos; al llegar a cero muestra
  «¡Hoy es el gran día!».
- Galería táctil con `scroll-snap` nativo — sin librerías.
- Botón flotante de confirmación que aparece al salir de la portada y se
  esconde al llegar a la sección de RSVP.
- Google Calendar y descarga `.ics` generada en el navegador con `Blob`,
  sin servidor.
- Animaciones con `IntersectionObserver`; se desactivan por completo con
  `prefers-reduced-motion: reduce`.
- Respeta `env(safe-area-inset-*)`, áreas táctiles de 44 px y contraste AA.
- Sin desbordamiento horizontal en ningún ancho.
# INVITACION_LAURA_CAMILA
