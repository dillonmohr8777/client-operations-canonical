// Momentum AI launch films — shared runtime.
// Owns: three.js loading, an ALPHA-PRESERVING renderer, the deterministic clock,
// player controls, the 9:16/16:9 switch, the preview background (DOM only, never
// part of the exported object layer), the brand end card, and the RGBA frame
// export path. Each film supplies its own scene + renderFrameAt(t); nothing about
// the five scenes lives here.

export const FPS = 30;

/* ---------------- math ---------------- */
export const cl = (x, a, b) => Math.max(a, Math.min(b, x));
export const sm = (x) => { const t = cl(x, 0, 1); return t * t * (3 - 2 * t); };
export const ez = (x) => { const t = cl(x, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const eo = (x) => { const t = cl(x, 0, 1); return 1 - Math.pow(1 - t, 3); };
export const ei = (x) => { const t = cl(x, 0, 1); return t * t * t; };
export const back = (x, c) => { const t = cl(x, 0, 1), k = c === undefined ? 1.5 : c; return 1 + (k + 1) * Math.pow(t - 1, 3) + k * Math.pow(t - 1, 2); };
export const lp = (a, b, k) => a + (b - a) * k;
export const lp3 = (a, b, k) => [lp(a[0], b[0], k), lp(a[1], b[1], k), lp(a[2], b[2], k)];
// deterministic hash noise — identical on every pass, so exports are reproducible
export const rnd = (i) => { let s = (Math.floor(i) * 1103515245 + 12345) & 0x7fffffff; s = (s ^ (s >>> 13)) & 0x7fffffff; s = (s * 1103515245 + 12345) & 0x7fffffff; return (s % 100000) / 100000; };
export const rn11 = (i) => rnd(i) * 2 - 1;

/* ---------------- palette (design system, exact) ---------------- */
export const C = {
  midnight: 0x03172e, navy: 0x072d53, blue: 0x1766ab, electric: 0x2f7fc4,
  gold: 0xefb928, pale: 0xd5e4f1, paper: 0xf0f5f9, white: 0xffffff, ink: 0x102d49
};
export const CSS = {
  midnight: '#03172e', navy: '#072d53', blue: '#1766ab', electric: '#2f7fc4',
  gold: '#efb928', pale: '#d5e4f1', paper: '#f0f5f9', white: '#ffffff',
  ink: '#102d49', muted: '#52677c', line: '#d5e0e9'
};

export async function loadThree() {
  try { return await import('https://unpkg.com/three@0.184.0/build/three.module.js'); }
  catch (e) { return null; }
}

export function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
}

export function loadImages(map) {
  const keys = Object.keys(map);
  return Promise.all(keys.map(k => new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res([k, im]);
    im.onerror = () => rej(new Error('image failed: ' + map[k]));
    im.src = map[k];
  }))).then(pairs => { const o = {}; pairs.forEach(p => o[p[0]] = p[1]); return o; });
}

/* ---------------- alpha-safe helpers ---------------- */

// A transparent canvas texture. Nothing is filled behind the ink, so the texture
// carries real alpha and there is no rectangle to hide in the export.
export function textTexture(T, draw, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.clearRect(0, 0, w, h);
  draw(x, w, h);
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  t.anisotropy = 4;
  t.premultiplyAlpha = false;
  return t;
}

