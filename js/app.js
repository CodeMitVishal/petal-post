/* Petal Post — app: routing, builder, gift reveal, petals. */
(function () {
  'use strict';
  const F = window.Flora;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduced() ? 0 : ms));
  const MAX = 12;

  /* ================= data ================= */
  const OCCASIONS = [
    { id: 'love', label: 'Love', emoji: '💗', sub: 'Anniversaries & just us', preset: ['rr', 'rr', 'bb', 'rr', 'rp', 'rr', 'bb'], w: 'blush', r: 'ruby',
      notes: ['Every day with you feels like spring. These are for you. No reason needed, just love.', "If I had a flower for every time I thought of you, I'd walk through my garden forever.", 'You make my whole world bloom. Happy us. ♡'] },
    { id: 'birthday', label: 'Birthday', emoji: '🎂', sub: 'Another lap round the sun', preset: ['sf', 'dz', 'ty', 'sf', 'dz', 'to'], w: 'kraft', r: 'gold',
      notes: ['Happy birthday! May your year be as bright as these sunflowers.', 'Another trip around the sun, and you just keep getting more wonderful. Have the best day!', 'Wishing you cake, laughter and a whole bouquet of good things this year.'] },
    { id: 'thanks', label: 'Thank you', emoji: '🙏', sub: 'For the big & little things', preset: ['rp', 'tp', 'rp', 'bb', 'to'], w: 'cream', r: 'lilac',
      notes: ['Thank you for everything. These blooms are a small way of saying you mean a lot.', "Your kindness didn't go unnoticed. Thank you, truly.", 'For all the little things you do: thank you.'] },
    { id: 'sorry', label: "I'm sorry", emoji: '🫶', sub: 'Words are hard, flowers help', preset: ['ri', 'lv', 'ri', 'bb', 'lv'], w: 'sage', r: 'ivory',
      notes: ["I'm sorry. You matter more to me than being right. Can we start fresh?", "These can't fix it, but I hope they show how much I care. I'm truly sorry.", "I got it wrong, and I'm sorry. Thank you for your patience with me."] },
    { id: 'getwell', label: 'Get well', emoji: '🌤️', sub: 'Sunshine for recovery', preset: ['sf', 'dz', 'ly', 'ty', 'dz'], w: 'sage', r: 'gold',
      notes: ['Sending a little sunshine your way. Rest up and feel better soon!', 'Get well soon. The world is less bright without you at full power.', 'Thinking of you and wishing you a speedy recovery.'] },
    { id: 'congrats', label: 'Congrats', emoji: '🎉', sub: 'New job, new home, big win', preset: ['sf', 'ty', 'to', 'ry', 'sf', 'dz'], w: 'midnight', r: 'gold',
      notes: ['You did it! So proud of you. Congratulations!', 'Big news deserves big flowers. Congratulations!', "Here's to you and everything you've worked for. Congrats!"] },
    { id: 'sympathy', label: 'Thinking of you', emoji: '🕊️', sub: 'Comfort from afar', preset: ['ly', 'ri', 'ly', 'bb', 'lv'], w: 'cream', r: 'ivory',
      notes: ['Thinking of you, and holding you close in my heart.', "There are no right words, so I'm sending flowers and all my love.", "I'm here for you, today and every day after."] },
    { id: 'just', label: 'Just because', emoji: '✨', sub: 'No reason at all', preset: ['sk', 'tp', 'dz', 'sk', 'rp'], w: 'blush', r: 'lilac',
      notes: ['No reason. I just thought of you and wanted to make you smile.', "A little bouquet for a lovely person. That's the whole message.", 'Saw these and thought of you. Have a beautiful day.'] },
  ];
  const OCC = Object.fromEntries(OCCASIONS.map(o => [o.id, o]));

  /* ================= utils ================= */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const sess = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch { /* ignore */ } },
  };
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
    const b = String(g.b || '').split('.').filter(id => F.BY_ID[id]).slice(0, MAX);
    return {
      t: str(g.t, 40), f: str(g.f, 40), m: str(g.m, 300),
      o: OCC[g.o] ? g.o : '',
      b,
      w: F.WRAPS[g.w] ? g.w : 'kraft',
      r: F.RIBBONS[g.r] ? g.r : 'ruby',
      d: /^\d{4}-\d{2}-\d{2}$/.test(g.d || '') ? g.d : '',
      s: Number.isFinite(+g.s) ? Math.abs(+g.s | 0) : 1,
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

  /* ================= HOME ================= */
  const HERO_SETS = [
    ['rp', 'rr', 'sk', 'dz', 'rr', 'lv', 'bb', 'ty', 'rp'],
    ['sf', 'dz', 'ty', 'sf', 'to', 'dz', 'bb'],
    ['tp', 'lv', 'rp', 'sk', 'lv', 'ri', 'bb', 'tp'],
    ['ly', 'ri', 'rp', 'bb', 'ly', 'lv', 'ri'],
  ];
  let heroIdx = 0;
  function growHero() {
    const set = HERO_SETS[heroIdx % HERO_SETS.length];
    const wraps = ['blush', 'kraft', 'cream', 'sage'], ribs = ['ruby', 'gold', 'lilac', 'ivory'];
    const svg = $('#heroSvg');
    svg.classList.remove('anim');
    svg.innerHTML = F.bouquetSVG(set, { w: wraps[heroIdx % 4], r: ribs[heroIdx % 4], seed: 7 + heroIdx * 13, animate: true, delay: 0.5 });
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
    const items = F.CATALOG.map(f => `<div class="m-item">${F.headThumb(f.id)}<div><strong>${f.name}</strong><small>${f.meaning}</small></div></div>`).join('');
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
  const blankState = () => ({ o: '', items: [], w: 'kraft', r: 'ruby', t: '', f: '', m: '', mAuto: false, d: '', s: randSeed(), step: 0, touched: false, noteIdx: 0 });
  let state = restore();

  function restore() {
    const d = store.get('petalpost.draft');
    const s = blankState();
    if (!d || typeof d !== 'object') return s;
    Object.assign(s, sanitize({ ...d, b: (d.items || []).map(i => i.id).join('.') }));
    s.items = (d.items || []).filter(i => F.BY_ID[i.id]).slice(0, MAX).map(i => newItem(i.id, +i.k || Math.random()));
    s.mAuto = !!d.mAuto; s.touched = !!d.touched; s.step = Math.min(4, Math.max(0, d.step | 0));
    return s;
  }
  function save() {
    store.set('petalpost.draft', { ...state, items: state.items.map(({ id, k }) => ({ id, k })) });
  }
  const ordered = () => [...state.items].sort((a, b) => a.k - b.k);
  const giftData = () => ({ v: 1, t: state.t, f: state.f, m: state.m, o: state.o, b: ordered().map(i => i.id).join('.'), w: state.w, r: state.r, d: state.d, s: state.s });
  const giftUrl = () => `${location.origin}${location.pathname}#/g/${encode(giftData())}`;

  function applyOccasion(id, force) {
    const o = OCC[id];
    if (!o) return;
    state.o = id;
    if (force || !state.touched || !state.items.length) {
      state.items = o.preset.map(x => newItem(x));
      state.w = o.w; state.r = o.r; state.s = randSeed(); state.touched = false;
    }
    if (force || !state.m || state.mAuto) { state.noteIdx = 0; state.m = o.notes[0]; state.mAuto = true; }
  }

  let builderReady = false;
  function initBuilder() {
    if (builderReady) return;
    builderReady = true;
    const svg = $('#builderSvg');
    svg.innerHTML = F.skeleton(state.w, state.r);

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

    // catalog
    const cat = $('#catalog');
    F.CATALOG.forEach(f => {
      const card = document.createElement('div');
      card.className = 'flower';
      card.dataset.id = f.id;
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.setAttribute('aria-label', `Add ${f.name}: ${f.meaning}`);
      card.title = f.meaning;
      card.innerHTML = `${F.headThumb(f.id)}<strong>${f.name}</strong><small>${f.meaning}</small><span class="count" aria-hidden="true">0</span><button type="button" class="minus" aria-label="Remove one ${f.name}">−</button>`;
      const add = () => {
        if (state.items.length >= MAX) { toast(`A bouquet holds up to ${MAX} stems. Remove one to add another.`); return; }
        state.items.push(newItem(f.id));
        state.touched = true;
        card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse');
        renderAll();
      };
      card.addEventListener('click', e => { if (!e.target.closest('.minus')) add(); });
      card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); add(); } });
      card.querySelector('.minus').addEventListener('click', () => removeOne(f.id));
      cat.appendChild(card);
    });

    $('#surpriseBtn').addEventListener('click', e => {
      const ids = F.CATALOG.map(f => f.id);
      const n = 5 + ((Math.random() * 5) | 0);
      const pick = [...ids].sort(() => Math.random() - 0.5).slice(0, 3 + ((Math.random() * 2) | 0));
      state.items = Array.from({ length: n }, () => newItem(pick[(Math.random() * pick.length) | 0]));
      state.s = randSeed(); state.touched = true;
      burstFrom(e.currentTarget, 16);
      renderAll();
    });
    $('#presetBtn').addEventListener('click', () => { state.touched = false; applyOccasion(state.o, false); renderAll(); });
    $('#clearBtn').addEventListener('click', () => { state.items = []; state.touched = true; renderAll(); });
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
      b.addEventListener('click', () => { state[key] = id; renderAll(); });
      host.appendChild(b);
    });
    mk($('#wrapSwatches'), F.WRAPS, 'w');
    mk($('#ribbonSwatches'), F.RIBBONS, 'r');

    // note fields
    const to = $('#toInput'), from = $('#fromInput'), msg = $('#msgInput'), date = $('#dateInput');
    to.addEventListener('input', () => { state.t = to.value; renderTag(true); renderSend(); save(); });
    from.addEventListener('input', () => { state.f = from.value; renderSend(); save(); });
    msg.addEventListener('input', () => { state.m = msg.value; state.mAuto = false; renderCount(); renderSend(); save(); });
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
    $('#copyBtn').addEventListener('click', copyLink);
    if (navigator.share) {
      const nb = $('#nativeShareBtn');
      nb.hidden = false;
      nb.addEventListener('click', () => navigator.share({ title: 'Flowers for you 💐', text: shareText(false), url: giftUrl() }).catch(() => {}));
    }
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

  function shareText(withUrl = true) {
    const name = state.t.trim();
    return `${name ? name + ', ' : ''}I sent you flowers 💐 Open them here:${withUrl ? ' ' + giftUrl() : ''}`;
  }

  async function copyLink() {
    if (!state.items.length) return;
    const url = giftUrl();
    let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; } catch {
      const i = $('#linkOut'); i.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
    }
    const b = $('#copyBtn');
    if (ok) {
      b.classList.add('copied'); b.firstElementChild.textContent = 'Copied ✓';
      burstFrom(b, 18);
      setTimeout(() => { b.classList.remove('copied'); b.firstElementChild.textContent = 'Copy link'; }, 1800);
    } else toast('Copy failed. Select the link and copy it manually.');
  }

  function goStep(n) {
    const prev = state.step;
    state.step = n;
    save();
    renderSteps(n < prev);
    if (innerWidth <= 960) $('.panel').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- render ---------- */
  const settleTimers = new WeakMap();
  function renderPreview() {
    const svg = $('#builderSvg'), layer = $('.stems', svg);
    const list = ordered();
    const pos = F.layout(list.map(i => i.id), state.s);
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
    const n = list.length;
    $('#stemCount').textContent = `${n} ${n === 1 ? 'stem' : 'stems'} of ${MAX}`;
  }

  function renderCatalog() {
    const counts = {};
    state.items.forEach(i => (counts[i.id] = (counts[i.id] || 0) + 1));
    $$('#catalog .flower').forEach(c => {
      const n = counts[c.dataset.id] || 0;
      c.classList.toggle('has', n > 0);
      c.querySelector('.count').textContent = n;
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
    const ok = n > 0;
    $('#linkBox').classList.toggle('disabled', !ok);
    $('#shareGrid').classList.toggle('disabled', !ok);
    if (!ok) {
      warn.hidden = false;
      warn.innerHTML = '<span>Your bouquet is empty. Add at least one flower.</span><button class="chip-btn" type="button">Pick flowers</button>';
      warn.querySelector('button').onclick = () => goStep(1);
      $('#linkOut').value = '';
    } else if (!state.t.trim()) {
      warn.hidden = false;
      warn.innerHTML = "<span>Tip: add their name so the envelope says who it's for.</span><button class=\"chip-btn\" type=\"button\">Add name</button>";
      warn.querySelector('button').onclick = () => { goStep(3); setTimeout(() => $('#toInput').focus(), 300); };
    } else warn.hidden = true;
    if (ok) $('#linkOut').value = giftUrl();

    const w = F.WRAPS[state.w].name, r = F.RIBBONS[state.r].name;
    const when = state.d ? ` It will open on ${new Date(state.d + 'T00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.` : '';
    $('#sendSummary').textContent = `${n} ${n === 1 ? 'stem' : 'stems'}, ${w.toLowerCase()} paper and a ${r.toLowerCase()} ribbon${state.t.trim() ? ` for ${state.t.trim()}` : ''}.${when}`;
    $('#waBtn').href = 'https://wa.me/?text=' + encodeURIComponent(shareText());
    $('#mailBtn').href = `mailto:?subject=${encodeURIComponent('I sent you flowers 💐')}&body=${encodeURIComponent(shareText())}`;
  }

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
    $('#backBtn').textContent = n === 0 ? 'Home' : 'Back';
    const next = $('#nextBtn');
    next.hidden = n === 4;
    next.textContent = ['Choose flowers', 'Wrap it up', 'Write a note', 'Get my link'][n] || 'Next';
  }

  function renderAll() {
    renderPreview(); renderCatalog(); renderSwatches(); renderTag(false); renderFields(); renderSend(); renderSteps(false);
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
    svg.innerHTML = F.bouquetSVG(gift.b, { w: gift.w, r: gift.r, seed: gift.s, animate: true, delay: 0.3 });
    void svg.getBoundingClientRect();
    svg.classList.add('anim');
    const card = $('#noteCard');
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    const growTime = 0.3 + gift.b.length * 0.13 + 1.2;
    card.style.setProperty('--cd', `${Math.min(growTime, 2.2)}s`);

    $('#noteTo').textContent = gift.t || 'you';
    $('#noteFrom').textContent = gift.f || 'someone who cares';
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
    Petals.burst(innerWidth / 2, innerHeight * 0.35, 30);
  }

  async function saveKeepsake() {
    if (!gift) return;
    const btn = $('#keepsakeBtn');
    btn.disabled = true;
    try {
      await document.fonts?.ready;
      const svgStr = F.bouquetSVG(gift.b, { w: gift.w, r: gift.r, seed: gift.s, standalone: true, width: 800 });
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
      x.drawImage(img, 240, 30, 600, 720);
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
      if (h.startsWith('#/g/')) {
        swapView('view-gift');
        showGift(h.slice(4));
      } else if (h.startsWith('#/create')) {
        clearInterval(cdTimer); typeToken++;
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
      }
    };
    if (document.startViewTransition && !reduced() && route.ready) document.startViewTransition(run);
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
  addEventListener('hashchange', route);
  route();
})();
