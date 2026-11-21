/* Petal Post — motion layer.
   Ambient life everywhere (aurora, cursor petals, ripples, tilt, magnetic buttons,
   word-by-word headings, scroll progress, parallax) plus story moments the app
   announces with "pp:*" events (flower flies into the bouquet, wrap colour wave,
   envelope takes off, butterflies and sparkles on reveal, hearts after the note).
   Everything is transform/opacity based, pauses when the tab is hidden and is
   switched off for people who prefer reduced motion. */
(function () {
  'use strict';
  const F = window.Flora;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => mq.matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const PETALS = ['#F6B9C6', '#F28BA8', '#FBD3DC', '#E99AB0', '#FFD2B8', '#F7C948'];
  const rand = (a, b) => a + Math.random() * (b - a);
  const on = (name, fn) => document.addEventListener('pp:' + name, e => { if (!still()) fn(e.detail || {}); });
  const center = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; };

  // One fixed layer for short-lived effects (flying flowers, hearts, trail).
  const fx = document.createElement('div');
  fx.className = 'fx-layer';
  fx.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fx);
  const spawn = (cls, x, y, html = '') => {
    const el = document.createElement('span');
    el.className = cls;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.innerHTML = html;
    fx.appendChild(el);
    return el;
  };
  const autoRemove = el => el.addEventListener('animationend', () => el.remove(), { once: true });
  const heartSVG = c => `<svg viewBox="0 0 24 24"><path fill="${c}" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4h2c.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>`;

  /* ---------- 1. ambient aurora ---------- */
  const aurora = document.createElement('div');
  aurora.className = 'aurora';
  aurora.setAttribute('aria-hidden', 'true');
  aurora.innerHTML = '<i></i><i></i><i></i>';
  document.body.prepend(aurora);

  /* ---------- 2. scroll progress + hero parallax ---------- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      if (still()) return;
      const heroArt = $('.hero-art'), heroCopy = $('.hero-copy');
      if (heroArt && scrollY < innerHeight * 1.2) {
        heroArt.style.translate = `0 ${scrollY * -0.12}px`;
        heroCopy.style.translate = `0 ${scrollY * 0.08}px`;
        heroCopy.style.opacity = String(Math.max(0.2, 1 - scrollY / (innerHeight * 0.9)));
      }
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  /* ---------- 3. headings rise word by word ---------- */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    el.classList.add('split');
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--wi', i++);
            wi.textContent = part; w.appendChild(wi); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches('svg, .live-dot')) walk(n);
      });
    };
    walk(el);
  }
  $$('.hero h1, .block-head h2, .final-cta h2, .wall-page h1').forEach(splitWords);

  /* ---------- 4. hero: floating blooms that follow the pointer ---------- */
  const heroArt = $('.hero-art');
  if (heroArt && F) {
    const spots = [['rp', 4, 18, 0.9], ['dz', 88, 12, 0.7], ['sk', 92, 62, 0.8], ['ty', 0, 70, 0.75], ['lv', 82, 88, 0.6]];
    const floats = spots.map(([id, x, y, d], k) => {
      const el = document.createElement('div');
      el.className = 'hero-float';
      el.setAttribute('aria-hidden', 'true');
      el.style.left = x + '%'; el.style.top = y + '%';
      el.style.setProperty('--d', d); el.style.setProperty('--k', k);
      el.innerHTML = F.headThumb(id);
      heroArt.appendChild(el);
      return el;
    });
    heroArt.addEventListener('pointermove', e => {
      if (still() || e.pointerType !== 'mouse') return;
      const r = heroArt.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      floats.forEach(f => { const d = +f.style.getPropertyValue('--d'); f.style.translate = `${dx * -40 * d}px ${dy * -40 * d}px`; });
    });
    heroArt.addEventListener('pointerleave', () => floats.forEach(f => (f.style.translate = '')));
  }

  /* ---------- 5. cursor petal trail (mouse only) ---------- */
  let lastTrail = 0, live = 0;
  addEventListener('pointermove', e => {
    if (still() || e.pointerType !== 'mouse' || !finePointer.matches) return;
    const now = performance.now();
    if (now - lastTrail < 45 || live > 16) return;
    if (e.target.closest && e.target.closest('input, textarea, .monaco')) return;
    lastTrail = now; live++;
    const p = spawn('trail-petal', e.clientX, e.clientY);
    p.style.background = PETALS[(Math.random() * PETALS.length) | 0];
    p.style.setProperty('--dx', rand(-26, 26) + 'px');
    p.style.setProperty('--rot', rand(-200, 200) + 'deg');
    p.addEventListener('animationend', () => { p.remove(); live--; }, { once: true });
  }, { passive: true });

  /* ---------- 6. press ripples ---------- */
  const RIPPLE = '.btn, .chip-btn, .share, .occasion, .flower, .nav-link, .stat, .wall-item';
  document.addEventListener('pointerdown', e => {
    if (still()) return;
    const host = e.target.closest && e.target.closest(RIPPLE);
    if (!host || host.disabled) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.classList.add('rp-host');
    const r = host.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const rp = document.createElement('span');
    rp.className = 'ripple';
    rp.style.width = rp.style.height = size + 'px';
    rp.style.left = e.clientX - r.left - size / 2 + 'px';
    rp.style.top = e.clientY - r.top - size / 2 + 'px';
    host.appendChild(rp);
    autoRemove(rp);
  }, { passive: true });

  /* ---------- 7. magnetic primary buttons + 3D tilt cards ---------- */
  document.addEventListener('pointermove', e => {
    if (still() || e.pointerType !== 'mouse') return;
    const btn = e.target.closest && e.target.closest('.btn-primary, .seal');
    if (btn && !btn.disabled) {
      const c = center(btn);
      btn.style.translate = `${(e.clientX - c.x) * 0.22}px ${(e.clientY - c.y) * 0.3}px`;
      btn.dataset.mag = '1';
    }
    const card = e.target.closest && e.target.closest('.occasion, .how li, .features article, .stat, .flower, .wall-item');
    if (card) {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      const strength = card.matches('.wall-item') ? 3 : card.matches('.flower') ? 5 : 9;
      card.style.rotate = `${-y} ${x} 0 ${Math.hypot(x, y) * strength}deg`;
      card.style.setProperty('--gx', (x + 0.5) * 100 + '%');
      card.style.setProperty('--gy', (y + 0.5) * 100 + '%');
      card.classList.add('tilting');
    }
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    const btn = e.target.closest && e.target.closest('[data-mag]');
    if (btn && !btn.contains(e.relatedTarget)) { btn.style.translate = ''; delete btn.dataset.mag; }
    const card = e.target.closest && e.target.closest('.tilting');
    if (card && !card.contains(e.relatedTarget)) { card.style.rotate = ''; card.classList.remove('tilting'); }
  }, { passive: true });

  /* ---------- 8. envelope follows the pointer, hearts drift behind it ---------- */
  const stage = $('#envelopeStage');
  if (stage) {
    const hearts = document.createElement('div');
    hearts.className = 'env-hearts';
    hearts.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 9; i++) {
      const h = document.createElement('span');
      h.style.left = rand(8, 92) + '%';
      h.style.setProperty('--s', rand(0.5, 1.1).toFixed(2));
      h.style.setProperty('--t', rand(6, 11).toFixed(1) + 's');
      h.style.setProperty('--delay', rand(-10, 0).toFixed(1) + 's');
      h.innerHTML = heartSVG(PETALS[i % PETALS.length]);
      hearts.appendChild(h);
    }
    stage.prepend(hearts);
    stage.addEventListener('pointermove', e => {
      if (still() || e.pointerType !== 'mouse') return;
      const env = $('#envelope');
      if (env.classList.contains('opening')) return;
      const c = center(env);
      const x = (e.clientX - c.x) / c.r.width, y = (e.clientY - c.y) / c.r.height;
      env.style.rotate = `${-y} ${x} 0 ${Math.min(14, Math.hypot(x, y) * 14)}deg`;
    });
    stage.addEventListener('pointerleave', () => ($('#envelope').style.rotate = ''));
  }

  /* ---------- story moments ---------- */

  // A tapped flower arcs into the bouquet.
  on('flower-added', ({ from }) => {
    const src = from && from.querySelector('svg'), target = $('#builderSvg');
    if (!src || !target) return;
    const a = src.getBoundingClientRect(), b = target.getBoundingClientRect();
    if (b.bottom < 0 || b.top > innerHeight) return; // preview scrolled away (phones)
    const clone = src.cloneNode(true);
    clone.classList.add('fly-clone');
    Object.assign(clone.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
    fx.appendChild(clone);
    const dx = b.left + b.width * rand(0.4, 0.6) - (a.left + a.width / 2);
    const dy = b.top + b.height * 0.32 - (a.top + a.height / 2);
    const anim = clone.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 140}px) scale(1.35) rotate(-140deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.35) rotate(-320deg)`, opacity: 0 },
    ], { duration: 820, easing: 'cubic-bezier(.45,0,.25,1)' });
    anim.onfinish = () => {
      clone.remove();
      for (let i = 0; i < 6; i++) {
        const s = spawn('spark', a.left + a.width / 2 + dx, a.top + a.height / 2 + dy, '✦');
        s.style.setProperty('--a', i * 60 + rand(-15, 15) + 'deg');
        autoRemove(s);
      }
    };
  });

  // Picking a colour on a flower card sends a little ring of petals in that colour.
  on('shade-picked', ({ from, color }) => {
    if (!from) return;
    const c = center(from);
    for (let i = 0; i < 9; i++) {
      const p = spawn('shade-petal', c.x, c.y);
      p.style.background = color;
      const a = (i / 9) * Math.PI * 2 + rand(-0.2, 0.2), d = rand(26, 40);
      p.animate([
        { transform: `translate(-50%,-50%) rotate(${(a * 180) / Math.PI + 90}deg) scale(.4)`, opacity: 0.95 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) rotate(${(a * 180) / Math.PI + 90}deg) scale(1)`, opacity: 0 },
      ], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => p.remove();
    }
  });

  // New wrap or ribbon colour washes over the preview.
  on('wrap-changed', ({ color, from }) => {
    const card = $('.preview-card');
    if (!card) return;
    const wave = document.createElement('span');
    wave.className = 'color-wave';
    wave.style.background = `radial-gradient(circle, ${color} 0%, ${color}00 70%)`;
    card.appendChild(wave);
    autoRemove(wave);
    if (from) { const sw = from.querySelector('i'); sw && sw.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' }); }
  });

  // Typing the note sends up tiny hearts.
  let typed = 0;
  on('typing', ({ field }) => {
    if (++typed % 7 || !field) return;
    const r = field.getBoundingClientRect();
    const h = spawn('float-heart small', r.right - rand(24, 70), r.bottom - 18, heartSVG(PETALS[(Math.random() * 4) | 0]));
    h.style.setProperty('--dx', rand(-20, 20) + 'px');
    autoRemove(h);
  });

  // Sharing: a little envelope flies off with a heart trail.
  on('shared', ({ from }) => {
    const btn = from || $('#copyBtn');
    if (!btn) return;
    const { x, y } = center(btn);
    const env = spawn('fly-env', x, y, '<i></i>');
    const tx = innerWidth - x + 60, ty = -y - 80;
    const anim = env.animate([
      { transform: 'translate(-50%,-50%) scale(.6) rotate(0deg)', opacity: 0 },
      { transform: 'translate(-50%,-50%) scale(1.1) rotate(-8deg)', opacity: 1, offset: 0.15 },
      { transform: `translate(calc(-50% + ${tx * 0.35}px), calc(-50% + ${ty * 0.2 - 60}px)) scale(1) rotate(-18deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(.5) rotate(-30deg)`, opacity: 0 },
    ], { duration: 1300, easing: 'cubic-bezier(.5,0,.35,1)' });
    let n = 0;
    const trail = setInterval(() => {
      const c = env.getBoundingClientRect();
      const h = spawn('float-heart tiny', c.left + c.width / 2, c.top + c.height / 2, heartSVG(PETALS[n++ % PETALS.length]));
      h.style.setProperty('--dx', rand(-14, 14) + 'px');
      autoRemove(h);
    }, 90);
    anim.onfinish = () => { clearInterval(trail); env.remove(); };
  });

  // Reveal: butterflies circle the bouquet and stars twinkle.
  let flutter = 0, flyers = [], flyStep = null;
  function stopFlutter() {
    cancelAnimationFrame(flutter); flutter = 0; flyStep = null;
    flyers.forEach(f => f.el.remove()); flyers = [];
    $$('.twinkle').forEach(t => t.remove());
  }
  const butterfly = (c1, c2) =>
    `<svg viewBox="-20 -16 40 32"><g class="wing l"><path d="M0,0 C-6,-14 -20,-16 -18,-4 C-17,4 -8,4 0,0Z" fill="${c1}"/><path d="M0,0 C-8,4 -16,12 -10,15 C-4,17 -1,8 0,0Z" fill="${c2}"/></g>` +
    `<g class="wing r"><path d="M0,0 C6,-14 20,-16 18,-4 C17,4 8,4 0,0Z" fill="${c1}"/><path d="M0,0 C8,4 16,12 10,15 C4,17 1,8 0,0Z" fill="${c2}"/></g>` +
    '<rect x="-1.2" y="-8" width="2.4" height="16" rx="1.2" fill="#3a2a2e"/></svg>';
  on('bloomed', ({ art }) => {
    stopFlutter();
    if (!art) return;
    for (let i = 0; i < 14; i++) {
      const t = document.createElement('span');
      t.className = 'twinkle';
      t.setAttribute('aria-hidden', 'true');
      t.textContent = i % 3 ? '✦' : '✧';
      t.style.left = rand(6, 94) + '%';
      t.style.top = rand(4, 70) + '%';
      t.style.setProperty('--t', rand(1.6, 3.4).toFixed(2) + 's');
      t.style.setProperty('--delay', rand(0, 2.5).toFixed(2) + 's');
      t.style.fontSize = rand(10, 20) + 'px';
      art.appendChild(t);
    }
    const colors = [['#F28BA8', '#F7C948'], ['#9A7FD1', '#FBCFDA'], ['#FF9F6E', '#FFE08A']];
    flyers = colors.slice(0, innerWidth < 600 ? 2 : 3).map(([c1, c2], i) => {
      const el = document.createElement('div');
      el.className = 'butterfly';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = butterfly(c1, c2);
      el.style.setProperty('--flap', (0.18 + i * 0.04).toFixed(2) + 's');
      art.appendChild(el);
      return { el, phase: rand(0, 6.28), speed: rand(0.35, 0.55) * (i % 2 ? -1 : 1), rx: rand(0.32, 0.44), ry: rand(0.18, 0.28), cy: rand(0.3, 0.42), px: 0, py: 0 };
    });
    const t0 = performance.now();
    const step = flyStep = now => {
      const box = art.getBoundingClientRect();
      const t = (now - t0) / 1000;
      flyers.forEach(f => {
        const a = f.phase + t * f.speed;
        const x = box.width * (0.5 + f.rx * Math.sin(a) + 0.05 * Math.sin(a * 3.1));
        const y = box.height * (f.cy + f.ry * Math.sin(a * 2) + 0.04 * Math.cos(a * 4.3));
        const ang = Math.atan2(y - f.py, x - f.px) * 57.3 + 90;
        f.px = x; f.py = y;
        f.el.style.transform = `translate(${x}px, ${y}px) rotate(${Math.max(-50, Math.min(50, ((ang + 540) % 360) - 180))}deg)`;
      });
      flutter = document.hidden ? 0 : requestAnimationFrame(step);
    };
    flutter = requestAnimationFrame(step);
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && flyers.length && !flutter && flyStep) flutter = requestAnimationFrame(flyStep);
  });

  // The note is finished: a soft rise of hearts from the card.
  on('note-done', ({ card }) => {
    if (!card) return;
    const r = card.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const h = spawn('float-heart', rand(r.left + 20, r.right - 20), r.top + rand(10, r.height * 0.6), heartSVG(PETALS[i % PETALS.length]));
        h.style.setProperty('--dx', rand(-40, 40) + 'px');
        autoRemove(h);
      }, i * 110);
    }
  });

  // Leaving the gift (or replaying it) clears the butterflies, even with motion off.
  document.addEventListener('pp:view', ({ detail }) => {
    if (!detail || detail.name !== 'gift') stopFlutter();
    requestAnimationFrame(onScroll);
  });

  onScroll();
})();