export function imageTexture(T, img) {
  const t = new T.Texture(img);
  t.colorSpace = T.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

// Additive glow that ALSO accumulates alpha. Plain AdditiveBlending leaves dst
// alpha at zero on a transparent canvas, so a glow would vanish (or fringe) in the
// RGBA export. Custom blending adds src alpha into the destination instead.
export function glowMaterial(T, opts) {
  const o = opts || {};
  const m = new T.MeshBasicMaterial({
    color: o.color === undefined ? C.electric : o.color,
    map: o.map || null,
    transparent: true,
    depthWrite: false,
    depthTest: o.depthTest !== false,
    side: o.side || T.DoubleSide,
    opacity: o.opacity === undefined ? 1 : o.opacity
  });
  applyAdditiveAlpha(T, m);
  return m;
}

export function applyAdditiveAlpha(T, m) {
  m.blending = T.CustomBlending;
  m.blendEquation = T.AddEquation;
  m.blendSrc = T.SrcAlphaFactor;
  m.blendDst = T.OneFactor;
  m.blendEquationAlpha = T.AddEquation;
  m.blendSrcAlpha = T.OneFactor;
  m.blendDstAlpha = T.OneFactor;
  m.premultipliedAlpha = false;
  return m;
}

export function pointsMaterial(T, opts) {
  const o = opts || {};
  const m = new T.PointsMaterial({
    size: o.size === undefined ? 0.03 : o.size,
    vertexColors: o.vertexColors !== false,
    color: o.color === undefined ? 0xffffff : o.color,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: o.sizeAttenuation !== false,
    opacity: o.opacity === undefined ? 1 : o.opacity,
    map: o.map || null
  });
  if (o.additive) applyAdditiveAlpha(T, m);
  return m;
}

// A soft round sprite, drawn as a texture so points are discs rather than squares
// and carry their own alpha falloff.
export function dotTexture(T, hard) {
  return textTexture(T, (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    if (hard) {
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.62, 'rgba(255,255,255,1)');
      g.addColorStop(0.78, 'rgba(255,255,255,0.5)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
    } else {
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(255,255,255,0.72)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
    }
    x.fillStyle = g;
    x.beginPath(); x.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); x.fill();
  }, 64, 64);
}

// Studio lighting with no environment map and no ground plane — nothing that would
// bake a background into a transparent frame.
export function studioLights(T, scene, opts) {
  const o = opts || {};
  scene.add(new T.HemisphereLight(0x9fc4e8, 0x0a2036, o.hemi === undefined ? 0.55 : o.hemi));
  const key = new T.DirectionalLight(0xffffff, o.key === undefined ? 1.5 : o.key);
  key.position.set(-3.1, 4.6, 4.2);
  scene.add(key);
  const fill = new T.DirectionalLight(C.electric, o.fill === undefined ? 0.55 : o.fill);
  fill.position.set(4.2, 1.2, 3.0);
  scene.add(fill);
  const rim = new T.DirectionalLight(C.gold, o.rim === undefined ? 0.3 : o.rim);
  rim.position.set(0.6, -1.4, -3.2);
  scene.add(rim);
  return { key: key, fill: fill, rim: rim };
}

/* ---------------- the brand end card, in-scene ---------------- */
// Built as textured planes inside the WebGL scene, so the exact logo master and the
// launch line live in the SAME RGBA object layer as the film. There is no separate
// DOM burn-in and no opaque plate behind the type.
//
// Two variants are built and the runtime shows the one matching the frame. A single
// wide card scaled down for 9:16 either crops the kicker or shrinks the whole card
// into illegibility, so portrait gets its own layout: a narrower plane inside a safe
// margin, the kicker set over two lines, and every line auto-fitted to its own box.

// Shrink a line until it fits the box, so no string can ever run past the plane edge.
function fitFont(x, text, maxW, startPx, weight, face, track) {
  let px = startPx;
  for (let i = 0; i < 40; i++) {
    x.font = weight + ' ' + Math.round(px) + 'px ' + face;
    if (track) x.letterSpacing = Math.max(1, Math.round(px * track)) + 'px';
    if (x.measureText(text).width <= maxW || px <= startPx * 0.42) break;
    px *= 0.94;
  }
  return Math.round(px);
}

function textPlane(T, lines, planeW, planeH, draw) {
  const TW = 1400;
  const TH = Math.max(2, Math.round(TW * planeH / planeW));
  const mesh = new T.Mesh(new T.PlaneGeometry(planeW, planeH), new T.MeshBasicMaterial({
    map: textTexture(T, (x, w, h) => draw(x, w, h, lines), TW, TH),
    transparent: true, depthWrite: false, side: T.DoubleSide, toneMapped: false
  }));
  mesh.material.opacity = 0;
  return mesh;
}

function splitKicker(text) {
  const words = String(text || '').trim().split(/\s+/);
  if (words.length < 2) return [text];
  // break after the verb so the two lines read as a sentence, not a wrap accident
  const i = words.length >= 4 ? 1 : Math.ceil(words.length / 2);
  return [words.slice(0, i).join(' '), words.slice(i).join(' ')];
}

