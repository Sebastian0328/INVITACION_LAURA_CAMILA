/* ============================================================================
   MIS XV AÑOS · LAURA TRUJILLO
   Lógica de la invitación — JavaScript ES6+ sin dependencias
   ----------------------------------------------------------------------------
   Todos los datos provienen de EVENT_CONFIG (js/config.js).
   Este archivo no contiene fechas, nombres, direcciones ni teléfonos.
   ========================================================================== */

(() => {
  'use strict';

  /* ── Utilidades ───────────────────────────────────────────────────────── */

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** Lee una ruta con puntos dentro de EVENT_CONFIG: get('venue.name'). */
  const get = (path, source = EVENT_CONFIG) =>
    path.split('.').reduce((acc, key) => acc?.[key], source);

  /** Un dato está «confirmado» si no es null/undefined ni cadena vacía. */
  const isFilled = (value) =>
    value !== null && value !== undefined && String(value).trim() !== '';

  const pad2 = (n) => String(n).padStart(2, '0');

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Relación de aspecto de cada marco, para reservar espacio y evitar CLS. */
  const FRAME_RATIO = {
    arco:  [750, 1000],
    ovalo: [750, 1000],
    rect:  [800, 1000],
    bleed: [1000, 800]
  };

  /* Secciones donde el stagger aporta; en el resto todo revela a la vez. */
  const STAGGER_SCOPES = ['.section--present', '.section--count', '.closing'];


  /* ── Textos enlazados a la configuración ──────────────────────────────── */

  /**
   * Rellena cada [data-bind] con su valor de EVENT_CONFIG.
   * Si el dato aún no está confirmado usa data-pending; si tampoco existe,
   * oculta el nodo para que nunca se vea un hueco ni un marcador.
   */
  function bindTexts() {
    $$('[data-bind]').forEach((el) => {
      const value = get(el.dataset.bind);

      if (isFilled(value)) {
        el.textContent = value;
        el.removeAttribute('data-is-pending');
        el.hidden = false;
        return;
      }

      const fallback = el.dataset.pending;
      if (isFilled(fallback)) {
        el.textContent = fallback;
        el.setAttribute('data-is-pending', '');
      } else {
        el.textContent = '';
        el.hidden = true;
      }
    });
  }


  /* ── Fotografías ──────────────────────────────────────────────────────── */

  function renderPlaceholder(figure, photo) {
    figure.textContent = '';
    figure.dataset.state = 'empty';
    figure.dispatchEvent(new CustomEvent('photo:change', { bubbles: true }));

    const box = document.createElement('div');
    box.className = 'photo__ph';
    box.innerHTML =
      '<svg viewBox="0 0 52 52" fill="none" stroke="#C98DA0" stroke-width="1.4" aria-hidden="true">' +
      '<circle cx="26" cy="19" r="8.5"/>' +
      '<path d="M10 44C12 32 40 32 42 44"/>' +
      '<path d="M17 13Q26 4 35 13" stroke="#C6A575"/></svg>';

    const label = document.createElement('span');
    label.textContent = photo?.hint || 'Fotografía próximamente';
    box.appendChild(label);

    figure.appendChild(box);
  }

  /**
   * Monta una fotografía dentro de un <figure class="photo">.
   * Si no hay ruta — o la imagen no carga — deja un marco de espera elegante
   * en lugar de una imagen rota.
   */
  function mountPhoto(figure, photo, { eager = false } = {}) {
    if (!figure) return;

    if (!isFilled(photo?.src)) {
      renderPlaceholder(figure, photo);
      return;
    }

    const [w, h] = FRAME_RATIO[figure.dataset.frame] ?? FRAME_RATIO.rect;
    const img = document.createElement('img');

    img.className = 'photo__img';
    img.src = photo.src;
    img.alt = photo.alt ?? '';
    img.width = w;
    img.height = h;
    img.decoding = 'async';
    img.loading = eager ? 'eager' : 'lazy';
    if (eager) img.fetchPriority = 'high';
    if (isFilled(photo.position)) img.style.setProperty('--pos', photo.position);

    img.addEventListener('error', () => renderPlaceholder(figure, photo), { once: true });

    figure.textContent = '';
    figure.dataset.state = 'image';
    figure.appendChild(img);
  }

  function mountAllPhotos() {
    $$('[data-photo]').forEach((figure) => {
      const key = figure.dataset.photo;
      mountPhoto(figure, get(`photos.${key}`), { eager: key === 'hero' });
    });
  }

  /**
   * Sin fotografía de portada, el velo oscuro no tiene sentido:
   * la portada pasa a su versión clara para que siga viéndose intencionada.
   */
  function syncOpeningTheme() {
    const opening = $('#portada');
    const hero = $('.opening__photo');
    if (!opening || !hero) return;
    opening.classList.toggle('opening--empty', hero.dataset.state === 'empty');
  }


  /* ── Itinerario ───────────────────────────────────────────────────────── */

  function buildTimeline() {
    const list = $('#timeline');
    const items = EVENT_CONFIG.itinerary;
    if (!list) return;

    if (!Array.isArray(items) || items.length === 0) {
      list.closest('section')?.setAttribute('hidden', '');
      return;
    }

    const frag = document.createDocumentFragment();

    items.forEach(({ time, title }) => {
      const li = document.createElement('li');
      li.className = 'timeline__item reveal';

      const hour = document.createElement('p');
      hour.className = 'timeline__time';
      hour.textContent = time ?? '';

      const name = document.createElement('p');
      name.className = 'timeline__title';
      name.textContent = title ?? '';

      li.append(hour, name);
      frag.appendChild(li);
    });

    list.appendChild(frag);
  }


  /* ── Galería deslizable ───────────────────────────────────────────────── */

  function buildGallery() {
    const track = $('#carousel');
    const dots = $('#dots');
    const photos = EVENT_CONFIG.gallery;
    if (!track) return;

    if (!Array.isArray(photos) || photos.length === 0) {
      track.closest('section')?.setAttribute('hidden', '');
      return;
    }

    const frag = document.createDocumentFragment();

    photos.forEach((photo, index) => {
      const item = document.createElement('figure');
      item.className = 'carousel__item';

      const frame = document.createElement('div');
      frame.className = 'photo';
      frame.dataset.frame = 'rect';
      mountPhoto(frame, { ...photo, hint: photo.hint ?? `Recuerdo ${index + 1}` });

      item.appendChild(frame);
      frag.appendChild(item);
    });

    track.appendChild(frag);
    buildDots(track, dots);
    enableCarouselKeys(track);
  }

  /** Indicadores de posición, sincronizados sin escuchar el scroll. */
  function buildDots(track, dots) {
    if (!dots) return;

    const items = $$('.carousel__item', track);
    items.forEach(() => {
      const dot = document.createElement('span');
      dot.className = 'dots__dot';
      dots.appendChild(dot);
    });

    const marks = $$('.dots__dot', dots);
    marks[0]?.classList.add('is-active');

    /* Se marca la lámina más visible, no la última en aparecer. */
    const ratios = new Map(items.map((item) => [item, 0]));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => ratios.set(entry.target, entry.intersectionRatio));

        let best = items[0];
        items.forEach((item) => {
          if ((ratios.get(item) ?? 0) > (ratios.get(best) ?? 0)) best = item;
        });

        const index = items.indexOf(best);
        marks.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      },
      { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    items.forEach((item) => observer.observe(item));
  }

  function enableCarouselKeys(track) {
    track.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const step = $('.carousel__item', track)?.offsetWidth ?? 220;
      const gap = 14;
      event.preventDefault();
      track.scrollBy({
        left: event.key === 'ArrowRight' ? step + gap : -(step + gap),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
  }


  /* ── Código de vestimenta y regalos ───────────────────────────────────── */

  function buildSwatches() {
    const list = $('#swatches');
    const colors = get('dressCode.reservedColors');
    if (!list) return;

    if (!Array.isArray(colors) || colors.length === 0) {
      list.hidden = true;
      return;
    }

    colors.forEach((color) => {
      const name = typeof color === 'string' ? color : color?.name;
      const hex = typeof color === 'string' ? null : color?.hex;
      if (!isFilled(name)) return;

      const li = document.createElement('li');
      li.className = 'swatch';

      const chip = document.createElement('span');
      chip.className = 'swatch__chip';
      chip.setAttribute('role', 'img');
      chip.setAttribute('aria-label', `Color reservado: ${name}`);
      if (isFilled(hex)) chip.style.setProperty('--chip', hex);

      const label = document.createElement('span');
      label.className = 'swatch__name';
      label.textContent = name;

      li.append(chip, label);
      list.appendChild(li);
    });
  }

  /** El QR solo existe si hay imagen: si es null no se reserva ningún hueco. */
  function mountGiftsQr() {
    const box = $('#qr');
    const src = get('gifts.qrImage');
    if (!box || !isFilled(src)) return;

    const img = document.createElement('img');
    img.src = src;
    img.alt = get('gifts.qrCaption') || 'Código QR para el regalo';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => { box.hidden = true; }, { once: true });
    box.appendChild(img);

    const caption = get('gifts.qrCaption');
    if (isFilled(caption)) {
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = caption;
      box.appendChild(figcaption);
    }

    box.hidden = false;
  }


  /* ── Fecha · única fuente de verdad ───────────────────────────────────── */

  /**
   * Descompone EVENT_CONFIG.event.date con Intl.DateTimeFormat.
   * El día de la semana NUNCA se escribe a mano: se calcula aquí.
   */
  function readEventDate() {
    const { date, timezone, locale } = EVENT_CONFIG.event;
    if (!isFilled(date)) return null;

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) {
      console.warn('[XV] EVENT_CONFIG.event.date no es una fecha ISO válida:', date);
      return null;
    }

    const tz = timezone || 'America/Bogota';
    const loc = locale || 'es-CO';
    const format = (options) =>
      new Intl.DateTimeFormat(loc, { timeZone: tz, ...options }).format(value);

    return {
      value,
      weekday:  format({ weekday: 'long' }),
      day:      format({ day: 'numeric' }),
      month:    format({ month: 'long' }),
      year:     format({ year: 'numeric' }),
      time:     compactTime(value, tz, loc),
      timeLong: format({ hour: 'numeric', minute: '2-digit', hour12: true }),
      full:     format({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    };
  }

  /** «7 PM» cuando está en punto, «7:30 PM» cuando no. */
  function compactTime(value, timeZone, locale) {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone, hour: 'numeric', minute: '2-digit', hour12: true
    }).formatToParts(value);

    const pick = (type) => parts.find((part) => part.type === type)?.value ?? '';
    const hour = pick('hour');
    const minute = pick('minute');
    const period = pick('dayPeriod').replace(/[.\s ]/g, '').toUpperCase();

    return minute === '00' ? `${hour} ${period}` : `${hour}:${minute} ${period}`;
  }

  function renderDate(event) {
    const card = $('[data-date-card]');
    const pending = $('[data-date-pending]');

    if (!event) {
      $$('[data-date]').forEach((el) => { el.hidden = true; });
      if (card) card.hidden = true;
      if (pending) pending.hidden = false;
      return;
    }

    $$('[data-date]').forEach((el) => {
      const value = event[el.dataset.date];
      if (isFilled(value)) {
        el.textContent = value;
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });

    if (card) card.hidden = false;
    if (pending) pending.hidden = true;
  }


  /* ── Cuenta regresiva ─────────────────────────────────────────────────── */

  function initCountdown(event) {
    const section = $('[data-countdown]');
    if (!section || !event) return;

    section.hidden = false;

    const fields = {
      days:    $('[data-cd="days"]'),
      hours:   $('[data-cd="hours"]'),
      minutes: $('[data-cd="minutes"]'),
      seconds: $('[data-cd="seconds"]')
    };
    const grid = $('.countdown', section);
    const heading = $('.title-sm', section);
    const bigDay = $('[data-cd-today]', section);
    const target = event.value.getTime();

    let timer = null;

    const announceBigDay = () => {
      if (grid) grid.hidden = true;
      if (heading) heading.hidden = true;
      if (bigDay) bigDay.hidden = false;
      if (timer) clearInterval(timer);
      timer = null;
    };

    const tick = () => {
      const remaining = target - Date.now();

      if (remaining <= 0) {
        announceBigDay();
        return;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      fields.days.textContent    = pad2(Math.floor(totalSeconds / 86400));
      fields.hours.textContent   = pad2(Math.floor(totalSeconds / 3600) % 24);
      fields.minutes.textContent = pad2(Math.floor(totalSeconds / 60) % 60);
      fields.seconds.textContent = pad2(totalSeconds % 60);
    };

    tick();
    if (target - Date.now() > 0) timer = setInterval(tick, 1000);

    /* No malgastar ciclos con la pestaña en segundo plano. */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (timer) { clearInterval(timer); timer = null; }
      } else if (!timer && target - Date.now() > 0) {
        tick();
        timer = setInterval(tick, 1000);
      }
    });
  }


  /* ── Enlaces: mapa, WhatsApp y calendario ─────────────────────────────── */

  /**
   * Una acción que todavía no puede funcionar no se muestra apagada:
   * se retira y se explica con una nota breve. Así no queda ningún
   * botón muerto en producción.
   */
  function setPending(action, note, message) {
    if (action) action.hidden = true;
    if (note) {
      note.textContent = message;
      note.hidden = false;
    }
  }

  function buildMapsLink() {
    const button = $('#btn-mapa');
    const { mapsUrl, name, address } = EVENT_CONFIG.venue;

    if (isFilled(mapsUrl)) {
      button.href = mapsUrl;
      return;
    }

    const query = [name, address].filter(isFilled).join(', ');
    if (isFilled(query)) {
      button.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      return;
    }

    setPending(button, $('#lugar-nota'),
      'El mapa estará disponible en cuanto se confirme el lugar.');
  }

  function whatsappUrl() {
    const { number, message } = EVENT_CONFIG.whatsapp;
    if (!isFilled(number)) return null;

    const digits = String(number).replace(/\D/g, '');
    if (!digits) return null;

    const text = isFilled(message) ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${digits}${text}`;
  }

  function buildRsvpLinks() {
    const link = $('#btn-rsvp');
    const barLink = $('#btn-rsvp-bar');
    const note = $('#rsvp-nota');
    const url = whatsappUrl();

    if (!url) {
      setPending(link, note, 'El número de confirmación se publicará muy pronto.');
      $('#rsvpbar')?.remove();
      return false;
    }

    link.href = url;
    if (barLink) {
      barLink.href = url;
      barLink.target = '_blank';
      barLink.rel = 'noopener noreferrer';
    }
    return true;
  }

  const toUtcStamp = (date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  function eventWindow(event) {
    const start = event.value;
    const hours = Number(EVENT_CONFIG.event.durationHours) || 5;
    const end = new Date(start.getTime() + hours * 3600 * 1000);
    return { start, end };
  }

  function eventSummary() {
    return `Mis XV Años · ${EVENT_CONFIG.quinceanera}`;
  }

  function eventLocation() {
    return [EVENT_CONFIG.venue.name, EVENT_CONFIG.venue.address]
      .filter(isFilled)
      .join(', ');
  }

  function buildCalendar(event) {
    const gcal = $('#btn-gcal');
    const icsButton = $('#btn-ics');
    const note = $('#cal-nota');

    if (!event) {
      setPending(gcal.closest('.btn-row'), note,
        'Disponible en cuanto se confirme la fecha.');
      return;
    }

    /* Las marcas van en UTC (sufijo Z): así no hace falta `ctz` ni hay
       ambigüedad de zona horaria en ningún dispositivo. */
    const { start, end } = eventWindow(event);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventSummary(),
      dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
      details: EVENT_CONFIG.copy.closing
    });

    const where = eventLocation();
    if (isFilled(where)) params.set('location', where);

    gcal.href = `https://calendar.google.com/calendar/render?${params.toString()}`;

    icsButton?.addEventListener('click', () => downloadIcs(event));
  }

  /** Genera el .ics en el navegador con Blob — sin backend. */
  function downloadIcs(event) {
    const { start, end } = eventWindow(event);
    const escape = (text) =>
      String(text).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mis XV Anios//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:xv-${start.getTime()}@invitacion`,
      `DTSTAMP:${toUtcStamp(new Date())}`,
      `DTSTART:${toUtcStamp(start)}`,
      `DTEND:${toUtcStamp(end)}`,
      `SUMMARY:${escape(eventSummary())}`,
      `DESCRIPTION:${escape(EVENT_CONFIG.copy.closing)}`
    ];

    const where = eventLocation();
    if (isFilled(where)) lines.push(`LOCATION:${escape(where)}`);

    lines.push('BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY',
      `DESCRIPTION:${escape(eventSummary())}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'mis-xv-anios-laura.ics';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }


  /* ── Música ───────────────────────────────────────────────────────────── */

  /** Tiempo máximo de espera a que la pista dé señales de vida. */
  const AUDIO_TIMEOUT = 6000;

  /**
   * Reproductor de <audio>.
   * El control flotante solo aparece cuando la pista existe y se puede
   * reproducir de verdad: si falta el archivo, la invitación sigue igual
   * y nunca se muestra un botón que no haría nada.
   */
  function createPlayer() {
    const audio = $('#audio');
    const button = $('#btn-musica');
    const glyph = $('use', button);
    const src = get('music.src');

    let ready = false;      // la pista se puede reproducir
    let dead = !isFilled(src);
    let wanted = false;     // la persona ya abrió la invitación

    const paint = (playing) => {
      glyph.setAttribute('href', playing ? '#i-pause' : '#i-play');
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    };

    const reveal = () => {
      button.hidden = false;
      requestAnimationFrame(() => button.classList.add('is-ready'));
    };

    const retire = () => {
      dead = true;
      ready = false;
      button.hidden = true;
      button.classList.remove('is-ready');
    };

    if (dead) return { start() {} };

    audio.src = src;
    audio.preload = 'metadata';
    audio.volume = Number(get('music.volume')) || 0.45;

    const title = get('music.title');
    if (isFilled(title)) audio.setAttribute('title', title);

    /* El control aparece en cuanto la pista demuestra que existe. */
    const markReady = () => {
      if (dead || ready) return;
      ready = true;
      if (wanted) reveal();
    };

    audio.addEventListener('error', retire);
    audio.addEventListener('loadedmetadata', markReady);
    audio.addEventListener('canplay', markReady);

    /* Si la pista no responde, se retira el control en silencio. */
    setTimeout(() => { if (!ready) retire(); }, AUDIO_TIMEOUT);

    audio.addEventListener('play', () => paint(true));
    audio.addEventListener('pause', () => paint(false));

    button.addEventListener('click', () => {
      if (audio.paused) audio.play().catch(() => paint(false));
      else audio.pause();
    });

    return {
      /* Solo se intenta reproducir tras la interacción de abrir. */
      start() {
        if (dead) return;
        wanted = true;
        if (ready) reveal();
        /* Si el navegador bloquea el autoplay, el botón queda para pulsarlo. */
        audio.play().catch(() => paint(false));
      }
    };
  }


  /* ── Apertura ─────────────────────────────────────────────────────────── */

  function initOpening(player, onOpen) {
    const opening = $('#portada');
    const button = $('#btn-abrir');
    const invitation = $('#invitacion');
    let opened = false;

    const open = () => {
      if (opened) return;
      opened = true;

      opening.classList.add('is-out');
      invitation.classList.add('is-open');
      document.body.classList.remove('is-locked');

      player.start();

      const settle = () => {
        opening.hidden = true;
        invitation.focus({ preventScroll: true });
        onOpen?.();
      };

      if (prefersReducedMotion()) settle();
      else setTimeout(settle, 900);
    };

    button.addEventListener('click', open);
  }


  /* ── Revelado al entrar en pantalla ───────────────────────────────────── */

  function initReveal() {
    const targets = $$('.reveal');

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }

    /* Stagger ligero solo donde aporta ritmo. */
    STAGGER_SCOPES.forEach((selector) => {
      $$(selector).forEach((scope) => {
        $$('.reveal', scope).forEach((el, index) => {
          el.style.setProperty('--i', String(Math.min(index, 4)));
        });
      });
    });

    const observer = new IntersectionObserver(
      (entries, self) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          self.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  }


  /* ── Partículas de la portada ─────────────────────────────────────────── */

  function initSparks() {
    if (prefersReducedMotion()) return;

    const layer = $('.sparks');
    if (!layer) return;

    const count = Math.min(Number(layer.dataset.sparks) || 0, 8);
    const NS = 'http://www.w3.org/2000/svg';

    for (let i = 0; i < count; i += 1) {
      const spark = document.createElementNS(NS, 'svg');
      spark.setAttribute('viewBox', '-8 -8 16 16');
      spark.setAttribute('aria-hidden', 'true');
      spark.classList.add('spark');
      spark.style.cssText =
        `--s:${(8 + Math.random() * 9).toFixed(1)}px;` +
        `--x:${(6 + Math.random() * 86).toFixed(1)}%;` +
        `--y:${(6 + Math.random() * 62).toFixed(1)}%;` +
        `--dur:${(2.6 + Math.random() * 2.6).toFixed(2)}s;` +
        `--del:${(Math.random() * 3).toFixed(2)}s`;

      const use = document.createElementNS(NS, 'use');
      use.setAttribute('href', '#o-destello');
      spark.appendChild(use);
      layer.appendChild(spark);
    }
  }


  /* ── Barra flotante de confirmación ───────────────────────────────────── */

  function initRsvpBar() {
    const bar = $('#rsvpbar');
    const sentinel = $('#hero-sentinel');
    const rsvp = $('#rsvp');
    const closing = $('.closing');
    if (!bar || !sentinel || !rsvp || !('IntersectionObserver' in window)) return;

    let pastHero = false;
    let atRsvp = false;
    let atClosing = false;

    const sync = () => {
      const show = pastHero && !atRsvp && !atClosing;
      bar.hidden = false;
      bar.classList.toggle('is-visible', show);
    };

    new IntersectionObserver(([entry]) => {
      pastHero = !entry.isIntersecting;
      sync();
    }, { threshold: 0 }).observe(sentinel);

    new IntersectionObserver(([entry]) => {
      atRsvp = entry.isIntersecting;
      sync();
    }, { threshold: 0.25 }).observe(rsvp);

    /* La confirmación por WhatsApp ya está repetida en el cierre; ahí la
       barra flotante solo taparía la firma y las flores de las esquinas. */
    if (closing) {
      new IntersectionObserver(([entry]) => {
        atClosing = entry.isIntersecting;
        sync();
      }, { threshold: 0.15 }).observe(closing);
    }
  }


  /* ── Arranque ─────────────────────────────────────────────────────────── */

  function init() {
    if (typeof EVENT_CONFIG === 'undefined') {
      console.error('[XV] Falta js/config.js — la invitación no puede cargarse.');
      return;
    }

    const event = readEventDate();

    bindTexts();
    document.addEventListener('photo:change', syncOpeningTheme);
    mountAllPhotos();
    syncOpeningTheme();
    buildTimeline();
    buildGallery();
    buildSwatches();
    mountGiftsQr();

    renderDate(event);
    initCountdown(event);

    buildMapsLink();
    const hasRsvp = buildRsvpLinks();
    buildCalendar(event);

    initReveal();
    initSparks();

    const player = createPlayer();
    initOpening(player, () => {
      if (hasRsvp) initRsvpBar();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
