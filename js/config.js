/* ============================================================================
   CONFIG — Única fuente de verdad de la invitación
   ----------------------------------------------------------------------------
   Edita SOLO este archivo para personalizar el evento.
   No es necesario tocar index.html, styles.css ni app.js.

   Los campos en `null` se consideran PENDIENTES: la invitación los muestra
   como «Por confirmar» de forma elegante y oculta los botones que no podrían
   funcionar (Mapa, WhatsApp, Calendario). En cuanto los completes, la
   sección correspondiente se activa sola.
   ========================================================================== */

const EVENT_CONFIG = {

  /* ── Quinceañera ─────────────────────────────────────────────────────────
     `quinceanera` es el nombre legal completo (WhatsApp, calendario, alt de
     fotos). `displayName` es la forma corta que se usa SOLO en la portada
     y en la sección de presentación, por jerarquía visual.               */
  quinceanera: 'Laura Camila Trujillo Acosta',
  displayName: 'Laura Camila',

  /* ── Padres ──────────────────────────────────────────────────────────── */
  parents: {
    father: 'Ederson Trujillo',
    mother: 'Sandra Milena Acosta'
  },

  /* ── Fecha y hora ────────────────────────────────────────────────────────
     `date` es la ÚNICA fuente real de la fecha.
     El día de la semana, el mes, el año y la hora se calculan solos
     con Intl.DateTimeFormat — nunca se escriben a mano.

     Formato ISO 8601 con offset de Colombia (-05:00). Ejemplo:
       '2026-11-14T19:00:00-05:00'  →  sábado 14 de noviembre de 2026, 7:00 p. m. */
  event: {
    date: '2026-11-14T19:00:00-05:00',
    timezone: 'America/Bogota',
    locale: 'es-CO',
    durationHours: 7               // usado para el calendario (.ics / Google) — termina 2:00 a. m.
  },

  /* ── Lugar ─────────────────────────────────────────────────────────────
     `mapsUrl` se deja en null a propósito: app.js arma automáticamente el
     enlace de Google Maps a partir de `name` + `address` (ver buildMapsLink
     en js/app.js), así que no hace falta pegar una URL fija a mano.      */
  venue: {
    name: 'Shekinah Salón Celeste',
    address: 'Av. Cra. 30 # 2-56',
    mapsUrl: null
  },

  /* ── Confirmación por WhatsApp ───────────────────────────────────────────
     `number` en formato internacional, solo dígitos (57 = Colombia).       */
  whatsapp: {
    number: '573208107990',
    message: '¡Hola! ✨ Confirmo mi asistencia a los XV años de Laura Camila Trujillo Acosta.\n\nNombre:\nNúmero de personas que asistirán:'
  },

  /* ── Aforo estimado ────────────────────────────────────────────────────
     Dato operativo para logística del salón. NO se muestra a los
     invitados en ninguna parte de la invitación.                        */
  estimatedGuests: 100,

  /* ── Código de vestimenta ────────────────────────────────────────────── */
  dressCode: {
    type: 'Formal',
    note: 'Se agradece evitar prendas en tonos champán o azul claro, colores reservados para la quinceañera.',
    reservedColors: [
      { name: 'Champán', hex: '#E3CBA1' },
      { name: 'Azul claro', hex: '#A9CBE3' }
    ]
  },

  /* ── Regalos ─────────────────────────────────────────────────────────────
     `qrImage: null` → no se muestra ningún espacio ni marco de QR.         */
  gifts: {
    type: 'cash-envelope',
    title: 'Lluvia de sobres',
    qrImage: null,
    qrCaption: null
  },

  /* ── Música ──────────────────────────────────────────────────────────────
     Coloca el archivo en assets/audio/cancion.mp3.
     Si no existe, el control de música se oculta y nada se rompe.          */
  music: {
    src: './assets/audio/cancion.mp3',
    title: null,     // p. ej. 'A Thousand Years'
    artist: null,    // p. ej. 'Christina Perri'
    volume: 0.45
  },

  /* ── Fotografías ─────────────────────────────────────────────────────────
     `position` controla object-position (encuadre) de cada foto.
     Deja `src` vacío y verás un marco de espera elegante, no una imagen rota. */
  photos: {
    hero: {
      src: './assets/images/hero.webp',
      alt: 'Laura Camila Trujillo Acosta en su sesión de XV años, junto a un caballo',
      position: '30% 38%'
    },
    photo1: {
      src: './assets/images/foto-01.webp',
      alt: 'Laura Camila Trujillo Acosta oliendo flores en el jardín',
      position: '55% 35%'
    },
    photo2: {
      src: './assets/images/foto-02.webp',
      alt: 'Laura Camila Trujillo Acosta sonriendo con su corona de XV años',
      position: '40% 28%'
    },
    photo3: {
      src: './assets/images/foto-03.webp',
      alt: 'Laura Camila Trujillo Acosta junto a un caballo con montura',
      position: '60% 32%'
    },
    photo4: {
      src: './assets/images/foto-04.webp',
      alt: 'Laura Camila Trujillo Acosta junto a un caballo blanco en el campo',
      position: '44% 38%'
    },
    intro: {
      src: './assets/images/galeria-01.webp',
      alt: 'Laura Camila Trujillo Acosta junto a la fuente del jardín',
      position: '52% 20%'
    }
  },

  /* ── Galería deslizable (carrusel táctil) ────────────────────────────────
     Añade o quita elementos libremente. La fotografía de la fuente se
     reubicó junto a la presentación inicial (ver photos.intro).            */
  gallery: [],

  /* ── Itinerario ──────────────────────────────────────────────────────────
     `icon` acepta: recepcion, entrada, cena, vals, brindis, baile, despedida. */
  itinerary: [
    { time: '7:00 p. m.',  title: 'Recepción de invitados' },
    { time: '7:45 p. m.',  title: 'Entrada de la quinceañera' },
    { time: '8:15 p. m.',  title: 'Cena' },
    { time: '9:00 p. m.',  title: 'Vals' },
    { time: '9:30 p. m.',  title: 'Brindis' },
    { time: '10:00 p. m.', title: 'Baile' },
    { time: '2:00 a. m.',  title: 'Despedida' }
  ],

  /* ── Textos ──────────────────────────────────────────────────────────── */
  copy: {
    quote: 'Hay momentos inolvidables que se atesoran en el corazón para siempre, por esa razón quiero que compartas conmigo este día tan especial.',
    parentsIntro: 'Con la bendición de Dios y el amor de mis padres, te invito a celebrar con alegría este momento tan especial.',
    giftsIntro: 'Tu compañía en este día tan especial es nuestro mejor regalo. Pero si deseas tener un detalle conmigo, puedes hacerlo de la siguiente manera:',
    rsvpIntro: 'Por favor confirma tu asistencia. Será muy especial poder compartir esta noche contigo.',
    closing: 'Esperamos contar con tu presencia',
    signature: '¡Te esperamos!'
  }
};