export function buildEndCard(T, logoImg, opts) {
  const o = opts || {};
  const face = o.face || 'Archivo, sans-serif';
  const kicker = (o.kicker || 'Introducing our AI division').toUpperCase();
  const inkColor = o.dark ? CSS.navy : CSS.white;

  const build = (portrait) => {
    const grp = new T.Group();
    const headLines = String(portrait && o.portraitLine ? o.portraitLine : o.line || '')
      .split('|').map(s => s.trim()).filter(Boolean);
    // safe box: the plane never exceeds this, and the frustum at the card's distance
    // is wider still, so nothing can touch the frame edge
    const W = portrait ? 2.86 : 5.4;

    const lw = portrait ? 1.92 : 2.5;
    const lh = lw * (logoImg.height / logoImg.width);
    const logo = new T.Mesh(new T.PlaneGeometry(lw, lh), new T.MeshBasicMaterial({
      map: imageTexture(T, logoImg), transparent: true, depthWrite: false,
      side: T.DoubleSide, toneMapped: false
    }));
    logo.material.opacity = 0;
    grp.add(logo);

    const kLines = portrait ? splitKicker(kicker) : [kicker];
    const kH = portrait ? W * 0.2 : W * 0.09;
    const kick = textPlane(T, kLines, W, kH, (x, w, h, lines) => {
      const rowH = h / lines.length;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      lines.forEach((ln, i) => {
        fitFont(x, ln, w * 0.94, rowH * 0.5, '900', 'Nunito, sans-serif', 0.16);
        x.fillStyle = CSS.gold;
        x.fillText(ln, w / 2, rowH * (i + 0.5));
      });
      x.letterSpacing = '0px';
    });
    grp.add(kick);

    const hH = portrait ? W * 0.42 * headLines.length : W * 0.155 * headLines.length;
    const head = textPlane(T, headLines, W, hH, (x, w, h, lines) => {
      const rowH = h / lines.length;
      x.textBaseline = 'middle';
      lines.forEach((ln, i) => {
        const dot = ln.endsWith('.');
        const body = dot ? ln.slice(0, -1) : ln;
        const px = fitFont(x, ln, w * 0.92, rowH * 0.72, '800', face, 0);
        x.font = '800 ' + px + 'px ' + face;
        x.textAlign = 'left';
        const bw = x.measureText(body).width;
        const dw = dot ? x.measureText('.').width : 0;
        const x0 = w / 2 - (bw + dw) / 2;
        const y = rowH * (i + 0.5);
        x.fillStyle = inkColor;
        x.fillText(body, x0, y);
        if (dot) { x.fillStyle = CSS.gold; x.fillText('.', x0 + bw, y); }
      });
    });
    grp.add(head);

    // stack from the top of the block so the gaps stay optical, not arithmetic
    const gap1 = portrait ? 0.42 : 0.3;
    const gap2 = portrait ? 0.3 : 0.2;
    const total = lh + gap1 + kH + gap2 + hH;
    let y = total / 2;
    y -= lh / 2; logo.position.set(0, y, 0); y -= lh / 2 + gap1;
    y -= kH / 2; kick.position.set(0, y, 0); y -= kH / 2 + gap2;
    y -= hH / 2; head.position.set(0, y, 0);

    grp.userData = { parts: [logo, kick, head], width: W, height: total };
    grp.visible = false;
    return grp;
  };

  const g = new T.Group();
  const wide = build(false);
  const portrait = build(true);
  g.add(wide);
  g.add(portrait);
  g.visible = false;
  g.userData = { wide: wide, portrait: portrait };
  return g;
}

// Reveal: each line clips in from the left over its own window, so the card lands
// as a designed sequence rather than a group fade.
export function playEndCard(card, k, portrait) {
  const u = card.userData;
  card.visible = k > 0.001;
  const on = portrait ? u.portrait : u.wide;
  const off = portrait ? u.wide : u.portrait;
  off.visible = false;
  if (!card.visible) { on.visible = false; return; }
  on.visible = true;
  const p = on.userData.parts;
  const wins = [[0, 0.5], [0.22, 0.66], [0.38, 0.9]];
  for (let i = 0; i < p.length; i++) {
    const w = wins[i];
    const a = sm((k - w[0]) / Math.max(0.001, w[1] - w[0]));
    p[i].material.opacity = a;
    p[i].scale.set(lp(0.965, 1, a), lp(0.965, 1, a), 1);
  }
}

/* ---------------- the runtime ---------------- */
export class FilmRuntime {
  // host: { stage, canvas, refs, duration, authored, onResize, renderFrameAt, beats, label }
  constructor(host) {
    this.h = host;
    this.AUTH = host.authored || 18;
    this.dur = this.AUTH;
    this.t = 0;
    this.playing = true;
    this.mob = false;
    this.frame = '16:9';
    this.bg = 'navy';
    this.sound = false;
    this.staticMode = false;
    this.scrubbing = false;
    this.dead = false;
  }

