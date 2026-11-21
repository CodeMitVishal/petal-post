/* Petal Post — app: routing, builder, gift reveal, petals. */
(function () {
  'use strict';
  const F = window.Flora;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduced() ? 0 : ms));
  const MAX_ALL = F.MAX_STEMS; // the Lavish size's limit; each size has its own (F.SIZES)
  const sizeOf = z => F.SIZES[z] || F.SIZES.m;
  const emit = (name, detail = {}) => document.dispatchEvent(new CustomEvent('pp:' + name, { detail }));

  /* ================= data ================= */
  const OCCASIONS = [
    { id: 'love', label: 'Love', emoji: '💗', sub: 'Anniversaries & just us', preset: ['rr', 'pk', 'bb', 'rr', 'rp', 'tr', 'rr', 'bb'], w: 'blush', r: 'ruby',
      notes: ['Every day with you feels like spring. These are for you. No reason needed, just love.', "If I had a flower for every time I thought of you, I'd walk through my garden forever.", 'You make my whole world bloom. Happy us. ♡'] },
    { id: 'birthday', label: 'Birthday', emoji: '🎂', sub: 'Another lap round the sun', preset: ['sf', 'gp', 'ty', 'go', 'dz', 'sf', 'tx'], w: 'kraft', r: 'gold',
      notes: ['Happy birthday! May your year be as bright as these sunflowers.', 'Another trip around the sun, and you just keep getting more wonderful. Have the best day!', 'Wishing you cake, laughter and a whole bouquet of good things this year.'] },
    { id: 'thanks', label: 'Thank you', emoji: '🙏', sub: 'For the big & little things', preset: ['rp', 'hb', 'dp', 'bb', 'tk', 'rn'], w: 'cream', r: 'lilac',
      notes: ['Thank you for everything. These blooms are a small way of saying you mean a lot.', "Your kindness didn't go unnoticed. Thank you, truly.", 'For all the little things you do: thank you.'] },
    { id: 'sorry', label: "I'm sorry", emoji: '🫶', sub: 'Words are hard, flowers help', preset: ['ri', 'lv', 'tw', 'ri', 'bb', 'fm'], w: 'sage', r: 'ivory',
      notes: ["I'm sorry. You matter more to me than being right. Can we start fresh?", "These can't fix it, but I hope they show how much I care. I'm truly sorry.", "I got it wrong, and I'm sorry. Thank you for your patience with me."] },
    { id: 'getwell', label: 'Get well', emoji: '🌤️', sub: 'Sunshine for recovery', preset: ['sf', 'dz', 'go', 'ly', 'ty', 'dz'], w: 'sage', r: 'gold',
      notes: ['Sending a little sunshine your way. Rest up and feel better soon!', 'Get well soon. The world is less bright without you at full power.', 'Thinking of you and wishing you a speedy recovery.'] },
    { id: 'congrats', label: 'Congrats', emoji: '🎉', sub: 'New job, new home, big win', preset: ['sf', 'ty', 'mo', 'go', 'ry', 'sf', 'dz'], w: 'midnight', r: 'gold',
      notes: ['You did it! So proud of you. Congratulations!', 'Big news deserves big flowers. Congratulations!', "Here's to you and everything you've worked for. Congrats!"] },
    { id: 'sympathy', label: 'Thinking of you', emoji: '🕊️', sub: 'Comfort from afar', preset: ['ly', 'lu', 'ri', 'hb', 'bb', 'eu'], w: 'cream', r: 'ivory',
      notes: ['Thinking of you, and holding you close in my heart.', "There are no right words, so I'm sending flowers and all my love.", "I'm here for you, today and every day after."] },
    { id: 'just', label: 'Just because', emoji: '✨', sub: 'No reason at all', preset: ['sk', 'rn', 'co', 'sk', 'pk', 'fm'], w: 'blush', r: 'lilac',
      notes: ['No reason. I just thought of you and wanted to make you smile.', "A little bouquet for a lovely person. That's the whole message.", 'Saw these and thought of you. Have a beautiful day.'] },
  ];
  const OCC = Object.fromEntries(OCCASIONS.map(o => [o.id, o]));

  /* ================= utils ================= */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  store.del = k => { try { localStorage.removeItem(k); } catch { /* ignore */ } };
  const sess = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch { /* ignore */ } },
  };
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));

  // One anonymous id per browser. It keeps your wall entries and your rate limit separate
  // from other people, even on the same Wi-Fi or mobile network. It is never linked to a
  // name, email or IP address, and clearing site data simply makes a new one.
  const clientId = (() => {
    const id = store.get('petalpost.cid');
    if (typeof id === 'string' && UUID_RE.test(id)) return id;
    const fresh = uuid();
    store.set('petalpost.cid', fresh);
    return fresh;
  })();
  const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const randSeed = () => (Math.random() * 1e6) | 0;

  function encode(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    let bin = '';
    bytes.forEach(b => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
  }
  const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
  function sanitize(g) {
    if (!g || typeof g !== 'object') return null;
    const z = F.SIZES[g.z] ? g.z : 'm';
    const b = String(g.b || '').split('.').filter(id => F.BY_ID[id]).slice(0, sizeOf(z).max);
    return {
      z,
      t: str(g.t, 40), f: str(g.f, 40), m: str(g.m, 300),
      o: OCC[g.o] ? g.o : '',
      b,
      w: F.WRAPS[g.w] ? g.w : 'kraft',
      r: F.RIBBONS[g.r] ? g.r : 'ruby',
      d: /^\d{4}-\d{2}-\d{2}$/.test(g.d || '') ? g.d : '',
      s: Number.isFinite(+g.s) ? Math.abs(+g.s | 0) : 1,
      p: Photos.valid(g.p) ? g.p : '',
    };
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ================= falling petals ================= */
  const Petals = (() => {
    const cv = $('#petals'), ctx = cv.getContext('2d');
    const COLORS = ['#F6B9C6', '#F9D2DA', '#F28BA8', '#FBE3E8', '#E99AB0', '#FFD9C9', '#FFFFFF'];
    let W = 0, H = 0, list = [], raf = 0, ambient = 0;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ambient = Math.round(Math.min(22, W / 60));
    }
    const make = (x, y, burst) => ({
      x: x ?? Math.random() * W, y: y ?? -20 - Math.random() * H * 0.9,
      vx: burst ? (Math.random() - 0.5) * 9 : 0, vy: burst ? -Math.random() * 8 - 2 : 0.35 + Math.random() * 0.7,
      size: 5 + Math.random() * 7, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.06,
      sway: Math.random() * 6.28, ss: 0.01 + Math.random() * 0.02, flip: Math.random() * 6.28,
      c: COLORS[(Math.random() * COLORS.length) | 0], burst, life: 1,
    });
    function draw(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.cos(p.flip) * 0.5 + 0.6, 1);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life)) * 0.9;
      ctx.fillStyle = p.c;
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.6, s * 0.8, 0, s);
      ctx.bezierCurveTo(-s * 0.6, s * 0.8, -s * 0.9, -s * 0.6, 0, -s);
      ctx.fill();
      ctx.restore();
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      const amb = list.filter(p => !p.burst).length;
      if (!reduced() && amb < ambient) list.push(make());
      list = list.filter(p => {
        if (p.burst) { p.vy += 0.16; p.vx *= 0.985; p.vy = Math.min(p.vy, 3); p.life -= 0.004; }
        p.sway += p.ss; p.flip += 0.04;
        p.x += p.vx + Math.sin(p.sway) * 0.6; p.y += p.vy; p.rot += p.vr;
        draw(p);
        return p.y < H + 30 && p.life > 0;
      });
      raf = list.length || !reduced() ? requestAnimationFrame(tick) : 0;
    }
    function start() { if (!raf) raf = requestAnimationFrame(tick); }
    function burst(x, y, n = 46) {
      if (reduced()) return;
      for (let i = 0; i < n; i++) list.push(make(x, y, true));
      start();
    }
    resize();
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else start();
    });
    start();
    return { burst };
  })();
  const burstFrom = (el, n) => { const r = el.getBoundingClientRect(); Petals.burst(r.left + r.width / 2, r.top + r.height / 2, n); };

  /* ================= scroll reveal ================= */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 })
    : null;
  function observeReveals(root) {
    $$('[data-reveal]:not(.in)', root).forEach((el, i) => {
      el.style.setProperty('--rd', `${(i % 4) * 0.08}s`);
      io ? io.observe(el) : el.classList.add('in');
    });
  }

  /* ================= PUBLIC FLOWER WALL ================= */
  const Wall = (() => {
    const cfg = () => window.PETAL_CONFIG || {};
    const on = () => !!(cfg().supabaseUrl && cfg().supabaseAnonKey);
    const STAT_LABELS = [['bouquets', 'bouquets sent'], ['stems', 'stems given'], ['recipients', 'people got flowers'], ['senders', 'people sent flowers']];
    const rtf = 'RelativeTimeFormat' in Intl ? new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }) : null;
    let rows = [], stats = null, seen = new Map(), timer = 0, mode = null, loadedOnce = false;

    function api(path, body, prefer) {
      const url = `${cfg().supabaseUrl.replace(/\/+$/, '')}/rest/v1/${path}`;
      const headers = { apikey: cfg().supabaseAnonKey, 'Content-Type': 'application/json' };
      if (prefer) headers.Prefer = prefer;
      return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }).then(async r => {
        if (!r.ok) {
          const err = new Error(`wall ${path}: ${r.status}`);
          // P0001 = our own friendly messages (rate limits); never show raw database errors.
          try { const j = await r.json(); if (j && j.code === 'P0001') err.userMessage = String(j.message).slice(0, 120); } catch { /* ignore */ }
          throw err;
        }
        return prefer ? null : r.json();
      });
    }

    // First name only, letters plus . ' - and spaces, max 20 chars (mirrors the database check).
    function firstName(s) {
      const word = String(s || '').trim().split(/\s+/)[0] || '';
      return word.replace(/[^\p{L} .'-]/gu, '').replace(/^[^\p{L}]+/u, '').slice(0, 20);
    }

    function ago(ts) {
      const s = (new Date(ts).getTime() - Date.now()) / 1000;
      if (!rtf || !Number.isFinite(s)) return '';
      for (const [u, n] of [['year', 31536e3], ['month', 2592e3], ['week', 604800], ['day', 864e2], ['hour', 3600], ['minute', 60]]) {
        if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), u);
      }
      return 'just now';
    }

    function countUp(el, to) {
      const from = +el.dataset.v || 0;
      el.dataset.v = to;
      if (reduced() || from === to) { el.textContent = to.toLocaleString(); return; }
      const t0 = performance.now(), dur = 1300;
      const step = t => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(from + (to - from) * e).toLocaleString();
        if (k < 1 && +el.dataset.v === to) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      if (to > from && from > 0) { el.parentElement.classList.remove('tick'); void el.offsetWidth; el.parentElement.classList.add('tick'); }
    }

    function renderStats() {
      $$('[data-stats]').forEach(box => {
        if (!box.children.length) {
          box.innerHTML = STAT_LABELS.map(([k, l]) => `<div class="stat"><b data-stat="${k}">0</b><span>${l}</span></div>`).join('');
        }
        if (stats) STAT_LABELS.forEach(([k]) => countUp(box.querySelector(`[data-stat="${k}"]`), Math.max(0, +stats[k] || 0)));
      });
    }

    // Same names from different people are different rows; the server gives each a "pair" id.
    const pairKey = r => (typeof r.pair === 'string' && r.pair) || `${r.sender}|${r.recipient}`.toLowerCase();

    // Round avatar (photo, or a coloured initial) followed by the first name.
    function person(host, name, photoId) {
      const av = document.createElement('span');
      av.className = 'av';
      av.setAttribute('aria-hidden', 'true');
      const initial = (String(name).match(/\p{L}/u) || ['?'])[0].toUpperCase();
      let h = 0;
      for (const ch of String(name).toLowerCase()) h = (h * 31 + ch.codePointAt(0)) % 360;
      av.style.setProperty('--h', h);
      av.textContent = initial;
      const src = Photos.url('a', photoId);
      if (src) {
        const img = new Image();
        img.alt = '';
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        img.onload = () => { av.textContent = ''; av.appendChild(img); av.classList.add('has-photo'); };
        img.src = src;
      }
      const strong = document.createElement('strong');
      strong.textContent = name;
      host.append(av, strong);
    }

    function item(r, fresh) {
      const li = document.createElement('li');
      li.className = 'wall-item' + (fresh ? ' fresh' : '');
      const ids = String(r.flowers || '').split('.').filter(id => F.BY_ID[id]);
      const uniq = [...new Set(ids)].slice(0, 4);
      const times = Math.max(1, +r.times || 1), stems = Math.max(0, +r.stems || 0);
      const occ = OCC[r.occasion];
      li.innerHTML =
        `<div class="wi-flowers" aria-hidden="true">${uniq.map(id => F.headThumb(id)).join('')}</div>` +
        '<div class="wi-main"><p class="wi-names"><span class="wi-person"></span><span class="wi-arrow" aria-label="sent flowers to">→</span><span class="wi-person"></span></p><p class="wi-meta"></p></div>' +
        `<span class="wi-count"><b>${times}</b>${times === 1 ? 'bouquet' : 'bouquets'}</span>`;
      const [from, to] = li.querySelectorAll('.wi-person');
      person(from, r.sender, r.sender_photo);
      person(to, r.recipient, r.recipient_photo);
      li.querySelector('.wi-meta').textContent = [occ ? `${occ.emoji} ${occ.label}` : '', `${stems} ${stems === 1 ? 'stem' : 'stems'}`, uniq.map(id => F.BY_ID[id].name).join(', '), ago(r.last_at)].filter(Boolean).join(' · ');
      return li;
    }

    function renderList(host, list, limit) {
      host.innerHTML = '';
      list.slice(0, limit).forEach((r, i) => {
        const key = pairKey(r);
        const fresh = loadedOnce && seen.get(key) !== r.last_at;
        const li = item(r, fresh);
        li.style.setProperty('--i', Math.min(i, 12));
        host.appendChild(li);
      });
    }

    function renderAll() {
      renderStats();
      const empty = !rows.length;
      const home = $('#homeWall');
      renderList(home, rows, 6);
      if (empty) home.innerHTML = '<li class="wall-empty-item">No bouquets on the wall yet. Send one and be the first.</li>';
      const q = ($('#wallSearch').value || '').trim().toLowerCase();
      const list = q ? rows.filter(r => `${r.sender} ${r.recipient}`.toLowerCase().includes(q)) : rows;
      renderList($('#fullWall'), list, 200);
      const msg = $('#wallEmpty');
      msg.hidden = list.length > 0;
      msg.textContent = empty ? 'No bouquets on the wall yet. Send one and be the first.' : `Nobody called “${q}” on the wall yet.`;
      seen = new Map(rows.map(r => [pairKey(r), r.last_at]));
    }

    async function load() {
      if (!on()) return;
      try {
        const [s, w] = await Promise.all([api('rpc/gift_stats', {}), api('rpc/gift_wall', { max_rows: 200 })]);
        stats = s || {};
        rows = Array.isArray(w) ? w.filter(r => r && r.sender && r.recipient) : [];
        renderAll();
        loadedOnce = true;
        $('#wallBlock').hidden = false;
        $('#wallEmpty').classList.remove('error');
      } catch (e) {
        console.warn(e);
        if (!loadedOnce) {
          const msg = $('#wallEmpty');
          msg.hidden = false; msg.classList.add('error');
          msg.textContent = "Couldn't load the flower wall right now. Please try again in a moment.";
        }
      }
    }

    // mode: 'home' | 'wall' | null — polls while a view that shows the wall is open.
    function show(m) {
      mode = on() ? m : null;
      clearInterval(timer);
      if (!mode) return;
      renderStats();
      if (mode === 'wall') observeReveals($('#view-wall'));
      load();
      timer = setInterval(() => { if (!document.hidden) load(); }, 30000);
    }

    async function record(data, code) {
      if (!on() || !state.wall) return;
      const recipient = firstName(state.t);
      if (!recipient || !data.b) return;
      const done = store.get('petalpost.walled') || [];
      if (done.includes(code)) return;
      const flowers = data.b.split('.').slice(0, MAX_ALL);
      try {
        await api('gifts', {
          sender: firstName(state.f) || 'Someone', recipient,
          occasion: OCC[data.o] ? data.o : null, stems: flowers.length, flowers: flowers.join('.'),
          sender_photo: Photos.valid(state.ps) ? state.ps : null,
          recipient_photo: Photos.valid(state.pr) ? state.pr : null,
          sender_key: clientId,
        }, 'return=minimal');
        store.set('petalpost.walled', [...done, code].slice(-50));
        toast(`Added to the flower wall: ${firstName(state.f) || 'Someone'} → ${recipient} 🌸`);
      } catch (e) {
        console.warn(e);
        toast(e.userMessage ? `Your link is ready. ${e.userMessage}` : "Your link is ready, but the flower wall couldn't be updated.");
      }
    }

    function init() {
      $('#wallNav').hidden = !on();
      $('#wallPeek').hidden = !on();
      $('#wallSearch').addEventListener('input', renderAll);
    }

    return { on, show, record, firstName, init };
  })();

  /* ================= PHOTOS ================= */
  // Photos are re-drawn on a canvas and saved as fresh JPEGs, which drops EXIF data
  // (GPS location, camera, date). Stored under random UUID names in the "photos" bucket.
  const Photos = (() => {
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    const valid = id => typeof id === 'string' && UUID.test(id);
    const base = () => String((window.PETAL_CONFIG || {}).supabaseUrl || '').replace(/\/+$/, '');
    const url = (kind, id) => (Wall.on() && valid(id) && (kind === 'g' || kind === 'a') ? `${base()}/storage/v1/object/public/photos/${kind}/${id}.jpg` : '');
    const PRESETS = { g: { max: 1200, square: false, quality: 0.84 }, a: { max: 256, square: true, quality: 0.85 } };

    async function decode(file) {
      if ('createImageBitmap' in window) {
        try { const b = await createImageBitmap(file, { imageOrientation: 'from-image' }); return { src: b, w: b.width, h: b.height, done: () => b.close && b.close() }; } catch { /* fall back */ }
      }
      const u = URL.createObjectURL(file);
      const img = new Image();
      img.src = u;
      try { await img.decode(); } catch (e) { URL.revokeObjectURL(u); throw e; }
      return { src: img, w: img.naturalWidth, h: img.naturalHeight, done: () => URL.revokeObjectURL(u) };
    }

    async function toJpeg(file, { max, square, quality }) {
      const im = await decode(file);
      try {
        let sx = 0, sy = 0, sw = im.w, sh = im.h;
        if (!sw || !sh) throw new Error('empty image');
        if (square) { const s = Math.min(sw, sh); sx = (sw - s) / 2; sy = (sh - s) / 2; sw = sh = s; }
        let scale = Math.min(1, max / Math.max(sw, sh)), q = quality;
        for (let attempt = 0; attempt < 4; attempt++) {
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(sw * scale));
          c.height = Math.max(1, Math.round(sh * scale));
          const x = c.getContext('2d');
          x.fillStyle = '#fff';
          x.fillRect(0, 0, c.width, c.height);
          x.drawImage(im.src, sx, sy, sw, sh, 0, 0, c.width, c.height);
          const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', q));
          if (blob && blob.size <= 950 * 1024) return blob;
          scale *= 0.8; q -= 0.08;
        }
        throw new Error('too large');
      } finally { im.done(); }
    }

    async function upload(file, kind) {
      if (!Wall.on()) throw new Error('storage off');
      if (!file || !/^image\//.test(file.type || '') ) throw Object.assign(new Error('type'), { userMessage: 'Please choose a photo (JPG, PNG, WebP or GIF).' });
      if (file.size > 25 * 1024 * 1024) throw Object.assign(new Error('size'), { userMessage: 'That photo is too large. Please pick one under 25 MB.' });
      let blob;
      try { blob = await toJpeg(file, PRESETS[kind]); } catch (e) {
        throw Object.assign(e, { userMessage: "Couldn't read that photo. Try a JPG or PNG." });
      }
      const id = crypto.randomUUID();
      const cfg = window.PETAL_CONFIG;
      const r = await fetch(`${base()}/storage/v1/object/photos/${kind}/${id}.jpg`, {
        method: 'POST',
        headers: { apikey: cfg.supabaseAnonKey, 'Content-Type': 'image/jpeg', 'x-upsert': 'false', 'cache-control': '31536000' },
        body: blob,
      });
      if (!r.ok) {
        throw Object.assign(new Error(`upload ${r.status}`), {
          userMessage: r.status === 403 || r.status === 429 ? 'Lots of photos are being shared right now. Please try again in a minute.' : "The photo couldn't be uploaded. Please try again.",
        });
      }
      return { id, preview: URL.createObjectURL(blob) };
    }

    return { valid, url, upload };
  })();

  /* ================= HOME ================= */
  // "Grow another" cycles through sizes so visitors see a Posy, a Classic, a Grand and a Lavish.
  const HERO_SETS = [
    { z: 'm', ids: ['rp', 'rr', 'sk', 'dz', 'pk', 'lv', 'bb', 'ty', 'rp'] },
    { z: 'l', ids: ['pk', 'rr', 'hb', 'ri', 'op', 'cr', 'lv', 'rn', 'bb', 'pk', 'eu', 'rp', 'hl', 'ly', 'rr', 'cp', 'fm', 'eu'] },
    { z: 's', ids: ['rn', 'pk', 'bb', 'cp', 'fm', 'rn'] },
    { z: 'm', ids: ['sf', 'go', 'ty', 'gp', 'po', 'dz', 'sf', 'eu'] },
    { z: 'x', ids: ['tr', 'tk', 'pk', 'lt', 'rr', 'td', 'hk', 'rp', 'lp', 'tw', 'bb', 'tr', 'dp', 'mg', 'rq', 'tk', 'fn', 'pk', 'tx', 'rr', 'bp', 'lt', 'rp', 'eu', 'tk', 'ri', 'td', 'bb'] },
    { z: 'l', ids: ['ly', 'ow', 'ri', 'hb', 'bb', 'ly', 'eu', 'ri', 'hl', 'op', 'bb', 'ow', 'lv', 'ri'] },
  ];
  let heroIdx = 0;
  function growHero() {
    const set = HERO_SETS[heroIdx % HERO_SETS.length];
    const wraps = ['blush', 'cream', 'kraft', 'kraft', 'sage'], ribs = ['ruby', 'ruby', 'lilac', 'gold', 'ivory'];
    const svg = $('#heroSvg');
    svg.classList.remove('anim');
    svg.innerHTML = F.bouquetSVG(set.ids, { size: set.z, w: wraps[heroIdx % 5], r: ribs[heroIdx % 5], seed: 7 + heroIdx * 13, animate: true, delay: 0.5 });
    void svg.getBoundingClientRect();
    svg.classList.add('anim');
    heroIdx++;
  }

  function occasionButton(o, compact) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'occasion';
    b.dataset.occasion = o.id;
    b.innerHTML = `<span class="emo" aria-hidden="true">${o.emoji}</span><strong></strong>${compact ? '' : '<small></small>'}`;
    b.querySelector('strong').textContent = o.label;
    if (!compact) b.querySelector('small').textContent = o.sub;
    return b;
  }

  function initHome() {
    const grid = $('#homeOccasions');
    OCCASIONS.forEach((o, i) => {
      const b = occasionButton(o, false);
      b.setAttribute('data-reveal', '');
      b.addEventListener('click', () => {
        state = blankState();
        applyOccasion(o.id, true);
        state.step = 1;
        save();
        go('#/create');
      });
      grid.appendChild(b);
    });

    const track = $('#marquee');
    // one of each kind, plus a few showpiece colours
    const showcase = [...new Set([...F.FAMILIES.map(f => f.ids[0]), 'lb', 'tb', 'tx', 'lx', 'ts', 'rb'])].map(id => F.BY_ID[id]);
    const items = showcase.map(f => `<div class="m-item">${F.headThumb(f.id)}<div><strong>${f.name}</strong><small>${f.meaning}</small></div></div>`).join('');
    track.innerHTML = items + items;

    $('#heroReplay').addEventListener('click', e => { growHero(); burstFrom(e.currentTarget, 20); });
    $('#sampleBtn').addEventListener('click', () => {
      sess.del('pp.preview');
      go('#/g/' + encode({ t: 'You', f: 'Petal Post', m: 'This is what your person will see: an envelope, a bouquet that grows, and your words in your own voice. Now go make one for someone you love. ♡', o: 'just', b: 'rp.rr.sk.dz.rr.lv.bb.ty.rp', w: 'blush', r: 'ruby', s: 7 }));
    });

    // gentle 3D tilt on the hero arch
    const card = $('#heroCard');
    card.addEventListener('pointermove', e => {
      if (reduced() || e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
    });
    card.addEventListener('pointerleave', () => (card.style.transform = ''));
  }

  /* ================= BUILDER ================= */
  let uidN = 0;
  const newItem = (id, k = Math.random()) => ({ uid: `u${++uidN}`, id, k });
  const blankState = () => ({ o: '', items: [], aside: [], z: 'm', w: 'kraft', r: 'ruby', t: '', f: '', m: '', mAuto: false, d: '', s: randSeed(), step: 0, touched: false, noteIdx: 0, wall: false, p: '', ps: '', pr: '', colors: [], moods: [], sel: {} });
  const previews = {}; // local blob previews for photos picked in this session
  let chosenOpen = false; // "Show all kinds" toggle for the picked-flowers list

  /* Drafts: every tab keeps its own draft, so two bouquets in two tabs (or two people
     sharing a computer) never overwrite each other. A new tab picks up the newest draft
     that isn't open anywhere else, and takes it over so no other tab grabs it too. */
  const DRAFT_INDEX = 'petalpost.drafts';
  const draftKey = id => 'petalpost.draft.' + id;
  const aliveKey = id => 'petalpost.alive.' + id;
  const isAlive = id => { const t = store.get(aliveKey(id)); return typeof t === 'number' && Date.now() - t < 12000; };
  let tabId = sess.get('pp.tab');
  if (!UUID_RE.test(tabId || '') || isAlive(tabId)) tabId = uuid(); // a duplicated tab gets its own id
  sess.set('pp.tab', tabId);
  const heartbeat = () => store.set(aliveKey(tabId), Date.now());
  heartbeat();
  setInterval(heartbeat, 5000);
  addEventListener('pagehide', () => store.del(aliveKey(tabId)));
  addEventListener('pageshow', heartbeat);

  // A draft is worth keeping once it has flowers, a name, a note or an occasion.
  const hasContent = d => !!(d && ((d.items && d.items.length) || d.t || d.f || d.m || d.o));

  function takeDraft() {
    const own = store.get(draftKey(tabId));
    if (own) return own;
    let index = (store.get(DRAFT_INDEX) || []).filter(e => e && UUID_RE.test(e.id) && e.id !== tabId).sort((a, b) => b.t - a.t);
    for (const e of index) {
      if (isAlive(e.id)) continue;
      const d = store.get(draftKey(e.id));
      store.del(draftKey(e.id));
      index = index.filter(x => x.id !== e.id);
      store.set(DRAFT_INDEX, index);
      if (hasContent(d)) return d;
    }
    const legacy = store.get('petalpost.draft'); // saved before per-tab drafts existed
    store.del('petalpost.draft');
    return legacy;
  }

  let state = restore();

  function restore() {
    const d = takeDraft();
    const s = blankState();
    if (!d || typeof d !== 'object') return s;
    Object.assign(s, sanitize({ ...d, b: (d.items || []).map(i => i.id).join('.') }));
    s.items = (d.items || []).filter(i => F.BY_ID[i.id]).slice(0, sizeOf(s.z).max).map(i => newItem(i.id, +i.k || Math.random()));
    s.aside = (Array.isArray(d.aside) ? d.aside : []).filter(id => F.BY_ID[id]).slice(0, MAX_ALL);
    s.mAuto = !!d.mAuto; s.touched = !!d.touched; s.wall = !!d.wall;
    const ok = (list, all) => (Array.isArray(list) ? list.filter(x => all.some(a => a.id === x)) : []);
    s.colors = ok(d.colors, F.COLORS);
    s.moods = ok(d.moods || (d.mood && d.mood !== 'all' ? [d.mood] : []), F.MOODS); // older drafts kept a single mood
    if (d.sel && typeof d.sel === 'object') Object.entries(d.sel).forEach(([fam, id]) => { if (F.FAM_BY_ID[fam] && F.BY_ID[id] && F.BY_ID[id].fam === fam) s.sel[fam] = id; });
    s.ps = Photos.valid(d.ps) ? d.ps : ''; s.pr = Photos.valid(d.pr) ? d.pr : ''; s.step = Math.min(4, Math.max(0, d.step | 0));
    return s;
  }
  function save() {
    const draft = { ...state, items: state.items.map(({ id, k }) => ({ id, k })) };
    const now = Date.now();
    const index = store.get(DRAFT_INDEX) || [];
    const keep = index.filter(e => e && e.id !== tabId && now - e.t < 14 * 864e5).sort((a, b) => b.t - a.t).slice(0, 7);
    index.filter(e => e && e.id !== tabId && !keep.includes(e)).forEach(e => store.del(draftKey(e.id)));
    if (hasContent(draft)) {
      store.set(draftKey(tabId), draft);
      store.set(DRAFT_INDEX, [{ id: tabId, t: now }, ...keep]);
    } else {
      store.del(draftKey(tabId)); // an empty tab never hides a real draft from later visits
      store.set(DRAFT_INDEX, keep);
    }
  }
  const ordered = () => [...state.items].sort((a, b) => a.k - b.k);
  const maxStems = () => sizeOf(state.z).max;
  const giftData = () => ({ v: 1, z: state.z, t: state.t, f: state.f, m: state.m, o: state.o, b: ordered().map(i => i.id).join('.'), w: state.w, r: state.r, d: state.d, s: state.s, ...(Photos.valid(state.p) ? { p: state.p } : {}) });
  const giftUrl = () => `${location.origin}${location.pathname}#/g/${encode(giftData())}`;

  function applyOccasion(id, force) {
    const o = OCC[id];
    if (!o) return;
    state.o = id;
    if (force || !state.touched || !state.items.length) {
      state.items = o.preset.map(x => newItem(x));
      state.aside = [];
      if (state.z === 's' && state.items.length > sizeOf('s').max) state.z = 'm';
      state.w = o.w; state.r = o.r; state.s = randSeed(); state.touched = false;
    }
    if (force || !state.m || state.mAuto) { state.noteIdx = 0; state.m = o.notes[0]; state.mAuto = true; }
  }

  let builderReady = false;
  function initBuilder() {
    if (builderReady) return;
    builderReady = true;
    const svg = $('#builderSvg');
    svg.innerHTML = F.skeleton(state.w, state.r, state.z);

    // bouquet size: Posy (short), Classic, Grand (tall), Lavish (tallest)
    const sp = $('#sizePick');
    Object.values(F.SIZES).forEach(Z => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'size-opt';
      b.dataset.size = Z.id;
      b.setAttribute('role', 'radio');
      b.innerHTML = `${sizeIcon(Z.id)}<span><strong>${Z.name}</strong><small><span class="sz-sub">${{ s: 'Short & sweet', m: 'Just right', l: 'Big & lush', x: 'A showstopper' }[Z.id]} · </span>up to ${Z.max}</small></span>`;
      b.addEventListener('click', () => chooseSize(Z.id, b));
      sp.appendChild(b);
    });
    sp.addEventListener('keydown', e => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!keys[e.key]) return;
      e.preventDefault();
      const order = Object.keys(F.SIZES), i = order.indexOf(state.z);
      const next = order[(i + keys[e.key] + order.length) % order.length];
      chooseSize(next, sp.querySelector(`[data-size="${next}"]`));
      sp.querySelector(`[data-size="${next}"]`).focus();
    });

    // filters: colour swatches and mood chips, both multi-select
    const toggle = (list, id) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
    const cf = $('#colorFilter');
    F.COLORS.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'color-chip';
      b.dataset.color = c.id;
      b.title = `${c.name} flowers (${c.ids.length})`;
      b.innerHTML = `<i style="--sw:${c.sw}"></i><span></span>`;
      b.querySelector('span').textContent = c.name;
      b.addEventListener('click', () => { state.colors = toggle(state.colors, c.id); save(); renderFilters(true); });
      cf.appendChild(b);
    });
    const mf = $('#moodFilter');
    [{ id: 'all', name: 'Any mood', ids: F.CATALOG.map(f => f.id) }, ...F.MOODS].forEach(m => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mood-chip';
      b.dataset.mood = m.id;
      b.innerHTML = `<span></span><b>${m.ids.length}</b>`;
      b.firstChild.textContent = m.name;
      b.addEventListener('click', () => { state.moods = m.id === 'all' ? [] : toggle(state.moods, m.id); save(); renderFilters(true); });
      mf.appendChild(b);
    });
    // On phones the catalog is long: a floating button brings the filters back.
    const jump = $('#filterJump'), bar = $('#filterBar');
    document.body.appendChild(jump); // fixed to the screen, outside the animated step
    jump.addEventListener('click', () => { bar.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); setTimeout(() => $('#flowerSearch').focus({ preventScroll: true }), 450); });
    let jumpTick = false;
    const placeJump = () => {
      jumpTick = false;
      const visible = state.step === 1 && !!bar.offsetParent && location.hash.startsWith('#/create');
      jump.classList.toggle('show', visible && bar.getBoundingClientRect().bottom < 0 && $('#catalog').getBoundingClientRect().bottom > innerHeight * 0.6);
    };
    addEventListener('scroll', () => { if (!jumpTick) { jumpTick = true; requestAnimationFrame(placeJump); } }, { passive: true });
    addEventListener('hashchange', placeJump);

    // occasions
    const oc = $('#occasionChoices');
    OCCASIONS.forEach(o => {
      const b = occasionButton(o, true);
      b.addEventListener('click', () => {
        const hadCustom = state.touched && state.items.length;
        applyOccasion(o.id, false);
        burstFrom(b, 14);
        renderAll();
        if (hadCustom) toast(`Kept your flowers. Tap “Use ${o.label} bouquet” to swap.`);
        setTimeout(() => goStep(1), reduced() ? 0 : 420);
      });
      oc.appendChild(b);
    });

    // catalog: one card per flower family, with a colour dot for each member
    const cat = $('#catalog');
    F.FAMILIES.forEach(fam => {
      const card = document.createElement('div');
      card.className = 'flower' + (fam.ids.length > 8 ? ' wide' : '');
      card.dataset.fam = fam.id;
      const many = fam.ids.length > 1;
      card.innerHTML =
        `<button type="button" class="flower-add"><span class="thumb"></span><strong></strong><small><em class="shade"></em><span class="meaning"></span></small></button>` +
        (many ? `<div class="dots" role="radiogroup" aria-label="${fam.name} colours"></div>` : '') +
        `<span class="count" aria-hidden="true">0</span><button type="button" class="minus" aria-label="Remove one ${fam.name}">−</button>`;
      card.querySelector('strong').textContent = fam.name;
      if (many) {
        const dots = card.querySelector('.dots');
        fam.ids.forEach(id => {
          const f = F.BY_ID[id];
          const d = document.createElement('button');
          d.type = 'button';
          d.className = 'dot';
          d.dataset.id = id;
          d.setAttribute('role', 'radio');
          d.setAttribute('aria-label', f.shade);
          d.title = `${f.name}: ${f.meaning}`;
          d.style.background = dotPaint(f);
          d.addEventListener('click', () => {
            if (selOf(fam.id) === id) addFlower(id, card); // tapping the chosen colour again adds it
            else pickShade(fam.id, id, true);
          });
          dots.appendChild(d);
        });
        dots.addEventListener('keydown', e => {
          const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
          if (!step) return;
          e.preventDefault();
          const live = [...dots.querySelectorAll('.dot:not([hidden])')];
          const i = live.findIndex(d => d.dataset.id === selOf(fam.id));
          const next = live[(i + step + live.length) % live.length];
          pickShade(fam.id, next.dataset.id, true);
          next.focus();
        });
      }
      card.querySelector('.flower-add').addEventListener('click', () => addFlower(selOf(fam.id), card));
      card.querySelector('.minus').addEventListener('click', () => removeFromFamily(fam.id));
      cat.appendChild(card);
      paintCard(card, false);
    });
    $('#flowerSearch').addEventListener('input', e => { query = e.target.value; renderFilters(true); });
    $('#flowerSearch').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } });

    $('#surpriseBtn').addEventListener('click', e => {
      // a harmonious surprise: flowers from one mood, finished with a filler
      const moods = F.MOODS.filter(m => m.id !== 'green');
      const mood = moods[(Math.random() * moods.length) | 0];
      const [lo, hi] = { s: [4, 7], m: [6, 11], l: [12, 22], x: [24, 34] }[state.z] || [6, 11];
      const n = lo + ((Math.random() * (hi - lo + 1)) | 0);
      const pick = [...mood.ids].sort(() => Math.random() - 0.5).slice(0, ({ l: 5, x: 7 }[state.z] || 3) + ((Math.random() * 2) | 0));
      const filler = ['bb', 'eu', 'fn', 'bp', 'js'][(Math.random() * 5) | 0];
      state.aside = [];
      state.items = Array.from({ length: n - 1 }, () => newItem(pick[(Math.random() * pick.length) | 0])).concat(newItem(filler));
      state.s = randSeed(); state.touched = true;
      burstFrom(e.currentTarget, 16);
      toast(`A ${mood.name.toLowerCase()} surprise ✦`);
      renderAll();
    });
    $('#presetBtn').addEventListener('click', () => { state.touched = false; applyOccasion(state.o, false); renderAll(); });
    $('#clearBtn').addEventListener('click', () => { state.items = []; state.aside = []; state.touched = true; renderAll(); });
    $('#chosenMore').addEventListener('click', () => { chosenOpen = !chosenOpen; renderCatalog(); });
    $('#shuffleBtn').addEventListener('click', () => {
      state.s = randSeed();
      state.items.forEach(i => (i.k = Math.random()));
      renderAll();
    });

    // swatches
    const mk = (host, map, key) => Object.entries(map).forEach(([id, c]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'swatch'; b.dataset.id = id;
      b.innerHTML = `<i style="background:linear-gradient(135deg, ${c.base} 55%, ${c.dark})"></i><span>${c.name}</span>`;
      b.addEventListener('click', () => { const changed = state[key] !== id; state[key] = id; renderAll(); if (changed) emit('wrap-changed', { color: c.base, from: b }); });
      host.appendChild(b);
    });
    mk($('#wrapSwatches'), F.WRAPS, 'w');
    mk($('#ribbonSwatches'), F.RIBBONS, 'r');

    // note fields
    const to = $('#toInput'), from = $('#fromInput'), msg = $('#msgInput'), date = $('#dateInput');
    const fixName = () => { if ($('#toField').classList.contains('invalid') || $('#fromField').classList.contains('invalid')) showNameErrors(false); };
    to.addEventListener('input', () => { state.t = to.value; renderTag(true); renderSend(); fixName(); save(); });
    from.addEventListener('input', () => { state.f = from.value; renderSend(); fixName(); save(); });
    to.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); from.focus(); } });
    from.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); msg.focus(); } });
    msg.addEventListener('input', () => { emit('typing', { field: msg }); state.m = msg.value; state.mAuto = false; renderCount(); renderSend(); save(); });
    date.min = todayStr();
    date.addEventListener('change', () => { state.d = date.value && date.value > todayStr() ? date.value : ''; if (date.value && !state.d) date.value = ''; renderSend(); save(); });
    $('#inspireBtn').addEventListener('click', () => {
      const pool = OCC[state.o]?.notes || OCCASIONS.flatMap(o => o.notes);
      state.noteIdx = (state.noteIdx + 1) % pool.length;
      if (pool[state.noteIdx] === state.m) state.noteIdx = (state.noteIdx + 1) % pool.length;
      state.m = pool[state.noteIdx]; state.mAuto = true;
      msg.value = state.m;
      msg.animate?.([{ opacity: 0.2, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: reduced() ? 0 : 350, easing: 'ease-out' });
      renderCount(); renderSend(); save();
    });

    // steps
    $$('#stepper [data-goto]').forEach(b => b.addEventListener('click', () => goStep(+b.dataset.goto)));
    $('#backBtn').addEventListener('click', () => (state.step > 0 ? goStep(state.step - 1) : go('#/')));
    $('#nextBtn').addEventListener('click', () => goStep(Math.min(4, state.step + 1)));

    // share
    const shared = e => { const data = giftData(); Wall.record(data, encode(data)); emit('shared', { from: e && e.currentTarget }); };
    $('#copyBtn').addEventListener('click', copyLink);
    $('#waBtn').addEventListener('click', shared);
    $('#mailBtn').addEventListener('click', shared);
    if (navigator.share) {
      const nb = $('#nativeShareBtn');
      nb.hidden = false;
      nb.addEventListener('click', () => navigator.share({ title: 'Flowers for you 💐', text: shareText(false), url: giftUrl() }).then(() => shared({ currentTarget: nb })).catch(() => {}));
    }
    $('#wallOpt').addEventListener('change', e => { state.wall = e.target.checked; renderSend(); save(); });

    // photos: one for the note (kind "g"), optional faces for the wall (kind "a")
    const pickPhoto = async (file, kind, key, busyEl) => {
      if (!file) return;
      busyEl.hidden = false;
      try {
        const { id, preview } = await Photos.upload(file, kind);
        state[key] = id;
        previews[id] = preview;
        save();
        renderPhotos();
        renderSend();
        if (kind === 'g') toast('Photo added to your note 📷');
      } catch (e) {
        console.warn(e);
        toast(e.userMessage || "The photo couldn't be added. Please try again.");
      } finally { busyEl.hidden = true; }
    };
    $('#giftPhotoInput').addEventListener('change', e => { pickPhoto(e.target.files[0], 'g', 'p', $('#giftPhotoDrop .photo-busy')); e.target.value = ''; });
    $('#giftPhotoRemove').addEventListener('click', () => { state.p = ''; save(); renderPhotos(); renderSend(); });
    $$('#wallFaces .face').forEach(face => {
      const key = face.dataset.who;
      face.querySelector('input').addEventListener('change', e => { pickPhoto(e.target.files[0], 'a', key, face.querySelector('.avatar-busy')); e.target.value = ''; });
      face.querySelector('.face-x').addEventListener('click', () => { state[key] = ''; save(); renderPhotos(); });
    });
    initStemEditing();
    $('#navMini').addEventListener('click', () => $('.preview-card').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }));
    $('#previewBtn').addEventListener('click', () => {
      if (!state.items.length) return;
      sess.set('pp.preview', '1');
      go('#/g/' + encode(giftData()));
    });
  }

  function removeOne(id) {
    const list = ordered();
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].id === id) { state.items = state.items.filter(x => x.uid !== list[i].uid); break; }
    }
    state.touched = true;
    renderAll();
  }

  /* ---------- flower families & colours ---------- */
  let query = ''; // catalog search text
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
  const selOf = fam => (F.BY_ID[state.sel[fam]] && F.BY_ID[state.sel[fam]].fam === fam ? state.sel[fam] : F.FAM_BY_ID[fam].ids[0]);

  // A dot shows the colour as a little lit sphere; striped and two-tone flowers show both colours.
  function dotPaint(f) {
    const c = f.c;
    if (c.flame) return `repeating-linear-gradient(110deg, ${c.base} 0 3px, ${c.flame} 3px 5px)`;
    if (c.accent && f.type === 'parrot') return `conic-gradient(from 30deg, ${c.base} 0 60%, ${c.accent} 60% 75%, ${c.base} 75%)`;
    return `radial-gradient(circle at 35% 30%, ${c.light} 0 18%, ${c.base} 46%, ${c.dark} 100%)`;
  }

  // Updates a family card to its chosen colour (thumb, label, tint and the selected dot).
  function paintCard(card, animate) {
    const fam = card.dataset.fam, id = selOf(fam), f = F.BY_ID[id];
    const thumb = card.querySelector('.thumb');
    if (thumb.dataset.id !== id) {
      thumb.dataset.id = id;
      thumb.innerHTML = F.headThumb(id);
      if (animate && !reduced()) { thumb.classList.remove('swap'); void thumb.offsetWidth; thumb.classList.add('swap'); }
    }
    card.dataset.id = id;
    card.style.setProperty('--tint', lum(f.c.base) > 0.9 ? f.c.dark : f.c.base); // pale flowers tint with their shadow colour
    const many = F.FAM_BY_ID[fam].ids.length > 1;
    card.querySelector('.shade').textContent = many ? f.shade : '';
    card.querySelector('.meaning').textContent = f.meaning;
    card.querySelector('.flower-add').setAttribute('aria-label', `Add a ${f.name}: ${f.meaning}`);
    card.querySelector('.flower-add').title = `${f.name}: ${f.meaning}`;
    card.querySelectorAll('.dot').forEach(d => {
      const on = d.dataset.id === id;
      d.setAttribute('aria-checked', on);
      d.tabIndex = on ? 0 : -1;
    });
  }

  function pickShade(fam, id, animate) {
    if (selOf(fam) === id) return;
    state.sel = { ...state.sel, [fam]: id };
    const card = $(`#catalog .flower[data-fam="${fam}"]`);
    if (card) paintCard(card, animate);
    if (animate) emit('shade-picked', { from: card && card.querySelector('.thumb'), color: F.BY_ID[id].c.base });
    save();
  }

  function addFlower(id, card) {
    if (state.items.length >= maxStems()) {
      const bigger = { s: 'Classic', m: 'Grand', l: 'Lavish' }[state.z] || '';
      toast(bigger ? `A ${sizeOf(state.z).name} holds ${maxStems()} stems. Switch to ${bigger} for more room.` : `A ${sizeOf(state.z).name} bouquet holds up to ${maxStems()} stems.`);
      const sp = $('#sizePick');
      if (bigger && sp) { sp.classList.remove('nudge'); void sp.offsetWidth; sp.classList.add('nudge'); }
      return;
    }
    state.items.push(newItem(id));
    state.touched = true;
    if (card) { card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse'); }
    emit('flower-added', { from: card });
    renderAll();
  }

  // "−" on a card takes back the latest stem of the colour on show, or else of that family.
  function removeFromFamily(fam) {
    const id = selOf(fam);
    if (state.items.some(i => i.id === id)) return removeOne(id);
    const list = ordered().filter(i => F.BY_ID[i.id].fam === fam);
    if (list.length) removeOne(list[list.length - 1].id);
  }

  /* ---------- edit stems right in the bouquet ----------
     Tap a flower: a small menu to recolour, move, add one more or remove it.
     Drag a flower onto another to swap their places (touch: press and hold first, so scrolling still works). */
  let popUid = '';
  const itemOf = uid => state.items.find(i => i.uid === uid);

  function initStemEditing() {
    const svg = $('#builderSvg'), layer = $('.stems', svg), card = $('.preview-card'), pop = $('#stemPop');
    let drag = null, holdTimer = 0;
    const toSvg = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };

    layer.addEventListener('pointerdown', e => {
      const g = e.target.closest('.sg');
      if (!g || g.classList.contains('leaving') || e.button > 0) return;
      const it = itemOf(g.dataset.uid);
      if (!it) return;
      drag = { g, it, x: e.clientX, y: e.clientY, id: e.pointerId, live: false, touch: e.pointerType !== 'mouse', target: null };
      if (drag.touch) holdTimer = setTimeout(startDrag, 280);
    });
    function startDrag() {
      if (!drag || drag.live) return;
      drag.live = true;
      closePop();
      layer.appendChild(drag.g); // lift it above its neighbours
      drag.g.classList.add('dragging');
      card.classList.add('editing');
      if (drag.touch && navigator.vibrate) navigator.vibrate(10);
    }
    addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const moved = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
      if (!drag.live) {
        if (drag.touch) { if (moved > 10) { clearTimeout(holdTimer); drag = null; } return; } // it was a scroll
        if (moved < 5) return;
        startDrag();
      }
      const p = toSvg(e), G = F.G;
      const a = Math.max(-64, Math.min(64, (Math.atan2(p.x - G.x, G.y - p.y) * 180) / Math.PI));
      const r = Math.max(110, Math.min(330, Math.hypot(p.x - G.x, G.y - p.y)));
      F.applyPos(drag.g, drag.it.id, { ...posOf[drag.it.uid], a, r });
      let best = null, bd = Infinity;
      $$('.sg:not(.leaving)', layer).forEach(o => {
        if (o === drag.g) return;
        const b = o.querySelector('.bloom').getBoundingClientRect();
        const d = Math.hypot(b.left + b.width / 2 - e.clientX, b.top + b.height / 2 - e.clientY);
        if (d < bd) { bd = d; best = o; }
      });
      const near = bd < 64 ? best : null;
      if (near !== drag.target) {
        if (drag.target) drag.target.classList.remove('drop-target');
        if (near) near.classList.add('drop-target');
        drag.target = near;
      }
    });
    // while a stem is lifted on a touch screen, the finger moves the stem, not the page
    svg.addEventListener('touchmove', e => { if (drag && drag.live) e.preventDefault(); }, { passive: false });
    svg.addEventListener('contextmenu', e => { if (drag) e.preventDefault(); });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      clearTimeout(holdTimer);
      const d = drag;
      drag = null;
      const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y);
      if (!d.live || moved < 8) {
        if (d.live) { d.g.classList.remove('dragging'); card.classList.remove('editing'); renderPreview(); }
        if (e.type === 'pointerup') openPop(d.it.uid);
        return;
      }
      d.g.classList.remove('dragging');
      card.classList.remove('editing');
      if (d.target) d.target.classList.remove('drop-target');
      const other = d.target && e.type === 'pointerup' ? itemOf(d.target.dataset.uid) : null;
      if (other) {
        [d.it.k, other.k] = [other.k, d.it.k];
        state.touched = true;
        emit('stems-swapped', { from: d.target });
      }
      renderPreview();
      save();
    };
    addEventListener('pointerup', end);
    addEventListener('pointercancel', end);

    pop.querySelector('.sp-x').addEventListener('click', closePop);
    pop.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      const it = itemOf(popUid);
      if (!b || !it) return;
      const act = b.dataset.act;
      if (act === 'del') { closePop(); removeItem(it.uid); return; }
      if (act === 'dup') { addFlower(it.id, null); return; }
      // move: swap with the nearest stem on that side
      const mine = posOf[it.uid].a, dir = act === 'left' ? -1 : 1;
      let best = null;
      state.items.forEach(o => {
        const p = posOf[o.uid];
        if (o === it || !p || (p.a - mine) * dir <= 0) return;
        if (!best || Math.abs(p.a - mine) < Math.abs(posOf[best.uid].a - mine)) best = o;
      });
      if (!best) { toast(`That's already the ${act === 'left' ? 'left' : 'right'}most flower.`); return; }
      [it.k, best.k] = [best.k, it.k];
      state.touched = true;
      renderPreview(); save();
      markPicked();
    });
    document.addEventListener('pointerdown', e => { if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('#builderSvg .sg')) closePop(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) closePop(); });
  }

  function openPop(uid) {
    const it = itemOf(uid), pop = $('#stemPop');
    if (!it) return;
    popUid = uid;
    const f = F.BY_ID[it.id], fam = F.FAM_BY_ID[f.fam];
    pop.querySelector('.sp-thumb').innerHTML = F.headThumb(it.id);
    pop.querySelector('strong').textContent = f.name;
    pop.querySelector('small').textContent = f.meaning;
    const dots = pop.querySelector('.sp-dots');
    dots.innerHTML = '';
    dots.hidden = fam.ids.length < 2;
    fam.ids.forEach(id => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot';
      d.setAttribute('role', 'radio');
      d.setAttribute('aria-checked', id === it.id);
      d.setAttribute('aria-label', F.BY_ID[id].shade);
      d.title = F.BY_ID[id].name;
      d.style.background = dotPaint(F.BY_ID[id]);
      d.addEventListener('click', () => recolorItem(popUid, id));
      dots.appendChild(d);
    });
    const wasHidden = pop.hidden;
    pop.hidden = false;
    if (wasHidden && !reduced()) { pop.classList.remove('pop-in'); void pop.offsetWidth; pop.classList.add('pop-in'); }
    markPicked();
  }
  function closePop() {
    popUid = '';
    $('#stemPop').hidden = true;
    markPicked();
  }
  function markPicked() {
    $$('#builderSvg .sg').forEach(g => g.classList.toggle('picked', !!popUid && g.dataset.uid === popUid));
  }
  // A new colour blooms in the same spot: the stem keeps its place, the head is replaced.
  function recolorItem(uid, id) {
    const it = itemOf(uid);
    if (!it || it.id === id) return;
    const fresh = newItem(id, it.k);
    state.items = state.items.map(x => (x.uid === uid ? fresh : x));
    state.touched = true;
    renderAll();
    openPop(fresh.uid);
    emit('shade-picked', { from: $(`#builderSvg .sg[data-uid="${fresh.uid}"] .head`), color: F.BY_ID[id].c.base });
  }
  function removeItem(uid) {
    state.items = state.items.filter(x => x.uid !== uid);
    state.touched = true;
    renderAll();
  }

  // Search matches a family name, a colour, a flower's name or its meaning.
  function flowerMatches(f) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const fam = F.FAM_BY_ID[f.fam].name;
    const color = F.COLORS.find(c => c.id === f.color).name;
    const hay = `${f.name} ${fam} ${f.meaning} ${f.mood} ${color}`.toLowerCase();
    // "roses" finds roses, "lilies" finds lilies
    return q.split(/\s+/).every(w => hay.includes(w) || (w.length > 3 && hay.includes(w.replace(/(ies|es|s)$/, m => (m === 'ies' ? 'y' : '')))));
  }

  function shareText(withUrl = true) {
    const name = state.t.trim();
    return `${name ? name + ', ' : ''}I sent you flowers 💐 Open them here:${withUrl ? ' ' + giftUrl() : ''}`;
  }

  async function copyLink() {
    if (!state.items.length || !namesOk()) return;
    const url = giftUrl();
    let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; } catch {
      const i = $('#linkOut'); i.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
    }
    const b = $('#copyBtn');
    if (ok) {
      b.classList.add('copied'); b.querySelector('.lbl').textContent = 'Copied ✓';
      const data = giftData();
      Wall.record(data, encode(data));
      burstFrom(b, 18);
      emit('shared', { from: b });
      setTimeout(() => { b.classList.remove('copied'); b.querySelector('.lbl').textContent = 'Copy link'; }, 1800);
    } else toast('Copy failed. Select the link and copy it manually.');
  }

  // Both names are required before a bouquet can be sent: the envelope shows who it's for,
  // and the note is signed by who it's from.
  const namesOk = () => !!(state.t.trim() && state.f.trim());
  function showNameErrors(shake) {
    let first = null;
    [['to', state.t], ['from', state.f]].forEach(([k, v]) => {
      const field = $(`#${k}Field`), bad = !v.trim();
      field.classList.toggle('invalid', bad);
      $(`#${k}Err`).hidden = !bad;
      $(`#${k}Input`).setAttribute('aria-invalid', bad);
      if (bad && shake) { field.classList.remove('shake'); void field.offsetWidth; field.classList.add('shake'); }
      if (bad && !first) first = $(`#${k}Input`);
    });
    return first;
  }

  function goStep(n) {
    if (n === 4 && state.items.length && !namesOk()) {
      // send needs both names: go to the note step and point at what's missing
      if (state.step !== 3) { state.step = 3; save(); renderSteps(true); }
      const first = showNameErrors(true);
      toast('Add both names to send your flowers.');
      setTimeout(() => first && first.focus(), reduced() ? 0 : 320);
      return;
    }
    const prev = state.step;
    state.step = n;
    save();
    renderSteps(n < prev);
    if (innerWidth <= 960) $('.panel').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- render ---------- */
  const settleTimers = new WeakMap();
  const posOf = {}; // where each stem was last laid out, by uid
  let miniTimer = 0;
  function renderPreview() {
    const svg = $('#builderSvg'), layer = $('.stems', svg);
    const list = ordered();
    const pos = F.layout(list.map(i => i.id), state.s, state.z);
    F.setSize(svg, state.z);
    $('.preview-card').dataset.size = state.z;
    const present = new Set(list.map(i => i.uid));
    $$('.sg', layer).forEach(g => {
      if (!present.has(g.dataset.uid) && !g.classList.contains('leaving')) {
        g.classList.add('leaving');
        setTimeout(() => g.remove(), reduced() ? 0 : 420);
      }
    });
    let delay = 0;
    F.drawOrder(pos).forEach(idx => {
      const it = list[idx], p = pos[idx];
      posOf[it.uid] = p;
      const g = layer.querySelector(`.sg[data-uid="${it.uid}"]:not(.leaving)`);
      if (g) { F.applyPos(g, it.id, p); return; }
      layer.insertAdjacentHTML('beforeend', F.stemMarkup(it.id, p, { uid: it.uid, animate: true, delay }));
      const ng = layer.lastElementChild;
      delay += 0.09;
      clearTimeout(settleTimers.get(ng));
      settleTimers.set(ng, setTimeout(() => ng.classList.remove('enter'), (delay + 1.7) * 1000));
    });
    F.recolor(svg, state.w, state.r);
    $('#emptyHint').classList.toggle('gone', list.length > 0);
    $('#editTip').hidden = list.length < 2;
    $('#navMiniCount').textContent = `${list.length}/${maxStems()}`;
    clearTimeout(miniTimer);
    miniTimer = setTimeout(() => ($('#navMini svg').innerHTML = list.length ? F.bouquetSVG(list.map(i => i.id), { size: state.z, w: state.w, r: state.r, seed: state.s }) : ''), 120);
    if (popUid && !present.has(popUid)) closePop();
    else markPicked();
    const n = list.length;
    $('#stemCount').textContent = `${sizeOf(state.z).name} · ${n} ${n === 1 ? 'stem' : 'stems'} of ${maxStems()}`;
    const meter = $('#stemMeter');
    if (meter) meter.style.setProperty('--fill', String(Math.min(1, n / maxStems())));
  }

  function renderCatalog() {
    const counts = {}, famCounts = {};
    state.items.forEach(i => {
      counts[i.id] = (counts[i.id] || 0) + 1;
      const fam = F.BY_ID[i.id].fam;
      famCounts[fam] = (famCounts[fam] || 0) + 1;
    });
    $$('#catalog .flower').forEach(c => {
      const n = famCounts[c.dataset.fam] || 0;
      c.classList.toggle('has', n > 0);
      c.querySelector('.count').textContent = n;
      paintCard(c, false);
      c.querySelectorAll('.dot').forEach(d => d.classList.toggle('in', !!counts[d.dataset.id])); // colours already in the bouquet
    });
    const chosen = $('#chosen');
    chosen.innerHTML = '';
    const ids = Object.keys(counts);
    if (!ids.length) { chosen.innerHTML = '<span class="empty">No flowers yet. Tap one below to start.</span>'; }
    ids.forEach(id => {
      const f = F.BY_ID[id];
      const p = document.createElement('span');
      p.className = 'pill';
      p.innerHTML = `${F.headThumb(id)}<span>${f.name}</span><b>×${counts[id]}</b><button type="button" aria-label="Remove one ${f.name}">×</button>`;
      p.querySelector('button').addEventListener('click', () => removeOne(id));
      chosen.appendChild(p);
    });
    measureChosen();
    const pb = $('#presetBtn');
    pb.hidden = !state.o || !state.touched;
    if (state.o) pb.textContent = `↺ Use ${OCC[state.o].label} bouquet`;
  }

  function renderSwatches() {
    $$('#wrapSwatches .swatch').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === state.w));
    $$('#ribbonSwatches .swatch').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === state.r));
    $$('#occasionChoices .occasion').forEach(b => b.setAttribute('aria-pressed', b.dataset.occasion === state.o));
  }

  function renderTag(bump) {
    const tag = $('#previewTag');
    $('#tagName').textContent = state.t.trim() || 'someone special';
    if (bump && !reduced()) { tag.classList.remove('bump'); void tag.offsetWidth; tag.classList.add('bump'); }
  }

  function renderCount() {
    const n = state.m.length, el = $('#msgCount');
    el.textContent = `${n} / 280`;
    el.classList.toggle('near', n > 250);
  }

  function renderFields() {
    const set = (id, v) => { const el = $(id); if (el.value !== v) el.value = v; };
    set('#toInput', state.t); set('#fromInput', state.f); set('#msgInput', state.m); set('#dateInput', state.d);
    if (state.d) $('#surpriseBox').open = true;
    renderCount();
  }

  function renderSend() {
    const n = state.items.length;
    const warn = $('#sendWarn');
    const ok = n > 0 && namesOk();
    $('#linkBox').classList.toggle('disabled', !ok);
    $('#shareGrid').classList.toggle('disabled', !ok);
    if (!n) {
      warn.hidden = false;
      warn.innerHTML = '<span>Your bouquet is empty. Add at least one flower.</span><button class="chip-btn" type="button">Pick flowers</button>';
      warn.querySelector('button').onclick = () => goStep(1);
      $('#linkOut').value = '';
    } else if (!ok) {
      const missing = !state.t.trim() && !state.f.trim() ? 'both names' : !state.t.trim() ? 'their name' : 'your name';
      warn.hidden = false;
      warn.innerHTML = `<span>Add ${missing} to get your link.</span><button class="chip-btn" type="button">Add ${missing === 'both names' ? 'names' : 'name'}</button>`;
      warn.querySelector('button').onclick = () => goStep(4);
      $('#linkOut').value = '';
    } else warn.hidden = true;
    if (ok) $('#linkOut').value = giftUrl();

    const w = F.WRAPS[state.w].name, r = F.RIBBONS[state.r].name;
    const when = state.d ? ` It will open on ${new Date(state.d + 'T00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.` : '';
    $('#sendSummary').textContent = `${n} ${n === 1 ? 'stem' : 'stems'}, ${w.toLowerCase()} paper and a ${r.toLowerCase()} ribbon${state.t.trim() ? ` for ${state.t.trim()}` : ''}.${when}`;
    const consent = $('#wallConsent'), opt = $('#wallOpt');
    consent.hidden = !Wall.on();
    if (Wall.on()) {
      const to = Wall.firstName(state.t), from = Wall.firstName(state.f) || 'Someone';
      opt.checked = state.wall;
      opt.disabled = !to;
      $('#wallConsentLabel').classList.toggle('off', !to);
      $('#wallPreview').textContent = to
        ? `Shows “${from} → ${to}”, the occasion and the flowers. First names only. Your note stays private.`
        : 'Add their name in the Note step to join the wall.';
      $('#wallFaces').hidden = !(state.wall && to);
      const initials = { ps: from, pr: to };
      $$('#wallFaces .face').forEach(face => {
        face.querySelector('.initial').textContent = ((initials[face.dataset.who] || '?').match(/\p{L}/u) || ['?'])[0].toUpperCase();
      });
    }
    // the share links only exist once the bouquet can really be sent (flowers + both names)
    [['#waBtn', 'https://wa.me/?text=' + encodeURIComponent(shareText())],
     ['#mailBtn', `mailto:?subject=${encodeURIComponent('I sent you flowers 💐')}&body=${encodeURIComponent(shareText())}`]].forEach(([sel, href]) => {
      const a = $(sel);
      if (ok) { a.href = href; a.removeAttribute('aria-disabled'); a.tabIndex = 0; }
      else { a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); a.tabIndex = -1; }
    });
    $$('#shareGrid button').forEach(b => (b.disabled = !ok));
  }

  let sentCheer = '';
  function renderSteps(fromLeft) {
    const n = state.step;
    $$('.step').forEach(s => {
      const on = +s.dataset.step === n;
      if (on && !s.classList.contains('active')) { s.classList.toggle('from-left', !!fromLeft); }
      s.classList.toggle('active', on);
    });
    $$('#stepper [data-goto]').forEach(b => {
      const i = +b.dataset.goto;
      b.toggleAttribute('aria-current', false);
      if (i === n) b.setAttribute('aria-current', 'step');
      b.classList.toggle('done', i < n);
    });
    $('#progressBar').style.width = `${(n / 4) * 100}%`;
    $('.builder').dataset.step = n;
    const ready = state.items.length + '|' + state.t + '|' + state.f;
    if (n === 4 && sentCheer !== ready && namesOk() && state.items.length) {
      sentCheer = ready; // a small celebration when the bouquet is ready to go
      setTimeout(() => burstFrom($('.step[data-step="4"] h2'), 22), reduced() ? 0 : 380);
    }
    if (n === 1) requestAnimationFrame(measureChosen);
    $('#backBtn').textContent = n === 0 ? 'Home' : 'Back';
    const next = $('#nextBtn');
    next.hidden = n === 4;
    next.textContent = ['Choose flowers', 'Wrap it up', 'Write a note', 'Get my link'][n] || 'Next';
  }

  // A photo that can't be loaded (e.g. removed by the site owner) is dropped quietly.
  function forgetPhoto(key) {
    if (!state[key]) return;
    state[key] = '';
    save();
    renderPhotos();
  }

  function renderPhotos() {
    const on = Wall.on();
    $('#giftPhotoPreview').onerror = () => forgetPhoto('p');
    $('#previewPhoto img').onerror = () => forgetPhoto('p');
    $$('#wallFaces .face').forEach(face => { face.querySelector('img').onerror = () => forgetPhoto(face.dataset.who); });
    $('#giftPhotoField').hidden = !on;
    const src = id => previews[id] || Photos.url(id === state.p ? 'g' : 'a', id);
    const gImg = $('#giftPhotoPreview'), has = on && Photos.valid(state.p);
    gImg.hidden = !has;
    if (has && gImg.getAttribute('src') !== src(state.p)) gImg.src = src(state.p);
    $('#giftPhotoDrop').classList.toggle('has', has);
    $('#giftPhotoRemove').hidden = !has;
    const pv = $('#previewPhoto');
    pv.hidden = !has;
    if (has) { const im = pv.querySelector('img'); if (im.getAttribute('src') !== src(state.p)) im.src = src(state.p); }
    $$('#wallFaces .face').forEach(face => {
      const id = state[face.dataset.who], img = face.querySelector('img'), ok = on && Photos.valid(id);
      img.hidden = !ok;
      if (ok && img.getAttribute('src') !== src(id)) img.src = src(id);
      face.querySelector('.initial').hidden = ok;
      face.querySelector('.face-x').hidden = !ok;
      face.classList.toggle('has', ok);
    });
  }

  // Big bouquets: keep the picked list to two lines so the catalog stays in view.
  // Measured only while the Flowers step is visible (hidden elements measure as zero).
  function measureChosen() {
    const chosen = $('#chosen'), more = $('#chosenMore');
    if (!chosen || !chosen.offsetParent) return;
    const kinds = chosen.querySelectorAll('.pill').length;
    chosen.classList.remove('clipped');
    chosen.classList.toggle('collapsed', !chosenOpen);
    const overflowing = chosen.scrollHeight > chosen.clientHeight + 4;
    chosen.classList.toggle('clipped', !chosenOpen && overflowing);
    more.hidden = !(overflowing || (chosenOpen && kinds > 6));
    more.textContent = chosenOpen ? 'Show less' : `Show all ${kinds} kinds`;
    more.setAttribute('aria-expanded', chosenOpen);
  }

  // Small icon for each size: a cone with 3, 5 or 7 blooms on longer and longer stems.
  function sizeIcon(z) {
    const c = { s: { r: 8, n: 3, top: 25 }, m: { r: 12, n: 5, top: 15 }, l: { r: 16, n: 7, top: 5 }, x: { r: 20, n: 9, top: -2 } }[z];
    let stems = '', dots = '';
    for (let i = 0; i < c.n; i++) {
      const t = c.n === 1 ? 0 : (i / (c.n - 1)) * 2 - 1, x = 24 + t * c.r, y = c.top + 6 + t * t * 6;
      stems += `M24,40 L${x.toFixed(1)},${y.toFixed(1)} `;
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.3"/>`;
    }
    return `<svg class="size-ico" viewBox="0 0 48 56" aria-hidden="true"><path class="st" d="${stems}"/>${dots}<path class="cone" d="M13,35 L24,53 L35,35 Z"/></svg>`;
  }

  // Changing size keeps everything that fits; extra stems wait "aside" and come back
  // automatically when a bigger size is picked again.
  function chooseSize(z, btn) {
    if (!F.SIZES[z] || z === state.z) return;
    const max = sizeOf(z).max;
    let moved = 0, restored = 0;
    if (state.items.length > max) {
      const keep = state.items.slice(0, max), extra = state.items.slice(max);
      state.aside = [...extra.map(i => i.id), ...state.aside].slice(0, MAX_ALL);
      state.items = keep;
      moved = extra.length;
    } else if (state.aside.length) {
      const room = max - state.items.length;
      const back = state.aside.slice(0, room);
      state.aside = state.aside.slice(room);
      back.forEach(id => state.items.push(newItem(id)));
      restored = back.length;
    }
    state.z = z;
    renderAll();
    emit('size-changed', { z, from: btn });
    const name = sizeOf(z).name;
    if (moved) toast(`${name} holds ${max} stems, so ${moved} ${moved === 1 ? 'stem waits' : 'stems wait'} aside. Pick a bigger size to bring ${moved === 1 ? 'it' : 'them'} back.`);
    else if (restored) toast(`Welcome back: ${restored} ${restored === 1 ? 'stem' : 'stems'} returned to your ${name} bouquet.`);
  }

  function renderSize() {
    $$('#sizePick .size-opt').forEach(b => {
      const on = b.dataset.size === state.z;
      b.setAttribute('aria-checked', on);
      b.tabIndex = on ? 0 : -1;
    });
    $('#flowersHint').textContent = `Pick a colour, then tap a flower to add it. Up to ${maxStems()} stems for a ${sizeOf(state.z).name}.`;
  }

  // Colour, mood and search narrow the catalog together. Within a filter you can pick several
  // values (pink + white); a card keeps only the colours that fit and hides when none do.
  const filtersOn = () => state.colors.length + state.moods.length + (query.trim() ? 1 : 0);
  const fitsFilters = f => (!state.colors.length || state.colors.includes(f.color)) && (!state.moods.length || state.moods.includes(f.mood)) && flowerMatches(f);

  function renderFilters(animate) {
    $$('#colorFilter .color-chip').forEach(b => b.setAttribute('aria-pressed', state.colors.includes(b.dataset.color)));
    $$('#moodFilter .mood-chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.mood === 'all' ? !state.moods.length : state.moods.includes(b.dataset.mood)));
    let i = 0, kinds = 0, flowers = 0;
    $$('#catalog .flower').forEach(card => {
      const fam = card.dataset.fam;
      const fits = F.FAM_BY_ID[fam].ids.filter(id => fitsFilters(F.BY_ID[id]));
      const show = fits.length > 0;
      card.querySelectorAll('.dot').forEach(d => (d.hidden = !fits.includes(d.dataset.id)));
      if (show && !fits.includes(selOf(fam))) pickShade(fam, fits[0], false);
      const was = !card.hidden;
      card.hidden = !show;
      card.classList.toggle('one-left', F.FAM_BY_ID[fam].ids.length > 1 && fits.length === 1);
      if (show) { kinds++; flowers += fits.length; }
      if (show && animate && !reduced() && (!was || i < 14)) {
        card.style.setProperty('--fi', Math.min(i++, 14));
        card.classList.remove('flower-in'); void card.offsetWidth; card.classList.add('flower-in');
      } else if (!was && show) card.classList.remove('flower-in');
    });

    // the summary line and a removable chip for every filter in use
    const box = $('#appliedFilters');
    box.innerHTML = '';
    const count = document.createElement('span');
    count.className = 'applied-count';
    count.textContent = filtersOn() ? `${flowers} ${flowers === 1 ? 'flower' : 'flowers'} in ${kinds} ${kinds === 1 ? 'kind' : 'kinds'}` : `All ${F.CATALOG.length} flowers in ${F.FAMILIES.length} kinds`;
    box.appendChild(count);
    const chip = (label, sw, off) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'applied-chip';
      b.innerHTML = `${sw ? `<i style="background:${sw}"></i>` : ''}<span></span><b aria-hidden="true">×</b>`;
      b.querySelector('span').textContent = label;
      b.setAttribute('aria-label', `Remove filter: ${label}`);
      b.addEventListener('click', () => { off(); save(); renderFilters(true); });
      box.appendChild(b);
    };
    state.colors.forEach(id => { const c = F.COLORS.find(x => x.id === id); chip(c.name, c.sw, () => (state.colors = state.colors.filter(x => x !== id))); });
    state.moods.forEach(id => chip(F.MOODS.find(x => x.id === id).name, '', () => (state.moods = state.moods.filter(x => x !== id))));
    if (query.trim()) chip(`“${query.trim()}”`, '', () => { query = ''; $('#flowerSearch').value = ''; });
    if (filtersOn() > 1) {
      const all = document.createElement('button');
      all.type = 'button';
      all.className = 'applied-clear';
      all.textContent = 'Clear all';
      all.addEventListener('click', clearFilters);
      box.appendChild(all);
    }
    $('#filterJump').querySelector('b').textContent = filtersOn() || '';

    const none = $('#catalogEmpty');
    none.hidden = kinds > 0;
    if (!kinds) {
      none.innerHTML = '<span></span><button type="button" class="chip-btn">Clear filters</button>';
      none.firstChild.textContent = query.trim() ? `No flowers match “${query.trim()}” with these filters.` : 'No flowers match these filters.';
      none.querySelector('button').addEventListener('click', clearFilters);
    }
  }

  function clearFilters() {
    state.colors = []; state.moods = []; query = '';
    $('#flowerSearch').value = '';
    save();
    renderFilters(true);
  }

  function renderAll() {
    renderPreview(); renderSize(); renderFilters(false); renderCatalog(); renderSwatches(); renderTag(false); renderFields(); renderPhotos(); renderSend(); renderSteps(false);
    save();
  }

  /* ================= GIFT ================= */
  let gift = null, typeToken = 0, cdTimer = 0;

  function showGift(code) {
    clearInterval(cdTimer);
    typeToken++;
    try { gift = sanitize(decode(code)); } catch { gift = null; }
    const stage = $('#envelopeStage'), reveal = $('#reveal'), broken = $('#brokenGift'), env = $('#envelope');
    $('#backToEdit').hidden = sess.get('pp.preview') !== '1';
    reveal.hidden = true;
    reveal.querySelector('.reveal-side').classList.remove('done');
    if (!gift || !gift.b.length) { stage.hidden = true; broken.hidden = false; return; }
    broken.hidden = true;
    stage.hidden = false;
    stage.classList.remove('gone');
    env.classList.remove('opening', 'locked');
    const to = gift.t || 'you';
    $('#envTo').textContent = to;
    $('#envLetterName').textContent = to;
    $('#envKicker').textContent = gift.f ? `${gift.f} sent you flowers` : "You've got flowers";
    document.title = gift.f ? `${gift.f} sent you flowers 💐` : 'Someone sent you flowers 💐';
    const seal = $('#seal');
    seal.disabled = false;

    if (gift.d && gift.d > todayStr()) {
      env.classList.add('locked');
      $('#envHint').textContent = `This bouquet opens on ${new Date(gift.d + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`;
      const cd = $('#countdown');
      cd.hidden = false;
      const target = new Date(gift.d + 'T00:00').getTime();
      const tick = () => {
        let ms = target - Date.now();
        if (ms <= 0) { clearInterval(cdTimer); cd.hidden = true; env.classList.remove('locked'); $('#envHint').textContent = "It's time! Tap the seal to open"; return; }
        const d = Math.floor(ms / 864e5); ms -= d * 864e5;
        const h = Math.floor(ms / 36e5); ms -= h * 36e5;
        const m = Math.floor(ms / 6e4); const s = Math.floor((ms - m * 6e4) / 1000);
        cd.innerHTML = [[d, 'days'], [h, 'hours'], [m, 'min'], [s, 'sec']].map(([v, l]) => `<div><b>${String(v).padStart(2, '0')}</b><small>${l}</small></div>`).join('');
      };
      tick();
      cdTimer = setInterval(tick, 1000);
    } else {
      $('#countdown').hidden = true;
      $('#envHint').textContent = 'Tap the seal to open';
    }
  }

  async function openEnvelope() {
    const env = $('#envelope');
    if (!gift || env.classList.contains('opening')) return;
    if (env.classList.contains('locked')) {
      env.classList.remove('shake'); void env.offsetWidth; env.classList.add('shake');
      toast('Patience. This one is still a surprise 🌱');
      return;
    }
    $('#seal').disabled = true;
    env.classList.add('opening');
    await sleep(500);
    burstFrom(env, 60);
    await sleep(900);
    $('#envelopeStage').classList.add('gone');
    await sleep(600);
    $('#envelopeStage').hidden = true;
    playReveal();
  }

  async function playReveal() {
    const my = ++typeToken;
    const reveal = $('#reveal'), side = reveal.querySelector('.reveal-side');
    reveal.hidden = false;
    side.classList.remove('done');
    const svg = $('#giftSvg');
    svg.classList.remove('anim');
    svg.innerHTML = F.bouquetSVG(gift.b, { size: gift.z, w: gift.w, r: gift.r, seed: gift.s, animate: true, delay: 0.3 });
    void svg.getBoundingClientRect();
    svg.classList.add('anim');
    const card = $('#noteCard');
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    const growTime = 0.3 + gift.b.length * (gift.b.length > 14 ? 0.08 : 0.13) + 1.2;
    card.style.setProperty('--cd', `${Math.min(growTime, 2.2)}s`);

    $('#noteTo').textContent = gift.t || 'you';
    const occ = OCC[gift.o], chipEl = $('#giftOccasion');
    chipEl.hidden = !occ;
    if (occ) chipEl.textContent = `${occ.emoji} ${{ love: 'With love', birthday: 'Happy birthday', thanks: 'Thank you', sorry: "I'm sorry", getwell: 'Get well soon', congrats: 'Congratulations', sympathy: 'Thinking of you', just: 'Just because' }[gift.o] || occ.label}`;
    $('#noteFrom').textContent = gift.f || 'someone who cares';
    const fig = $('#notePhoto'), pimg = $('#notePhotoImg'), psrc = Photos.url('g', gift.p);
    fig.hidden = true;
    fig.classList.remove('pinned');
    if (psrc) {
      pimg.alt = `Photo from ${gift.f || 'the sender'}`;
      const show = () => { fig.hidden = false; void fig.offsetWidth; fig.classList.add('pinned'); };
      pimg.onload = show;
      pimg.onerror = () => { fig.hidden = true; };
      if (pimg.src === psrc && pimg.complete && pimg.naturalWidth) show(); else pimg.src = psrc;
    }
    const from = $('#noteFromWrap');
    from.classList.remove('show');
    const msgEl = $('#noteMsg');
    msgEl.textContent = '';
    if (innerWidth <= 960) setTimeout(() => svg.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }), 50);

    // meanings
    const ml = $('#meaningList');
    ml.innerHTML = '<p class="sr-only">What these flowers mean:</p>';
    [...new Set(gift.b)].forEach((id, i) => {
      const f = F.BY_ID[id];
      const el = document.createElement('div');
      el.className = 'm-item';
      el.style.animationDelay = `${i * 0.08}s`;
      el.innerHTML = `${F.headThumb(id)}<div><strong>${f.name}</strong><small>${f.meaning}</small></div>`;
      ml.appendChild(el);
    });

    setTimeout(() => { if (my === typeToken) emit('bloomed', { art: $('.reveal-art') }); }, Math.min(growTime, 2.6) * 1000);
    await sleep(Math.min(growTime, 2.2) * 1000 + 600);
    if (my !== typeToken) return;
    const text = gift.m || 'Thinking of you. 💐';
    if (reduced()) msgEl.textContent = text;
    else {
      msgEl.classList.add('typing');
      for (const ch of text) {
        if (my !== typeToken) return;
        msgEl.textContent += ch;
        await sleep(/[.,!?]/.test(ch) ? 170 : ch === ' ' ? 30 : 34);
      }
      msgEl.classList.remove('typing');
    }
    from.classList.add('show');
    await sleep(400);
    if (my !== typeToken) return;
    side.classList.add('done');
    emit('note-done', { card: $('#noteCard') });
    Petals.burst(innerWidth / 2, innerHeight * 0.35, 30);
  }

  async function saveKeepsake() {
    if (!gift) return;
    const btn = $('#keepsakeBtn');
    btn.disabled = true;
    try {
      await document.fonts?.ready;
      const svgStr = F.bouquetSVG(gift.b, { size: gift.z, w: gift.w, r: gift.r, seed: gift.s, standalone: true, width: 780 });
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
      await img.decode();
      const W = 1080, H = 1350, c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d');
      const bg = x.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#FDE9E6'); bg.addColorStop(0.6, '#F8D8D1'); bg.addColorStop(1, '#F4E6D2');
      x.fillStyle = bg; x.fillRect(0, 0, W, H);
      const halo = x.createRadialGradient(W / 2, 360, 20, W / 2, 360, 420);
      halo.addColorStop(0, 'rgba(255,248,236,.95)'); halo.addColorStop(1, 'rgba(255,248,236,0)');
      x.fillStyle = halo; x.fillRect(0, 0, W, 800);
      x.drawImage(img, 235, 34, 610, 719); // keeps the 390:460 bouquet frame
      // the sender's photo as a tilted polaroid (needs CORS, which Supabase public storage allows)
      const psrc = Photos.url('g', gift.p);
      if (psrc) {
        try {
          const ph = new Image();
          ph.crossOrigin = 'anonymous';
          ph.referrerPolicy = 'no-referrer';
          ph.src = psrc;
          await ph.decode();
          const S = 250, pad = 14;
          const s = Math.min(ph.naturalWidth, ph.naturalHeight);
          x.save();
          x.translate(70 + (S + pad * 2) / 2, 470 + (S + pad * 2 + 40) / 2);
          x.rotate(-0.12);
          x.shadowColor = 'rgba(80,30,40,.25)'; x.shadowBlur = 24; x.shadowOffsetY = 10;
          x.fillStyle = '#fff';
          x.fillRect(-(S / 2 + pad), -(S / 2 + pad + 20), S + pad * 2, S + pad * 2 + 40);
          x.shadowColor = 'transparent';
          x.drawImage(ph, (ph.naturalWidth - s) / 2, (ph.naturalHeight - s) / 2, s, s, -S / 2, -S / 2 - 20, S, S);
          x.restore();
        } catch (e) { console.warn('keepsake photo skipped', e); }
      }
      // card
      x.fillStyle = '#FFFDF9';
      x.shadowColor = 'rgba(110,40,55,.18)'; x.shadowBlur = 40; x.shadowOffsetY = 14;
      x.beginPath(); x.roundRect ? x.roundRect(80, 790, W - 160, 500, 18) : x.rect(80, 790, W - 160, 500); x.fill();
      x.shadowColor = 'transparent';
      x.fillStyle = '#2A1F24'; x.textAlign = 'center';
      x.font = '600 50px Fraunces, Georgia, serif';
      x.fillText(`For ${gift.t || 'you'}`, W / 2, 870);
      x.font = '42px Caveat, cursive';
      const words = (gift.m || 'Thinking of you.').split(/\s+/), lines = [];
      let line = '';
      words.forEach(w => { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > W - 260) { lines.push(line); line = w; } else line = t; });
      if (line) lines.push(line);
      const shown = lines.slice(0, 6);
      if (lines.length > 6) shown[5] = shown[5].replace(/\s*\S*$/, '…');
      shown.forEach((l, i) => x.fillText(l, W / 2, 945 + i * 50));
      x.fillStyle = '#A92E45'; x.font = '700 40px Caveat, cursive';
      x.fillText(`— ${gift.f || 'someone who cares'}`, W / 2, 945 + shown.length * 50 + 30);
      x.fillStyle = '#76666C'; x.font = '500 22px "DM Sans", sans-serif';
      x.fillText('✿ Petal Post', W / 2, H - 22);
      const blob = await new Promise(r => c.toBlob(r, 'image/png'));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `flowers-for-${(gift.t || 'you').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'you'}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      toast('Keepsake saved 🌸');
    } catch (e) {
      console.error(e);
      toast("Couldn't create the image on this browser.");
    } finally { btn.disabled = false; }
  }

  function initGift() {
    $('#seal').addEventListener('click', openEnvelope);
    $('#envelope').addEventListener('click', e => { if (!e.target.closest('.seal')) openEnvelope(); });
    $('#replayBtn').addEventListener('click', () => playReveal());
    $('#keepsakeBtn').addEventListener('click', saveKeepsake);
    $('#sendBackBtn').addEventListener('click', () => {
      sess.del('pp.preview');
      state = blankState();
      state.t = gift?.f || ''; state.f = gift?.t && gift.t !== 'You' ? gift.t : '';
      applyOccasion('thanks', true);
      state.step = 1;
      save();
      go('#/create');
      setTimeout(() => toast(state.t ? `Replying to ${state.t}. Pick some flowers 🌷` : 'Pick some flowers to send back 🌷'), 400);
    });
    $('#backToEdit').addEventListener('click', () => { sess.del('pp.preview'); go('#/create'); });
  }

  /* ================= routing ================= */
  function go(hash) {
    if (location.hash === hash) route(); else location.hash = hash;
  }
  function swapView(id) {
    $$('.view').forEach(v => (v.hidden = v.id !== id));
    scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }
  function route() {
    const h = location.hash || '#/';
    const run = () => {
      emit('view', { name: h.startsWith('#/g/') ? 'gift' : h.startsWith('#/wall') ? 'wall' : h.startsWith('#/create') ? 'create' : 'home' });
      if (h.startsWith('#/g/')) {
        Wall.show(null);
        swapView('view-gift');
        showGift(h.slice(4));
      } else if (h.startsWith('#/wall') && Wall.on()) {
        clearInterval(cdTimer); typeToken++;
        swapView('view-wall');
        document.title = 'The flower wall · Petal Post';
        Wall.show('wall');
      } else if (h.startsWith('#/create')) {
        clearInterval(cdTimer); typeToken++;
        Wall.show(null);
        swapView('view-create');
        initBuilder();
        if (!state.o && !state.items.length) state.step = 0;
        renderAll();
        document.title = 'Create a bouquet · Petal Post';
      } else {
        clearInterval(cdTimer); typeToken++;
        swapView('view-home');
        document.title = 'Petal Post — Send flowers that never wilt';
        growHero();
        observeReveals($('#view-home'));
        Wall.show('home');
      }
    };
    if (document.startViewTransition && !reduced() && route.ready && !document.hidden) {
      const vt = document.startViewTransition(run);
      // A transition can be skipped (tab hidden, rapid clicks); the view still switches.
      [vt.ready, vt.finished, vt.updateCallbackDone].forEach(pr => pr && pr.catch(() => {}));
    }
    else run();
    route.ready = true;
  }

  // "Send flowers" buttons always start from the current draft; data-new on the hero starts fresh only if the draft is empty.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-new]');
    if (a && location.hash.startsWith('#/g/')) sess.del('pp.preview');
  });

  initHome();
  initGift();
  Wall.init();
  addEventListener('hashchange', route);
  route();
})();
