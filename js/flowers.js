/* Petal Post — flower catalog, SVG flower heads and bouquet layout.
   Everything is drawn procedurally so a bouquet can be rebuilt from a short code. */
(function () {
  'use strict';

  const CATALOG = [
    { id: 'rr', type: 'rose', name: 'Red Rose', meaning: 'Deep love & passion', c: { base: '#D7263D', dark: '#9E1B2E', light: '#F25C6E' } },
    { id: 'rp', type: 'rose', name: 'Pink Rose', meaning: 'Gratitude & admiration', c: { base: '#F28BA8', dark: '#CF5F7F', light: '#FFC2D3' } },
    { id: 'ri', type: 'rose', name: 'Ivory Rose', meaning: 'New beginnings & honesty', c: { base: '#F7EEDD', dark: '#D3BF9C', light: '#FFFFFF' } },
    { id: 'ry', type: 'rose', name: 'Yellow Rose', meaning: 'Friendship & joy', c: { base: '#F9C440', dark: '#D49512', light: '#FFE08A' } },
    { id: 'ty', type: 'tulip', name: 'Yellow Tulip', meaning: 'Cheerful thoughts', c: { base: '#F7C948', dark: '#D9A21B', light: '#FFE9A3' } },
    { id: 'tp', type: 'tulip', name: 'Purple Tulip', meaning: 'Admiration & respect', c: { base: '#9B6BD3', dark: '#6E43A8', light: '#C9AEEE' } },
    { id: 'to', type: 'tulip', name: 'Coral Tulip', meaning: 'Warm affection', c: { base: '#FF7F66', dark: '#DB4E37', light: '#FFB9AA' } },
    { id: 'dz', type: 'daisy', name: 'Daisy', meaning: 'Innocence & loyal love', c: { base: '#FFFFFF', dark: '#DCD3C4', light: '#F4B63F' } },
    { id: 'sf', type: 'sunflower', name: 'Sunflower', meaning: 'Adoration & warmth', c: { base: '#F6B829', dark: '#DD8A10', light: '#5A3A1E' } },
    { id: 'lv', type: 'lavender', name: 'Lavender', meaning: 'Calm, grace & devotion', c: { base: '#9A7FD1', dark: '#6F55A8', light: '#C2B0EA' } },
    { id: 'sk', type: 'sakura', name: 'Cherry Blossom', meaning: 'Renewal & gentle beauty', c: { base: '#FBCFDA', dark: '#E594AB', light: '#FFF0F4' } },
    { id: 'ly', type: 'lily', name: 'White Lily', meaning: 'Peace & sympathy', c: { base: '#FFF9F1', dark: '#DCCBB2', light: '#D7E6A6' } },
    { id: 'bb', type: 'babysbreath', name: "Baby's Breath", meaning: 'Everlasting love', c: { base: '#FFFFFF', dark: '#D6CFC3', light: '#F7F3EC' } },
    { id: 'pk', type: 'peony', name: 'Pink Peony', meaning: 'Romance & a happy life', c: { base: '#F7A1B8', dark: '#D96E8C', light: '#FFD0DC' } },
    { id: 'pc', type: 'peony', name: 'Coral Peony', meaning: 'Good fortune & joy', c: { base: '#FF9A86', dark: '#E06A55', light: '#FFC9BC' } },
    { id: 'cr', type: 'carnation', name: 'Red Carnation', meaning: 'Deep love & admiration', c: { base: '#E0344F', dark: '#A81E36', light: '#F7738A' } },
    { id: 'cp', type: 'carnation', name: 'Pink Carnation', meaning: "Gratitude & a mother's love", c: { base: '#F7B2C6', dark: '#E07F9D', light: '#FFE0EA' } },
    { id: 'rn', type: 'ranunculus', name: 'Peach Ranunculus', meaning: "You're radiant & charming", c: { base: '#FFC2A6', dark: '#E99A7C', light: '#FFE2D4' } },
    { id: 'pr', type: 'poppy', name: 'Red Poppy', meaning: 'Remembrance & dreams', c: { base: '#E8402F', dark: '#B22A1E', light: '#FF7A66' } },
    { id: 'po', type: 'poppy', name: 'Orange Poppy', meaning: 'Imagination & success', c: { base: '#FF9B3D', dark: '#E0741A', light: '#FFC47F' } },
    { id: 'go', type: 'gerbera', name: 'Orange Gerbera', meaning: 'Cheer & warm energy', c: { base: '#FF8A3D', dark: '#E5671C', light: '#FFD24A' } },
    { id: 'gp', type: 'gerbera', name: 'Pink Gerbera', meaning: 'Playful joy', c: { base: '#FF6FA0', dark: '#E04C80', light: '#FFD24A' } },
    { id: 'hb', type: 'hydrangea', name: 'Blue Hydrangea', meaning: 'Heartfelt gratitude', c: { base: '#8FB3E8', dark: '#5E86C9', light: '#C9DCF7' } },
    { id: 'hl', type: 'hydrangea', name: 'Lilac Hydrangea', meaning: 'Grace & understanding', c: { base: '#C3A6E3', dark: '#9978C6', light: '#E6D8F5' } },
    { id: 'fm', type: 'forgetmenot', name: 'Forget-me-not', meaning: 'True love & memories', c: { base: '#7FB2F0', dark: '#5A8FD6', light: '#F7D04A' } },
    { id: 'op', type: 'orchid', name: 'Purple Orchid', meaning: 'Luxury & admiration', c: { base: '#C58BD9', dark: '#8E4FA8', light: '#EBCDF2' } },
    { id: 'ow', type: 'orchid', name: 'White Orchid', meaning: 'Elegance & reverence', c: { base: '#FFFDF8', dark: '#D9CDB9', light: '#F3E6F5', accent: '#E79AB8' } },
    { id: 'eu', type: 'eucalyptus', name: 'Eucalyptus', meaning: 'Protection & healing', c: { base: '#9DB8A4', dark: '#7E9C86', light: '#C9D9CC' } },
  ];
  // Mood groups for the catalog filter.
  const MOODS = [
    { id: 'romantic', name: 'Romantic', ids: ['rr', 'rp', 'pk', 'pc', 'cr', 'cp', 'rn'] },
    { id: 'cheerful', name: 'Cheerful', ids: ['ry', 'ty', 'to', 'dz', 'sf', 'pr', 'po', 'go', 'gp'] },
    { id: 'calm', name: 'Calm', ids: ['lv', 'sk', 'hb', 'hl', 'fm'] },
    { id: 'elegant', name: 'Elegant', ids: ['ri', 'tp', 'ly', 'op', 'ow'] },
    { id: 'green', name: 'Fillers', ids: ['bb', 'eu'] },
  ];
  const BY_ID = Object.fromEntries(CATALOG.map(f => [f.id, f]));
  MOODS.forEach(m => m.ids.forEach(id => (BY_ID[id].mood = m.id)));

  // Bouquet sizes: Posy is short and compact, Grand is tall with a third row.
  const SIZES = {
    s: { id: 's', name: 'Posy', max: 7, wrap: 0.8, dome: 24, step: 7, single: 168,
         rows: [{ R: 176, max: 26, s: 1.18 }, { R: 140, max: 20, s: 1.1 }] },
    m: { id: 'm', name: 'Classic', max: 12, wrap: 1, dome: 36, step: 7.5, single: 236,
         rows: [{ R: 256, max: 34, s: 1.32 }, { R: 196, max: 28, s: 1.2 }] },
    l: { id: 'l', name: 'Grand', max: 24, wrap: 1.14, dome: 44, step: 6.5, single: 270,
         rows: [{ R: 300, max: 36, s: 1.28 }, { R: 248, max: 33, s: 1.22 }, { R: 196, max: 28, s: 1.14 }] },
  };
  const MAX_STEMS = 24;

  const WRAPS = {
    kraft: { name: 'Kraft', base: '#D3A877', dark: '#B4865A', light: '#EBD3B4' },
    blush: { name: 'Blush', base: '#F4C7C3', dark: '#E09C99', light: '#FBE3E0' },
    sage: { name: 'Sage', base: '#BCCDAE', dark: '#95AC86', light: '#DCE6D3' },
    cream: { name: 'Cream', base: '#F2E8D8', dark: '#D6C5A8', light: '#FBF6EC' },
    midnight: { name: 'Midnight', base: '#3A4066', dark: '#252945', light: '#5B6190' },
  };
  const RIBBONS = {
    ruby: { name: 'Ruby', base: '#C8304C', dark: '#8F1F35' },
    gold: { name: 'Gold', base: '#DDAA3E', dark: '#A87C1F' },
    ivory: { name: 'Ivory', base: '#FAF4EA', dark: '#CDBFA7' },
    lilac: { name: 'Lilac', base: '#AE92D3', dark: '#7D62A6' },
  };

  const STEM = '#5E8A4F';
  const G = { x: 200, y: 405 }; // where all stems gather

  /* ---------- flower heads (drawn around 0,0; stem tip = 0,0) ---------- */
  const rot = (d, extra = '') => `transform="rotate(${d})${extra}"`;

  const HEADS = {
    rose(c) {
      let s = `<circle r="25" fill="${c.dark}"/>`;
      const petal = 'M0,0 C-17,-5 -17,-27 0,-27 C17,-27 17,-5 0,0Z';
      for (let k = 0; k < 6; k++) s += `<path d="${petal}" fill="${c.base}" stroke="${c.dark}" stroke-width="1.2" ${rot(k * 60 + 15)}/>`;
      s += `<circle r="14" fill="${c.base}" stroke="${c.dark}" stroke-width="1.2"/>`;
      for (let k = 0; k < 3; k++) s += `<path d="${petal}" fill="${c.base}" stroke="${c.dark}" stroke-width="1" transform="rotate(${k * 120 + 40}) scale(.5)"/>`;
      s += `<path d="M1,-1 C5,-5 -1,-9 -5,-5 C-9,-1 -4,6 2,5 C8,4 9,-3 6,-8" fill="none" stroke="${c.dark}" stroke-width="1.6" stroke-linecap="round"/>`;
      s += `<ellipse cx="-9" cy="-12" rx="6" ry="3" fill="${c.light}" opacity=".55" transform="rotate(-35 -9 -12)"/>`;
      return s;
    },
    tulip(c) {
      return `<path d="M-13,8 C-19,-8 -12,-24 0,-30 C12,-24 19,-8 13,8 C6,13 -6,13 -13,8Z" fill="${c.dark}"/>
        <path d="M-15,6 C-21,-12 -12,-22 -6,-29 C-2,-16 0,-4 -1,11 C-8,13 -13,10 -15,6Z" fill="${c.base}"/>
        <path d="M15,6 C21,-12 12,-22 6,-29 C2,-16 0,-4 1,11 C8,13 13,10 15,6Z" fill="${c.base}"/>
        <path d="M-9,9 C-12,-6 -6,-20 0,-25 C6,-20 12,-6 9,9 C4,13 -4,13 -9,9Z" fill="${c.base}" stroke="${c.dark}" stroke-width=".8"/>
        <path d="M-4,4 C-6,-6 -3,-14 0,-18" fill="none" stroke="${c.light}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
    },
    daisy(c) {
      let s = '';
      for (let k = 0; k < 14; k++) s += `<ellipse cy="-14" rx="4.6" ry="12" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" ${rot(k * 360 / 14)}/>`;
      s += `<circle r="8.5" fill="${c.light}"/><circle r="8.5" fill="none" stroke="#D9921F" stroke-width="1.2"/>`;
      for (let k = 0; k < 8; k++) s += `<circle cx="0" cy="-4.5" r="1" fill="#C77F12" ${rot(k * 45)}/>`;
      return s;
    },
    sunflower(c) {
      let s = '';
      const petal = 'M0,-9 C6,-16 5,-27 0,-33 C-5,-27 -6,-16 0,-9Z';
      for (let k = 0; k < 18; k++) s += `<path d="${petal}" fill="${c.dark}" ${rot(k * 20 + 10)}/>`;
      for (let k = 0; k < 18; k++) s += `<path d="${petal}" fill="${c.base}" ${rot(k * 20)}/>`;
      s += `<circle r="14" fill="${c.light}"/><circle r="10" fill="#7A4E26"/>`;
      [[4, 6], [8, 10], [11.5, 14]].forEach(([r, n]) => {
        for (let k = 0; k < n; k++) s += `<circle cx="0" cy="${-r}" r="1.2" fill="#3E2512" ${rot(k * 360 / n + r * 7)}/>`;
      });
      return s;
    },
    lavender(c) {
      let s = `<path d="M0,6 L0,-56" stroke="#6E8F5A" stroke-width="2" stroke-linecap="round"/>`;
      for (let i = 0; i < 10; i++) {
        const y = 2 - i * 6, k = 1 - i * 0.055, fill = i % 2 ? c.base : c.dark;
        s += `<ellipse cx="${-3.6 * k}" cy="${y}" rx="${3.8 * k}" ry="${5.4 * k}" fill="${fill}" transform="rotate(-24 ${-3.6 * k} ${y})"/>`;
        s += `<ellipse cx="${3.6 * k}" cy="${y - 3}" rx="${3.8 * k}" ry="${5.4 * k}" fill="${i % 2 ? c.dark : c.base}" transform="rotate(24 ${3.6 * k} ${y - 3})"/>`;
      }
      s += `<ellipse cx="0" cy="-60" rx="2.6" ry="4.4" fill="${c.light}"/>`;
      return s;
    },
    sakura(c) {
      const blossom = (x, y, sc, r) => {
        let s = `<g transform="translate(${x},${y}) scale(${sc}) rotate(${r})">`;
        for (let k = 0; k < 5; k++) s += `<path d="M0,0 C-10,-4 -13,-17 -6,-23 L0,-19 L6,-23 C13,-17 10,-4 0,0Z" fill="${c.base}" stroke="${c.dark}" stroke-width="1" ${rot(k * 72)}/>`;
        s += `<circle r="4" fill="${c.dark}"/>`;
        for (let k = 0; k < 6; k++) s += `<line x1="0" y1="0" x2="0" y2="-8" stroke="#D2577A" stroke-width=".9" ${rot(k * 60 + 10)}/><circle cx="0" cy="-8.5" r="1.3" fill="#C2405F" ${rot(k * 60 + 10)}/>`;
        return s + '</g>';
      };
      return `<path d="M0,10 C-4,0 -10,-4 -14,-2 M0,10 C2,0 8,-2 12,-4" stroke="#7A5440" stroke-width="2" fill="none" stroke-linecap="round"/>` +
        blossom(-12, 2, 0.62, 10) + blossom(12, 0, 0.58, -20) + blossom(0, -10, 0.78, 0) +
        `<ellipse cx="-20" cy="-14" rx="3" ry="4.5" fill="${c.dark}" transform="rotate(-30 -20 -14)"/>`;
    },
    lily(c) {
      let s = '';
      const petal = 'M0,0 C-9,-10 -7,-28 0,-36 C7,-28 9,-10 0,0Z';
      for (let k = 0; k < 3; k++) s += `<path d="${petal}" fill="${c.dark}" ${rot(k * 120 + 60)}/>`;
      for (let k = 0; k < 3; k++) s += `<path d="${petal}" fill="${c.base}" stroke="${c.dark}" stroke-width="1" ${rot(k * 120)}/><path d="M0,-3 L0,-24" stroke="${c.light}" stroke-width="2.2" stroke-linecap="round" ${rot(k * 120)}/>`;
      s += `<circle r="4" fill="${c.light}"/>`;
      for (let k = 0; k < 6; k++) s += `<line x1="0" y1="0" x2="0" y2="-15" stroke="#B7C483" stroke-width="1" ${rot(k * 60 + 30)}/><ellipse cx="0" cy="-16" rx="1.6" ry="3" fill="#C8692B" ${rot(k * 60 + 30)}/>`;
      return s;
    },
    babysbreath(c) {
      const pts = [[0, -18], [-12, -12], [12, -13], [-18, 0], [18, -1], [-8, -2], [8, -4], [0, 4], [-13, 10], [13, 9], [-4, -24], [6, -22], [-20, -10], [20, -12], [0, -8], [-6, 14], [7, 15]];
      let s = '';
      pts.forEach(([x, y]) => (s += `<path d="M0,10 Q${x * 0.3},${(y + 10) / 2} ${x},${y}" stroke="#8FA77F" stroke-width=".7" fill="none"/>`));
      pts.forEach(([x, y], i) => (s += `<circle cx="${x}" cy="${y}" r="${2.6 + (i % 3) * 0.5}" fill="${c.base}" stroke="${c.dark}" stroke-width=".6"/>`));
      return s;
    },
    peony(c) {
      let s = `<circle r="27" fill="${c.dark}"/>`;
      const outer = 'M0,0 C-15,-3 -17,-25 -6,-28 C-1,-30 5,-30 10,-27 C18,-22 13,-4 0,0Z';
      for (let k = 0; k < 8; k++) s += `<path d="${outer}" fill="${c.base}" stroke="${c.dark}" stroke-width=".9" ${rot(k * 45)}/>`;
      for (let k = 0; k < 7; k++) s += `<path d="${outer}" fill="${c.light}" stroke="${c.dark}" stroke-width=".8" transform="rotate(${k * 51 + 20}) scale(.72)"/>`;
      for (let k = 0; k < 6; k++) s += `<path d="${outer}" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" transform="rotate(${k * 60 + 8}) scale(.46)"/>`;
      s += `<path d="M-4,-2 C-2,-6 3,-6 4,-1 C5,3 0,5 -3,3" fill="none" stroke="${c.dark}" stroke-width="1.3" stroke-linecap="round"/>`;
      return s;
    },
    carnation(c) {
      const frill = 'M0,0 L-8,-17 L-6,-21 L-3.5,-18 L-1.5,-22.5 L0.5,-18.5 L3,-22 L5,-18 L7.5,-20.5 L8,-16 Z';
      let s = '';
      for (let k = 0; k < 12; k++) s += `<path d="${frill}" fill="${c.dark}" transform="rotate(${k * 30}) scale(1.15)"/>`;
      for (let k = 0; k < 12; k++) s += `<path d="${frill}" fill="${c.base}" transform="rotate(${k * 30 + 15}) scale(.92)"/>`;
      for (let k = 0; k < 9; k++) s += `<path d="${frill}" fill="${c.light}" transform="rotate(${k * 40 + 5}) scale(.58)"/>`;
      return s + `<circle r="3" fill="${c.dark}"/>`;
    },
    ranunculus(c) {
      let s = '';
      [26, 22, 18, 14.5, 11, 8, 5].forEach((r, i) => {
        s += `<circle cy="${-(26 - r) * 0.18}" r="${r}" fill="${i % 2 ? c.light : c.base}" stroke="${c.dark}" stroke-width=".9"/>`;
      });
      return s + `<circle cy="-4.3" r="2.6" fill="#8DAA6B"/>`;
    },
    poppy(c) {
      let s = '';
      for (let k = 0; k < 4; k++) s += `<ellipse cy="-12" rx="15" ry="14" fill="${c.base}" stroke="${c.dark}" stroke-width=".9" ${rot(k * 90 + 45)}/>`;
      for (let k = 0; k < 4; k++) s += `<ellipse cy="-9" rx="11" ry="10" fill="${c.light}" opacity=".55" ${rot(k * 90)}/>`;
      for (let k = 0; k < 14; k++) s += `<circle cx="0" cy="-10" r="1.4" fill="#2E2226" ${rot(k * 360 / 14)}/>`;
      return s + `<circle r="6.5" fill="#3A2C30"/><circle r="2.5" fill="#6B8F55"/>`;
    },
    gerbera(c) {
      const petal = 'M0,-8 C3,-14 3,-24 0,-29 C-3,-24 -3,-14 0,-8Z';
      let s = '';
      for (let k = 0; k < 22; k++) s += `<path d="${petal}" fill="${c.dark}" ${rot(k * 360 / 22 + 8)}/>`;
      for (let k = 0; k < 22; k++) s += `<path d="${petal}" fill="${c.base}" transform="rotate(${k * 360 / 22}) scale(.8)"/>`;
      return s + `<circle r="9" fill="#4A3020"/><circle r="9" fill="none" stroke="${c.light}" stroke-width="2.6" stroke-dasharray="2 2.2"/><circle r="4" fill="#2E1D12"/>`;
    },
    hydrangea(c) {
      const pts = [[0, 0], [11, 0], [-11, 0], [5.5, 9.5], [-5.5, 9.5], [5.5, -9.5], [-5.5, -9.5], [16.5, -9.5], [-16.5, -9.5], [16.5, 9.5], [-16.5, 9.5], [0, -19], [11, -19], [-11, -19], [0, 19], [11, 18], [-11, 18], [22, 0], [-22, 0]];
      let s = `<circle r="26" fill="${c.dark}" opacity=".55"/>`;
      pts.forEach(([x, y], i) => {
        const col = i % 3 === 0 ? c.light : i % 3 === 1 ? c.base : c.dark;
        s += `<g transform="translate(${x},${y}) rotate(${(i * 23) % 90})">`;
        for (let k = 0; k < 4; k++) s += `<ellipse cy="-3.6" rx="3.4" ry="4.4" fill="${col}" stroke="${c.dark}" stroke-width=".4" ${rot(k * 90)}/>`;
        s += `<circle r="1.2" fill="#fff" opacity=".85"/></g>`;
      });
      return s;
    },
    forgetmenot(c) {
      const spots = [[0, 0, 1], [-12, -6, 0.85], [11, -8, 0.9], [-4, -17, 0.8], [9, 7, 0.75], [-10, 9, 0.7], [3, -27, 0.6]];
      let s = '';
      spots.forEach(([x, y]) => (s += `<path d="M0,12 Q${x * 0.4},${(y + 12) / 2} ${x},${y}" stroke="#6E8F5A" stroke-width=".9" fill="none"/>`));
      spots.forEach(([x, y, k]) => {
        s += `<g transform="translate(${x},${y}) scale(${k})">`;
        for (let p = 0; p < 5; p++) s += `<circle cy="-4" r="3.9" fill="${c.base}" stroke="${c.dark}" stroke-width=".5" ${rot(p * 72)}/>`;
        s += `<circle r="2.2" fill="#fff"/><circle r="1.3" fill="${c.light}"/></g>`;
      });
      return s;
    },
    orchid(c) {
      const lip = c.accent || c.dark;
      let s = '';
      [0, 125, 235].forEach(a => (s += `<ellipse cy="-15" rx="6" ry="16" fill="${c.light}" stroke="${c.dark}" stroke-width=".7" ${rot(a)}/>`));
      s += `<ellipse cx="-12" cy="-5" rx="12" ry="13" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" transform="rotate(-28 -12 -5)"/>`;
      s += `<ellipse cx="12" cy="-5" rx="12" ry="13" fill="${c.base}" stroke="${c.dark}" stroke-width=".8" transform="rotate(28 12 -5)"/>`;
      [[-14, -6], [-10, -1], [14, -6], [10, -1], [-16, -1], [16, -1]].forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="1.1" fill="${lip}" opacity=".55"/>`));
      s += `<path d="M-7,3 C-11,13 -5,21 0,21 C5,21 11,13 7,3 C4,7 -4,7 -7,3Z" fill="${lip}"/>`;
      return s + `<ellipse cy="-1" rx="3" ry="4.2" fill="#fff"/><circle cy="-2" r="1.2" fill="#F7C948"/>`;
    },
    eucalyptus(c) {
      let s = `<path d="M0,6 L0,-58" stroke="#6F8C78" stroke-width="2" stroke-linecap="round"/>`;
      for (let i = 0; i < 7; i++) {
        const y = -2 - i * 8.5, k = 1 - i * 0.07;
        s += `<circle cx="${-6.5 * k}" cy="${y}" r="${5.6 * k}" fill="${i % 2 ? c.base : c.dark}" stroke="${c.light}" stroke-width=".5"/>`;
        s += `<circle cx="${6.5 * k}" cy="${y - 4}" r="${5.6 * k}" fill="${i % 2 ? c.dark : c.base}" stroke="${c.light}" stroke-width=".5"/>`;
      }
      return s;
    },
  };

  const TYPE_SCALE = { sunflower: 1.12, lily: 1.08, babysbreath: 1.05, peony: 1.12, hydrangea: 1.06, gerbera: 1.04 };
  const THUMB_VB = {
    lavender: '-30 -66 60 76', eucalyptus: '-30 -66 60 76', tulip: '-28 -36 56 52', sakura: '-30 -32 60 50',
    babysbreath: '-26 -30 52 48', forgetmenot: '-24 -36 48 52', orchid: '-30 -34 60 60',
  };
  const UPRIGHT = { tulip: 1, lavender: 1, eucalyptus: 1 }; // heads that follow the stem direction

  function headThumb(id) {
    const f = BY_ID[id];
    return `<svg viewBox="${THUMB_VB[f.type] || '-36 -36 72 72'}" aria-hidden="true" focusable="false">${HEADS[f.type](f.c)}</svg>`;
  }

  /* ---------- layout ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Stems are dealt round-robin into rows (tallest first); heads sit on a dome.
  // Posy and Classic use two rows, Grand uses three once it has more than 8 stems.
  function layout(ids, seed, size) {
    const Z = SIZES[size] || SIZES.m;
    const n = ids.length, out = new Array(n), r = rng(seed || 1);
    const all = ids.map((_, i) => i);
    const k = n <= 3 ? 1 : Z.rows.length === 3 && n <= 8 ? 2 : Z.rows.length;
    const rows = Array.from({ length: k }, (_, row) => all.filter(i => i % k === row));
    rows.forEach((idxs, row) => {
      const m = idxs.length, c = k === 1 ? { ...Z.rows[0], R: Z.single } : Z.rows[row];
      const half = Math.min(c.max, Z.step * (m - 1));
      idxs.forEach((idx, j) => {
        const t = m > 1 ? (j / (m - 1)) * 2 - 1 : 0;
        const type = BY_ID[ids[idx]].type;
        out[idx] = {
          a: t * half + (r() - 0.5) * 5,
          r: c.R - t * t * Z.dome + (r() - 0.5) * 12,
          s: c.s * (TYPE_SCALE[type] || 1) * (0.95 + r() * 0.1),
          row,
          leaf: idx % 3 === 1 ? (r() < 0.5 ? -1 : 1) : 0,
        };
      });
    });
    return out;
  }

  function drawOrder(pos) {
    return pos.map((_, i) => i).sort((i, j) => pos[i].row - pos[j].row || Math.abs(pos[j].a) - Math.abs(pos[i].a));
  }

  const n1 = v => Math.round(v * 10) / 10;
  function headTransform(id, p) {
    const type = BY_ID[id].type;
    const tilt = UPRIGHT[type] ? 0 : type === 'lily' || type === 'orchid' ? -p.a * 0.3 : -p.a * 0.55;
    return `translate(0px,${n1(-p.r)}px) rotate(${n1(tilt)}deg) scale(${n1(p.s * 100) / 100})`;
  }
  const groupTransform = p => `translate(${G.x}px,${G.y}px) rotate(${n1(p.a)}deg)`;

  function stemMarkup(id, p, o = {}) {
    const f = BY_ID[id];
    const leaf = p.leaf
      ? `<path class="leaf" d="M0,0 C7,-9 19,-11 28,-5 C19,1 8,4 0,0Z" fill="#86A872" stroke="${STEM}" stroke-width=".8" style="transform:translate(0px,${n1(-p.r * 0.42)}px) scale(${p.leaf},1)"/>`
      : '';
    return `<g class="sg${o.animate ? ' enter' : ''}" data-uid="${o.uid || ''}" style="transform:${groupTransform(p)};--len:${n1(p.r)};--d:${(o.delay || 0).toFixed(2)}s;--bd:${(4 + ((p.a * 7) % 2 + 2) % 2).toFixed(2)}s">` +
      `<path class="stem" d="M0,0 Q6,-150 0,-300" fill="none" stroke="${STEM}" stroke-width="3" stroke-linecap="round" style="stroke-dasharray:${n1(p.r)} 1000"/>` +
      leaf +
      `<g class="head" style="transform:${headTransform(id, p)}"><g class="bloom">${HEADS[f.type](f.c)}</g></g></g>`;
  }

  function applyPos(g, id, p) {
    g.style.transform = groupTransform(p);
    g.style.setProperty('--len', n1(p.r));
    g.querySelector('.stem').style.strokeDasharray = `${n1(p.r)} 1000`;
    g.querySelector('.head').style.transform = headTransform(id, p);
    const leaf = g.querySelector('.leaf');
    if (leaf) leaf.style.transform = leaf.style.transform.replace(/translate\([^)]*\)/, `translate(0px,${n1(-p.r * 0.42)}px)`);
  }

  /* ---------- wrap, greenery, ribbon ---------- */
  function greens() {
    const sprig = (a, len, d) => {
      let s = `<g style="transform:translate(${G.x}px,${G.y}px) rotate(${a}deg)"><g class="sprig-in" style="--d:${d}s"><path d="M0,0 Q5,${-len / 2} 0,${-len}" stroke="#7E9C86" stroke-width="2.2" fill="none"/>`;
      for (let y = 70, i = 0; y < len; y += 22, i++) {
        const x = i % 2 ? 9 : -9;
        s += `<ellipse cx="${x}" cy="${-y}" rx="8.5" ry="6.5" fill="${i % 3 ? '#9DB8A4' : '#88A692'}" transform="rotate(${x > 0 ? 20 : -20} ${x} ${-y})"/>`;
      }
      return s + '</g></g>';
    };
    return `<g class="greens">${sprig(-42, 225, 0.2)}${sprig(41, 215, 0.3)}${sprig(14, 262, 0.25)}${sprig(-18, 250, 0.35)}</g>`;
  }

  const wrapBack = w =>
    `<g class="wrap-back"><path data-tone="dark" d="M54,232 Q200,176 346,232 L236,448 L164,448 Z" style="fill:${w.dark}"/>` +
    `<path data-tone="light" d="M86,236 Q200,200 314,236 L230,440 L170,440 Z" style="fill:${w.light}" opacity=".7"/></g>`;

  const wrapFront = w =>
    `<g class="wrap-front"><path data-tone="base" d="M70,262 L200,342 L330,262 L236,466 L164,466 Z" style="fill:${w.base}"/>` +
    `<path d="M70,262 L200,342 L164,466 Z" fill="#000" opacity=".07"/>` +
    `<path d="M200,342 L200,466 M120,300 L178,452 M280,300 L222,452" stroke="#000" stroke-opacity=".06" stroke-width="1.5" fill="none"/>` +
    `<path d="M70,262 L200,342 L330,262" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/></g>`;

  const ribbon = (r, delay) =>
    `<g class="ribbon"><g class="ribbon-in" style="--d:${delay.toFixed(2)}s">` +
    `<path data-tone="base" d="M196,414 L176,458 L186,453 L190,463 L203,418Z" style="fill:${r.base}"/>` +
    `<path data-tone="base" d="M204,414 L224,458 L214,453 L210,463 L197,418Z" style="fill:${r.base}"/>` +
    `<path data-tone="base" d="M200,410 C184,390 158,394 163,410 C168,426 188,422 200,410Z" style="fill:${r.base}"/>` +
    `<path data-tone="base" d="M200,410 C216,390 242,394 237,410 C232,426 212,422 200,410Z" style="fill:${r.base}"/>` +
    `<path data-tone="dark" d="M200,410 C190,402 176,400 172,407 M200,410 C210,402 224,400 228,407" style="stroke:${r.dark}" stroke-width="1.5" fill="none"/>` +
    `<ellipse data-tone="dark" cx="200" cy="411" rx="6.5" ry="5.5" style="fill:${r.dark}"/></g></g>`;

  // The paper, greenery and ribbon scale around the gathering point with the bouquet size.
  const scaleStyle = size => {
    const k = (SIZES[size] || SIZES.m).wrap;
    return `transform:translate(${G.x}px,${G.y}px) scale(${k}) translate(${-G.x}px,${-G.y}px)`;
  };
  const VIEWBOX = '5 25 390 460';

  function bouquetSVG(ids, o = {}) {
    const w = WRAPS[o.w] || WRAPS.kraft, rb = RIBBONS[o.r] || RIBBONS.ruby;
    const pos = layout(ids, o.seed, o.size);
    const order = drawOrder(pos);
    const step = ids.length > 14 ? 0.08 : 0.13;
    const start = o.delay || 0.35;
    let stems = '';
    order.forEach((idx, k) => (stems += stemMarkup(ids[idx], pos[idx], { animate: o.animate, delay: start + k * step })));
    const sc = scaleStyle(o.size);
    const inner = `<g class="scale-group" style="${sc}">${greens()}${wrapBack(w)}</g>` + `<g class="stems">${stems}</g>` +
      `<g class="scale-group" style="${sc}">${wrapFront(w)}${ribbon(rb, start + ids.length * step + 0.5)}</g>`;
    if (!o.standalone) return inner;
    const W = o.width || 780;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" width="${W}" height="${Math.round(W * 460 / 390)}">${inner}</svg>`;
  }

  function skeleton(wKey, rKey, size) {
    const sc = scaleStyle(size);
    return `<g class="scale-group" style="${sc}">${greens()}${wrapBack(WRAPS[wKey])}</g><g class="stems"></g>` +
      `<g class="scale-group" style="${sc}">${wrapFront(WRAPS[wKey])}${ribbon(RIBBONS[rKey], 0.6)}</g>`;
  }

  function setSize(svg, size) {
    const sc = scaleStyle(size).replace('transform:', '');
    svg.querySelectorAll('.scale-group').forEach(g => (g.style.transform = sc));
  }

  function recolor(svg, wKey, rKey) {
    const w = WRAPS[wKey], r = RIBBONS[rKey];
    svg.querySelectorAll('.wrap-back [data-tone], .wrap-front [data-tone]').forEach(el => (el.style.fill = w[el.dataset.tone]));
    svg.querySelectorAll('.ribbon [data-tone]').forEach(el => {
      if (el.tagName === 'path' && el.style.stroke) el.style.stroke = r[el.dataset.tone];
      else el.style.fill = r[el.dataset.tone];
    });
  }

  window.Flora = {
    CATALOG, BY_ID, MOODS, SIZES, MAX_STEMS, WRAPS, RIBBONS, HEADS, VIEWBOX,
    headThumb, layout, drawOrder, stemMarkup, applyPos, bouquetSVG, skeleton, setSize, recolor,
  };
})();