  mount() {
    const h = this.h, s = h.stage;
    s.addEventListener('data-om-seek-to-time-frame', this.onSeek);
    s.addEventListener('keydown', this.onKey);
    s.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(s);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.staticMode = true;
    this.applyBg(this.bg);
    this.syncControls();
    // deterministic export surface, documented in the receipt
    window.__momentumFilm = window.__momentumFilm || {};
    window.__momentumFilm[h.id || 'film'] = {
      fps: FPS,
      authoredSeconds: this.AUTH,
      frames: Math.round(this.AUTH * FPS),
      aspects: ['16:9', '9:16'],
      renderFrameAt: (n) => this.renderFrameAt(n),
      seekSeconds: (sec) => this.renderFrameAt(Math.round(sec * FPS)),
      setAspect: (a) => this.setFrame(a),
      capturePNG: () => this.capturePNG(),
      alphaObjectLayer: true
    };
    return this;
  }

  unmount() {
    this.dead = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.ro) this.ro.disconnect();
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
  }

  start() {
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  loop = (now) => {
    if (this.dead) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.playing && !this.staticMode) {
      this.t += dt * (this.AUTH / this.dur);
      if (this.t >= this.AUTH) { this.t = this.AUTH; this.playing = false; this.syncPlay(); }
      if (this.h.onCue) this.h.onCue(this.t, this.sound);
    }
    this.draw(this.t);
  };

  draw(t) {
    // Belt and braces: the ResizeObserver can miss a change when the frame is hidden
    // or when only the aspect-ratio property is rewritten, which would leave the
    // renderer at the previous size and export a letterboxed portrait. Any mismatch is
    // caught here, on the next rendered frame.
    const s = this.h.stage;
    const cw = s.clientWidth, ch = s.clientHeight;
    if (cw && ch && (cw !== this._cw || ch !== this._ch)) this.applySize(cw, ch);
    if (this.h.renderFrameAt) this.h.renderFrameAt(t);
    this.syncReadout(t);
  }

  applySize(cw, ch) {
    this._cw = cw;
    this._ch = ch;
    const mob = cw / Math.max(1, ch) < 1.05;
    const changed = mob !== this.mob;
    this.mob = mob;
    if (this.h.onResize) this.h.onResize(cw, ch, mob, changed);
  }

  // deterministic: frame n of the authored clock, independent of playback duration
  renderFrameAt(n) {
    const t = cl(n / FPS, 0, this.AUTH);
    this.playing = false;
    this.t = t;
    this.syncPlay();
    this.draw(t);
    return { frame: n, seconds: Number(t.toFixed(4)) };
  }

  capturePNG() {
    try { return this.h.canvas.toDataURL('image/png'); }
    catch (e) { return null; }
  }

  // React's defaultValue does not survive the template mount reliably, so the selects
  // are driven from the clock rather than the other way round: the readout can never
  // claim a duration the film is not actually playing.
  syncControls() {
    const r = this.h.refs;
    const d = r.durSel && r.durSel.current;
    if (d && d.value !== String(this.dur)) d.value = String(this.dur);
    const f = r.frameSel && r.frameSel.current;
    if (f && f.value !== this.frame) f.value = this.frame;
  }

  syncReadout(t) {
    this.syncControls();
    const r = this.h.refs;
    if (r.scrub && r.scrub.current && !this.scrubbing) {
      r.scrub.current.value = String(Math.round((t / this.AUTH) * 1000));
    }
    if (r.timeLabel && r.timeLabel.current) {
      r.timeLabel.current.textContent = (t / this.AUTH * this.dur).toFixed(1) + ' / ' + this.dur.toFixed(1) + 's';
    }
    if (r.frameLabel && r.frameLabel.current) {
      r.frameLabel.current.textContent = 'frame ' + String(Math.round(t * FPS)).padStart(3, '0') + ' / ' + Math.round(this.AUTH * FPS);
    }
    const beats = this.h.beats;
    if (beats && r.beatLine && r.beatLine.current) {
      let i = 0;
      for (let j = 0; j < beats.length; j++) if (t >= beats[j].t - 0.001) i = j;
      const b = beats[i];
      r.beatLine.current.textContent = b.n + ' · ' + b.k + ' · ' + b.span;
      this.h.stage.setAttribute('data-screen-label', (this.h.label || 'Film') + ' · ' + b.n + ' ' + b.k + ' · ' + t.toFixed(1) + 's');
    } else {
      this.h.stage.setAttribute('data-screen-label', (this.h.label || 'Film') + ' · ' + t.toFixed(1) + 's');
    }
  }

  resize() {
    const s = this.h.stage;
    const cw = s.clientWidth || 960, ch = s.clientHeight || 540;
    this.applySize(cw, ch);
    this.draw(this.t);
  }

  /* ---- preview background: DOM only. Never rendered into the canvas, so it can
     never reach the exported RGBA object layer. ---- */
  applyBg(kind) {
    this.bg = kind;
    const el = this.h.refs.bgLayer && this.h.refs.bgLayer.current;
    if (!el) return;
    if (kind === 'white') {
      el.style.background = '#ffffff';
      el.style.backgroundImage = 'none';
    } else if (kind === 'checker') {
      el.style.background = '#ffffff';
      el.style.backgroundImage =
        'linear-gradient(45deg,#c9d6e2 25%,transparent 25%,transparent 75%,#c9d6e2 75%),' +
        'linear-gradient(45deg,#c9d6e2 25%,transparent 25%,transparent 75%,#c9d6e2 75%)';
      el.style.backgroundSize = '28px 28px';
      el.style.backgroundPosition = '0 0, 14px 14px';
    } else {
      el.style.background = CSS.midnight;
      el.style.backgroundImage = 'none';
    }
    const btns = this.h.refs.bgBtns || [];
    const keys = ['navy', 'white', 'checker'];
    btns.forEach((ref, i) => {
      const b = ref && ref.current;
      if (!b) return;
      const on = keys[i] === kind;
      b.style.background = on ? CSS.navy : '#fff';
      b.style.color = on ? '#fff' : CSS.navy;
      b.style.borderColor = on ? CSS.navy : CSS.line;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  setFrame(a) {
    this.frame = a;
    const s = this.h.stage, p = a === '9:16';
    s.style.aspectRatio = p ? '9/16' : '16/9';
    s.style.maxWidth = p ? '420px' : 'none';
    s.style.marginLeft = p ? 'auto' : '0';
    s.style.marginRight = p ? 'auto' : '0';
    const sel = this.h.refs.frameSel && this.h.refs.frameSel.current;
    if (sel && sel.value !== a) sel.value = a;
    // resize synchronously after layout, and again next frame, so the switch lands
    // even when playback is paused and no loop tick is pending
    requestAnimationFrame(() => {
      this.resize();
      requestAnimationFrame(() => this.resize());
    });
  }

  setDur(d) {
    this.dur = Number(d) || this.AUTH;
    this.h.stage.setAttribute('data-om-exportable-video-with-duration-secs', String(this.dur));
    this.draw(this.t);
  }

  toggle() {
    if (this.t >= this.AUTH - 0.01) { this.t = 0; if (this.h.resetCue) this.h.resetCue(); }
    this.playing = !this.playing;
    this.last = performance.now();
    this.syncPlay();
  }

  replay() {
    this.t = 0;
    if (this.h.resetCue) this.h.resetCue();
    this.playing = true;
    this.last = performance.now();
    this.syncPlay();
  }

  seek(t) {
    this.playing = false;
    this.t = cl(t, 0, this.AUTH);
    this.syncPlay();
    this.draw(this.t);
  }

  stepBeat(dir) {
    const beats = (this.h.beats || []).map(b => b.t).concat([this.AUTH]);
    this.playing = false; this.syncPlay();
    if (dir > 0) {
      const n = beats.find(m => m > this.t + 0.08);
      this.t = n === undefined ? 0 : n;
    } else {
      const p = beats.filter(m => m < this.t - 0.08).pop();
      this.t = p === undefined ? 0 : p;
    }
    this.draw(this.t);
  }

  syncPlay() {
    const b = this.h.refs.btnPlay && this.h.refs.btnPlay.current;
    if (b) b.textContent = this.playing && !this.staticMode ? 'Pause' : 'Play';
  }

  applyStatic(on) {
    this.staticMode = on;
    const r = this.h.refs;
    if (r.staticBoard && r.staticBoard.current) r.staticBoard.current.style.display = on ? 'block' : 'none';
    if (r.stageWrap && r.stageWrap.current) r.stageWrap.current.style.display = on ? 'none' : 'block';
    const b = r.btnStatic && r.btnStatic.current;
    if (b) {
      b.textContent = on ? 'Motion version' : 'Reduced motion';
      b.style.background = on ? CSS.navy : '#fff';
      b.style.color = on ? '#fff' : CSS.navy;
      b.style.borderColor = on ? CSS.navy : CSS.line;
    }
  }

  toggleSound() {
    this.sound = !this.sound;
    const b = this.h.refs.btnSound && this.h.refs.btnSound.current;
    if (b) {
      b.textContent = this.sound ? 'Sound on' : 'Sound off';
      b.style.background = this.sound ? CSS.navy : '#fff';
      b.style.color = this.sound ? '#fff' : CSS.navy;
      b.style.borderColor = this.sound ? CSS.navy : CSS.line;
    }
    return this.sound;
  }

  onSeek = (e) => {
    const d = (e && e.detail) || {};
    const sec = typeof d.time === 'number' ? d.time : (typeof d.frame === 'number' ? d.frame / FPS : 0);
    this.seek(sec * (this.AUTH / this.dur));
  };

  onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); this.stepBeat(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); this.stepBeat(-1); }
    else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); this.toggle(); }
    else if (e.key === 'Home') { e.preventDefault(); this.replay(); }
    else if (e.key === 'End') { e.preventDefault(); this.seek(this.AUTH); }
  };

  onDown = (e) => {
    if (this.staticMode) return;
    this.h.stage.focus({ preventScroll: true });
    this.drag = { x: e.clientX, t: this.t, moved: 0 };
    this.playing = false;
    this.syncPlay();
    this.h.stage.style.cursor = 'grabbing';
  };

  onMove = (e) => {
    if (!this.drag) return;
    const w = this.h.stage.clientWidth || 960;
    const dx = e.clientX - this.drag.x;
    this.drag.moved = Math.max(this.drag.moved, Math.abs(dx));
    this.t = cl(this.drag.t + (dx / w) * this.AUTH, 0, this.AUTH);
    this.draw(this.t);
  };

  onUp = () => {
    if (!this.drag) return;
    this.drag = null;
    this.h.stage.style.cursor = 'grab';
  };
}

/* ---------------- per-particle sized points ---------------- */
// PointsMaterial carries one size for the whole cloud, which reads as dust. This
// gives every particle its own size, colour and alpha. Blending stays NORMAL so the
// destination alpha accumulates correctly — additive would leave holes in the RGBA
// export where the glow sits over nothing.
export function sizedPoints(T, count, opts) {
  const o = opts || {};
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aColor', new T.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aSize', new T.BufferAttribute(new Float32Array(count), 1));
  geo.setAttribute('aAlpha', new T.BufferAttribute(new Float32Array(count), 1));
  const mat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: o.depthTest !== false,
    uniforms: {
      uTex: { value: o.map || dotTexture(T, o.hard) },
      uOpacity: { value: 1 },
      uScale: { value: 900 }
    },
    vertexShader: [
      'attribute vec3 aColor; attribute float aSize; attribute float aAlpha;',
      'uniform float uScale;',
      'varying vec3 vC; varying float vA;',
      'void main(){',
      '  vC = aColor; vA = aAlpha;',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  gl_PointSize = max(1.0, aSize * uScale / max(0.0001, -mv.z));',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D uTex; uniform float uOpacity;',
      'varying vec3 vC; varying float vA;',
      // THREE.Color converts a hex to the linear working space, and three.js does NOT
      // append its colorspace chunk to a custom ShaderMaterial — so the linear value
      // must be encoded back to sRGB here or every colour renders too saturated
      // (Momentum gold reads as orange).
      'vec3 lin2srgb(vec3 c){',
      '  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));',
      '}',
      'void main(){',
      '  vec4 t = texture2D(uTex, gl_PointCoord);',
      '  float a = t.a * vA * uOpacity;',
      '  if (a < 0.004) discard;',
      '  gl_FragColor = vec4(lin2srgb(vC), a);',
      '}'
    ].join('\n')
  });
  const p = new T.Points(geo, mat);
  p.frustumCulled = false;
  p.userData = {
    count: count,
    pos: geo.attributes.position,
    col: geo.attributes.aColor,
    size: geo.attributes.aSize,
    alpha: geo.attributes.aAlpha,
    flush: function () {
      this.pos.needsUpdate = true;
      this.col.needsUpdate = true;
      this.size.needsUpdate = true;
      this.alpha.needsUpdate = true;
    }
  };
  return p;
}

// A tube along an arbitrary polyline, rebuildable per frame for ribbons and paths.
export function polyTube(T, mat, radius, radial) {
  const m = new T.Mesh(new T.BufferGeometry(), mat);
  m.userData.set = function (pts, rad) {
    if (!pts || pts.length < 2) { m.visible = false; return; }
    m.visible = true;
    const curve = new T.CatmullRomCurve3(pts);
    const g = new T.TubeGeometry(curve, Math.max(8, pts.length * 3), rad === undefined ? radius : rad, radial || 10, false);
    const old = m.geometry;
    m.geometry = g;
    if (old) old.dispose();
  };
  return m;
}

/* ---------------- optional synthesized sound ---------------- */
// Original synthesis only: filtered noise bursts and short sine bodies. No sample,
// no external asset, off until the viewer opts in.
export class Sfx {
  constructor() { this.ac = null; }
  ctx() {
    if (!this.ac) {
      try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { this.ac = null; }
    }
    return this.ac;
  }
  noise(dur, f0, f1, gain, q, type) {
    const ac = this.ctx();
    if (!ac) return;
    const sr = ac.sampleRate, n = Math.max(1, Math.floor(sr * dur));
    const buf = ac.createBuffer(1, n, sr), d = buf.getChannelData(0);
    let s = 20260908;
    for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = (s / 0x7fffffff) * 2 - 1; }
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = type || 'bandpass'; f.Q.value = q || 0.8;
    f.frequency.setValueAtTime(f0, ac.currentTime);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), ac.currentTime + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + Math.min(0.06, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start();
  }
  tone(dur, f0, f1, gain) {
    const ac = this.ctx();
    if (!ac) return;
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), ac.currentTime + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + dur + 0.02);
  }
}

/* ---------------- display face ---------------- */
// Bricolage Grotesque is the approved display exception; fall back to the system's
// Archivo Black if the webfont has not loaded, so nothing renders in a browser default.
export function displayFace() {
  try {
    const c = document.createElement('canvas').getContext('2d');
    c.font = '800 100px "Bricolage Grotesque"';
    const a = c.measureText('MOMENTUM').width;
    c.font = '800 100px sans-serif';
    const b = c.measureText('MOMENTUM').width;
    if (Math.abs(a - b) > 0.5) return '"Bricolage Grotesque"';
  } catch (e) { /* fall through */ }
  return 'Archivo, sans-serif';
}

// document.fonts.load can resolve before the face is actually paintable, which would
// bake a fallback into the canvas textures. Poll until the metrics prove Bricolage is
// really there, then report honestly which face the film painted with.
export async function ensureDisplayFace(timeoutMs) {
  const deadline = performance.now() + (timeoutMs || 3500);
  while (performance.now() < deadline) {
    try {
      await document.fonts.load('800 120px "Bricolage Grotesque"');
      await document.fonts.load('900 40px Nunito');
    } catch (e) { /* keep polling */ }
    if (displayFace().indexOf('Bricolage') >= 0) {
      return { face: displayFace(), bricolage: true };
    }
    await new Promise(r => setTimeout(r, 110));
  }
  const f = displayFace();
  return { face: f, bricolage: f.indexOf('Bricolage') >= 0 };
}

/* ---------------- alpha-preserving renderer ---------------- */
// alpha:true + setClearAlpha(0) + no scene.background + no fog + no ground plane.
// The canvas itself stays transparent, so toDataURL('image/png') is a true RGBA
// object layer and the DOM preview background behind it is never captured.
export function makeRenderer(T, canvas) {
  const rn = new T.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true
  });
  rn.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  rn.setClearColor(0x000000, 0);
  rn.setClearAlpha(0);
  rn.outputColorSpace = T.SRGBColorSpace;
  rn.shadowMap.enabled = false; // a shadow needs a catcher plane; a catcher is a background
  return rn;
}

export function fitCamera(cam, cw, ch, baseFov) {
  const asp = cw / Math.max(1, ch);
  cam.aspect = asp;
  // widen the vertical FOV in portrait so an authored 9:16 composition frames the
  // same subject without being a cropped landscape
  cam.fov = asp >= 1 ? baseFov : baseFov * lp(1, 1.42, cl((1 - asp) / 0.44, 0, 1));
  cam.updateProjectionMatrix();
  return asp;
}
