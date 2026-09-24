/* Momo — First Assignment :: WebGL paper-desk stage
   Real three.js scene. A paper desk in 3D, subdivided deformable card planes with
   genuine paper bend, ceramic Momo artwork and one moving video decoder, driven by
   a deterministic 24s timeline (every transform is a pure function of t).

   Public API on <momo-assignment-stage>:
     play() pause() toggle() seek(t) replay() posterFrame()
     setAspect('16:9'|'9:16')  setSound(bool)
     record()                    -> realtime WebM of the composited frame
     await renderFrameAt(t)      -> frame-exact render, drains the seek queue
     duration -> 24 ; timingContract -> export contract object
   Events: 'momo-ready', 'momo-tick', 'momo-state'
*/
(function () {
  const TAG = 'momo-assignment-stage';
  if (customElements.get(TAG)) return;

  const DUR = 24;
  const FPS = 30;
  const THREE_URL = 'https://unpkg.com/three@0.160.0/build/three.module.js';

  const C = {
    night: '#03172e', navy: '#072d53', blue: '#1766ab', gold: '#efb928',
    paper: '#ffffff', field: '#f0f5f9', ink: '#102d49', muted: '#52677c',
    line: '#d5e0e9', pale: '#d5e4f1'
  };

  /* ---------- easing: the one Momentum curve, plus settle curves ---------- */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const fx = t => ((ax * t + bx) * t + cx) * t;
    const dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return function (p) {
      let t = p;
      for (let i = 0; i < 6; i++) {
        const e = fx(t) - p, d = dx(t);
        if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      return ((ay * t + by) * t + cy) * Math.min(1, Math.max(0, t));
    };
  }
  const HARD = bezier(0.85, 0, 0.15, 1);      /* identity moments */
  const OUT = bezier(0.16, 1, 0.3, 1);         /* paper settling */
  const IN = bezier(0.5, 0, 0.9, 0.4);
  const SMOOTH = t => t * t * (3 - 2 * t);
  const LIN = t => t;

  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp01 = v => Math.min(1, Math.max(0, v));

  const FIELDS = ['x', 'y', 'z', 'rx', 'ry', 'rz', 's', 'o', 'curl', 'wave'];
  const DEF = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, o: 0, curl: 0, wave: 0 };

  function sample(keys, t, out) {
    out = out || {};
    const first = keys[0], last = keys[keys.length - 1];
    let a = first, b = first, u = 0, ease = LIN;
    if (t <= first.t) { a = b = first; }
    else if (t >= last.t) { a = b = last; }
    else {
      for (let i = 0; i < keys.length - 1; i++) {
        if (t >= keys[i].t && t <= keys[i + 1].t) {
          a = keys[i]; b = keys[i + 1];
          u = (t - a.t) / Math.max(1e-6, b.t - a.t);
          ease = b.ease || SMOOTH;
          break;
        }
      }
    }
    const e = ease(u);
    for (const f of FIELDS) {
      const av = a[f] !== undefined ? a[f] : DEF[f];
      const bv = b[f] !== undefined ? b[f] : DEF[f];
      out[f] = lerp(av, bv, e);
    }
    return out;
  }

  /* ---------- shaders ---------- */
  const CARD_VERT = [
    'uniform float uTime; uniform float uCurl; uniform float uWave;',
    'uniform vec2 uSize; uniform float uPhase;',
    'varying vec2 vUv; varying vec3 vN; varying float vDepth; varying vec3 vView;',
    /* paper bend: a lifted leading edge plus a slow cross-sheet flex.
       Both terms are one-sided (>= 0) so a card NEVER displaces below its own
       plane — otherwise the opaque desk clips bites out of the paper. */
    'vec3 disp(vec2 q){',
    '  float y = q.y - 0.5;',
    '  float z = 0.0;',
    '  z += uCurl * y * y * 2.6;',
    '  z += uWave * 0.16 * (0.5 + 0.5 * sin(q.x * 4.20 + uTime * 1.05 + uPhase));',
    '  z += uWave * 0.09 * (0.5 + 0.5 * sin(q.y * 3.10 - uTime * 0.72 + uPhase * 1.6));',
    '  return vec3(0.0, 0.0, z);',
    '}',
    'vec3 surf(vec2 q){ return vec3((q.x-0.5)*uSize.x, (q.y-0.5)*uSize.y, 0.0) + disp(q); }',
    'void main(){',
    '  vUv = uv;',
    '  float e = 0.014;',
    '  vec3 p  = surf(uv);',
    '  vec3 px = surf(uv + vec2(e, 0.0));',
    '  vec3 py = surf(uv + vec2(0.0, e));',
    '  vN = normalize(normalMatrix * normalize(cross(px - p, py - p)));',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  vDepth = -mv.z;',
    '  vView = normalize(-mv.xyz);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  const CARD_FRAG = [
    'precision highp float;',
    'uniform sampler2D uMap; uniform float uOpacity; uniform vec2 uSize;',
    'uniform float uEdge; uniform float uRadius; uniform float uContain;',
    'uniform vec3 uNight; uniform vec3 uNavy; uniform vec3 uBlue; uniform vec3 uGold;',
    'uniform float uFogNear; uniform float uFogFar;',
    'varying vec2 vUv; varying vec3 vN; varying float vDepth; varying vec3 vView;',
    'float sdBox(vec2 p, vec2 b, float r){ vec2 d = abs(p)-b+r; return min(max(d.x,d.y),0.0)+length(max(d,0.0))-r; }',
    /* a raw ShaderMaterial receives none of three.js colour management */
    'vec3 srgb2lin(vec3 c){ return mix(c/12.92, pow((c+0.055)/1.055, vec3(2.4)), step(0.04045, c)); }',
    'void main(){',
    '  vec2 hp = (vUv - 0.5) * uSize;',
    '  float d = sdBox(hp, uSize*0.5, uRadius);',
    '  vec4 src = texture2D(uMap, vUv);',
    /* fold texture alpha into the cut mask BEFORE the discard, so a partly
       transparent surface (the connection sheet) neither paints black nor
       writes depth over the cards behind it */
    '  float mask = (1.0 - smoothstep(-0.005, 0.005, d)) * src.a;',
    '  if (mask <= 0.004) discard;',
    '  vec3 tex = srgb2lin(src.rgb);',
    /* studio key from above-left, matching the ceramic artwork's own light */
    '  vec3 L = normalize(vec3(-0.34, 0.78, 0.52));',
    '  vec3 n = normalize(vN);',
    '  float lam = dot(n, L);',
    '  vec3 col = tex * (0.74 + 0.34 * clamp(abs(lam), 0.0, 1.0));',
    '  col = mix(col, col * 0.62 + uNavy * 0.20, clamp(-lam, 0.0, 1.0) * 0.52);',
    '  float rim = pow(1.0 - clamp(dot(n, normalize(vView)), 0.0, 1.0), 3.0);',
    '  col += uBlue * rim * 0.16;',
    /* cut edge: a hairline of paper thickness, gold only where asked */
    '  float edge = 1.0 - smoothstep(0.0, 0.011, abs(d));',
    '  col = mix(col, mix(srgb2lin(vec3(0.835,0.878,0.914)), uGold, uEdge), edge * 0.85);',
    '  float fog = clamp((vDepth - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 1.0);',
    '  col = mix(col, uNight, fog * 0.88);',
    '  gl_FragColor = vec4(col, mask * uOpacity);',
    '}'
  ].join('\n');

  const POST_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

  /* Post is deliberately quiet: this film's motion lives in the paper and the
     camera, not in a screen warp. Encode, depth falloff, and a brief blue/gold
     bloom on the identity beats only. */
  const POST_FRAG = [
    'precision highp float;',
    'uniform sampler2D uScene; uniform float uTime; uniform float uBloom;',
    'uniform float uDim; uniform vec3 uNight; uniform vec3 uBlue; uniform vec3 uGold;',
    'varying vec2 vUv;',
    'vec3 lin2srgb(vec3 c){ c = max(c, vec3(0.0)); return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }',
    'void main(){',
    '  vec2 uv = vUv;',
    '  vec3 col = texture2D(uScene, uv).rgb;',
    '  if (uBloom > 0.001) {',
    '    float a = uBloom * 0.0055;',
    '    vec3 s1 = texture2D(uScene, clamp(uv + vec2( a,  a*0.4), 0.0, 1.0)).rgb;',
    '    vec3 s2 = texture2D(uScene, clamp(uv - vec2( a,  a*0.4), 0.0, 1.0)).rgb;',
    '    col = mix(col, max(col, max(s1, s2)), 0.55);',
    '    col += (uBlue * 0.5 + uGold * 0.5) * uBloom * 0.05;',
    '  }',
    '  vec2 c = (uv - 0.5) * vec2(1.0, 1.12);',
    /* a restrained depth falloff at the frame corners only — the desk itself
       stays a flat field, per the no-gradient rule */
    '  float fall = smoothstep(0.60, 1.02, length(c));',
    '  col = mix(col, uNight, fall * 0.40 + uDim * 0.62);',
    '  gl_FragColor = vec4(lin2srgb(col), 1.0);',
    '}'
  ].join('\n');

  /* ---------- drawn paper surfaces (Momentum type + palette only) ---------- */
  function trackText(g, text, x, y, spacing) {
    let mx = x;
    for (const ch of text) { g.fillText(ch, mx, y); mx += g.measureText(ch).width + spacing; }
    return mx - x;
  }

  function paperBase(g, W, H) {
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    g.fillStyle = C.field; g.fillRect(0, 0, W, 10);
  }

  function drawDesk() {
    const W = 2048, H = 2048;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.fillStyle = C.field; g.fillRect(0, 0, W, H);
    /* a flat field. No pattern, no texture, no gradient — depth comes from the
       cards' own shading and the camera, not from the desk. */
    return cv;
  }

  function drawBrief() {
    const W = 1536, H = 1024;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    paperBase(g, W, H);
    const pad = 104;
    g.fillStyle = C.muted;
    g.font = '800 28px Nunito, sans-serif';
    trackText(g, 'SAMPLE BRIEF · ILLUSTRATIVE', pad, pad + 30, 2.4);
    g.font = '900 128px Archivo, sans-serif';
    g.fillStyle = C.navy;
    const lines = ['Be found.', 'Be chosen.', 'Be booked.'];
    let ly = pad + 196;
    for (const l of lines) { g.fillText(l, pad, ly); ly += 137; }
    g.fillStyle = C.line; g.fillRect(pad, ly - 78, W - pad * 2, 2);
    g.fillStyle = C.ink;
    g.font = '400 40px Nunito, sans-serif';
    g.fillText('A local service business, one page of notes.', pad, ly + 8);
    g.fillStyle = C.line; g.fillRect(pad, H - pad - 44, W - pad * 2, 2);
    g.fillStyle = C.muted;
    g.font = '800 26px Nunito, sans-serif';
    trackText(g, 'MOMENTUM DIGITAL · AI DIVISION', pad, H - pad, 2.2);
    return cv;
  }

  function drawTask(spec, icon) {
    const W = 1536, H = 1024;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    paperBase(g, W, H);
    const pad = 96;
    g.fillStyle = C.muted;
    g.font = '800 34px Nunito, sans-serif';
    trackText(g, spec.meta, pad, pad + 36, 2.8);

    g.font = '900 138px Archivo, sans-serif';
    g.fillStyle = C.navy;
    g.fillText(spec.title, pad, pad + 224);
    const tw = g.measureText(spec.title).width;
    g.fillStyle = C.gold;
    g.fillText('.', pad + tw, pad + 224);

    g.fillStyle = C.line; g.fillRect(pad, pad + 280, W - pad * 2, 2);
    g.fillStyle = C.ink;
    g.font = '400 62px Nunito, sans-serif';
    let ly = pad + 386;
    for (const l of spec.sub) { g.fillText(l, pad, ly); ly += 88; }

    /* The ceramic icon masters are supplied on white, so a midnight plate would
       simply sit behind an opaque image. Contain them in the pale 14px-radius
       surface the system already uses, with a hairline. Artwork untouched. */
    if (icon) {
      const s = 330;
      const px = W - pad - s, py = H - pad - s - 16;
      const r = 26;
      g.save();
      g.beginPath();
      g.moveTo(px + r, py); g.arcTo(px + s, py, px + s, py + s, r);
      g.arcTo(px + s, py + s, px, py + s, r); g.arcTo(px, py + s, px, py, r);
      g.arcTo(px, py, px + s, py, r); g.closePath();
      g.fillStyle = C.field; g.fill();
      g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
      g.clip();
      g.drawImage(icon, px + 18, py + 18, s - 36, s - 36);
      g.restore();
    }

    g.fillStyle = C.line; g.fillRect(pad, H - pad - 44, 560, 2);
    g.fillStyle = C.muted;
    g.font = '800 30px Nunito, sans-serif';
    trackText(g, spec.foot, pad, H - pad, 2.6);
    return cv;
  }

  function drawCampaign() {
    const W = 1536, H = 1024;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    paperBase(g, W, H);
    const pad = 104;
    g.fillStyle = C.muted;
    g.font = '800 28px Nunito, sans-serif';
    trackText(g, 'ONE COORDINATED CAMPAIGN', pad, pad + 30, 2.4);

    g.font = '900 116px Archivo, sans-serif';
    g.fillStyle = C.navy;
    g.fillText('Four pieces.', pad, pad + 190);
    g.fillText('One next step', pad, pad + 190 + 124);
    const tw = g.measureText('One next step').width;
    g.fillStyle = C.gold;
    g.fillText('.', pad + tw, pad + 190 + 124);

    const rows = [
      ['01', 'Search', 'Answer the question when it is asked'],
      ['02', 'Design', 'One page that earns the call'],
      ['03', 'Marketing', 'A reason to choose, in plain words'],
      ['04', 'Automation', 'Nothing waits on a busy desk']
    ];
    let ly = pad + 400;
    for (const [n, name, line] of rows) {
      g.fillStyle = C.line; g.fillRect(pad, ly - 44, W - pad * 2, 2);
      g.fillStyle = C.gold;
      g.font = '900 30px Nunito, sans-serif';
      g.fillText(n, pad, ly);
      g.fillStyle = C.navy;
      g.font = '900 44px Nunito, sans-serif';
      g.fillText(name, pad + 74, ly);
      g.fillStyle = C.muted;
      g.font = '400 36px Nunito, sans-serif';
      g.fillText(line, pad + 430, ly);
      ly += 86;
    }
    g.fillStyle = C.line; g.fillRect(pad, H - pad - 40, W - pad * 2, 2);
    g.fillStyle = C.muted;
    g.font = '800 26px Nunito, sans-serif';
    trackText(g, 'FOR HUMAN REVIEW · PROPOSED CONCEPT', pad, H - pad, 2.2);
    return cv;
  }

  /* the connection sheet: four hairlines meeting one gold node */
  function drawWeb(tall) {
    const W = tall ? 900 : 1400, H = tall ? 1500 : 1024;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const pts = tall
      ? [[cx, 190], [cx, H - 190], [cx - 250, cy - 330], [cx + 250, cy + 330]]
      : [[240, 250], [W - 240, 250], [240, H - 250], [W - 240, H - 250]];
    g.strokeStyle = C.blue; g.lineWidth = 4; g.lineCap = 'round';
    for (const [px, py] of pts) {
      g.beginPath();
      g.moveTo(px, py);
      g.quadraticCurveTo((px + cx) / 2, (py + cy) / 2 + (py < cy ? 40 : -40), cx, cy);
      g.stroke();
    }
    g.fillStyle = C.gold;
    g.beginPath(); g.arc(cx, cy, 26, 0, 6.2832); g.fill();
    g.fillStyle = C.paper;
    g.beginPath(); g.arc(cx, cy, 10, 0, 6.2832); g.fill();
    return cv;
  }

  function loadImage(src) {
    return new Promise(res => {
      if (!src) return res(null);
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = src;
    });
  }

  /* ---------- quiet synthesized score (no sample, no licence, off by default) ---------- */
  class Score {
    constructor() { this.ctx = null; this.on = false; this.fired = {}; }
    ensure() {
      if (this.ctx) return this.ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.dest = this.ctx.createMediaStreamDestination();
      this.master.connect(this.ctx.destination);
      this.master.connect(this.dest);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 300; lp.Q.value = 0.6;
      lp.connect(this.master);
      const pad = this.ctx.createGain(); pad.gain.value = 0.5; pad.connect(lp);
      [55, 82.5, 110].forEach((f, i) => {
        const o = this.ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const g = this.ctx.createGain(); g.gain.value = i === 0 ? 0.34 : 0.13;
        o.connect(g); g.connect(pad); o.start();
      });
      /* one short filtered-noise buffer: the paper landing */
      const n = this.ctx.sampleRate * 0.22;
      this.noise = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2);
      return this.ctx;
    }
    setOn(v) {
      this.on = v;
      const ctx = this.ensure();
      if (!ctx) return;
      if (v && ctx.state === 'suspended') ctx.resume();
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(v ? 0.15 : 0, ctx.currentTime + 0.45);
    }
    /* soft paper set-down */
    land(id) {
      if (!this.on || !this.ctx || this.fired[id]) return;
      this.fired[id] = true;
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource(); src.buffer = this.noise;
      const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = 1400; bp.Q.value = 0.8;
      const g = this.ctx.createGain(); g.gain.value = 0.075;
      src.connect(bp); bp.connect(g); g.connect(this.master); src.start(t);
    }
    tone(id, freq) {
      if (!this.on || !this.ctx || this.fired[id]) return;
      this.fired[id] = true;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 1.9);
    }
    reset() { this.fired = {}; }
  }

  /* ---------- the 24-second score ---------- */
  /* Cards lie on the desk in XZ; y is lift off the paper. Rotation order YXZ:
     rx = -PI/2 + tilt lays the card flat, ry spins it on the desk. */
  const REST = 0.022;

  /* One generator, used for both masters. A task card flies in from off-desk,
     lands, holds still to be read, then gathers and tucks. */
  function taskTrack(o) {
    const t0 = o.in;
    return [
      { t: 0.00, x: o.from[0], y: o.from[1], z: o.from[2], rx: 0.58, ry: o.spin * 8, rz: 0.14, s: o.deal, o: 0, curl: 0.9, wave: 0.8 },
      { t: t0, x: o.from[0], y: o.from[1], z: o.from[2], rx: 0.58, ry: o.spin * 8, rz: 0.14, s: o.deal, o: 0, curl: 0.9, wave: 0.8, ease: LIN },
      { t: t0 + 0.10, x: o.from[0] * 0.86, y: o.from[1] * 0.90, z: o.from[2] * 0.88, rx: 0.50, ry: o.spin * 7, rz: 0.12, s: o.deal, o: 1, curl: 0.86, wave: 0.78, ease: LIN },
      { t: t0 + 0.86, x: lerp(o.from[0], o.rest[0], 0.82), y: 0.74, z: lerp(o.from[2], o.rest[1], 0.82), rx: 0.14, ry: o.spin * 3, rz: 0.04, s: o.deal, o: 1, curl: 0.46, wave: 0.44, ease: IN },
      { t: t0 + 1.44, x: o.rest[0], y: REST, z: o.rest[1], rx: 0, ry: o.spin, rz: 0, s: o.deal, o: 1, curl: 0.09, wave: 0.09, ease: OUT },
      { t: 16.30, x: o.rest[0], y: REST, z: o.rest[1], rx: 0, ry: o.spin, rz: 0, s: o.deal, o: 1, curl: 0.05, wave: 0.05, ease: LIN },
      { t: 17.30, x: lerp(o.rest[0], o.tuck[0], 0.4), y: 0.92, z: lerp(o.rest[1], o.tuck[1], 0.35), rx: 0.10, ry: o.spin * 2, rz: 0.03, s: o.deal * 0.86, o: 1, curl: 0.34, wave: 0.32, ease: HARD },
      { t: 18.90, x: o.tuck[0], y: REST, z: o.tuck[1], rx: 0, ry: o.spin * 0.4, rz: 0, s: o.tuckS, o: 1, curl: 0.07, wave: 0.07, ease: OUT },
      { t: 24.00, x: o.tuck[0], y: REST, z: o.tuck[1], rx: 0, ry: o.spin * 0.4, rz: 0, s: o.tuckS, o: 1, curl: 0.04, wave: 0.04, ease: LIN }
    ];
  }

  const TASK_KEYS = ['search', 'design', 'marketing', 'automation'];
  const TASK_IN = [6.40, 8.80, 11.20, 13.60];
  const TASK_SPIN = [-0.055, 0.05, 0.045, -0.05];

  /* ---- 16:9 master: a 2x2 sort on the desk ---- */
  const L_FROM = [[-5.4, 2.9, 2.6], [5.4, 3.1, 2.2], [-5.6, 2.8, -2.4], [5.6, 3.0, -2.0]];
  const L_REST = [[-1.74, -0.62], [1.74, -0.62], [-1.74, 1.92], [1.74, 1.92]];
  const L_TUCK = [[-2.46, 1.76], [-0.82, 1.76], [0.82, 1.76], [2.46, 1.76]];

  /* ---- 9:16 master: recomposed as a single column, not a squeezed grid ---- */
  const P_FROM = [[-4.2, 2.9, -1.2], [4.2, 3.1, 0.2], [-4.4, 2.8, 1.6], [4.4, 3.0, 3.0]];
  const P_REST = [[0, -2.55], [0, -0.93], [0, 0.69], [0, 2.31]];
  const P_TUCK = [[-0.98, 1.85], [0.98, 1.85], [-0.98, 2.55], [0.98, 2.55]];

  const TRACKS = {
    /* 0.0–2.0 the brief lands; 2–6 slides aside for Momo; then to the desk head */
    brief: [
      { t: 0.00, x: 2.30, y: 3.60, z: -2.20, rx: 0.62, ry: -0.86, rz: 0.16, s: 1, o: 0, curl: 0.95, wave: 0.85 },
      { t: 0.16, x: 2.05, y: 3.10, z: -1.90, rx: 0.54, ry: -0.78, rz: 0.14, s: 1, o: 1, curl: 0.92, wave: 0.85, ease: LIN },
      { t: 1.02, x: 0.62, y: 0.92, z: -0.34, rx: 0.16, ry: -0.26, rz: 0.05, s: 1, o: 1, curl: 0.54, wave: 0.52, ease: IN },
      { t: 1.62, x: 0.04, y: REST, z: 0.02, rx: 0.0, ry: -0.035, rz: 0.0, s: 1, o: 1, curl: 0.10, wave: 0.10, ease: OUT },
      { t: 2.00, x: 0.00, y: REST, z: 0.00, rx: 0.0, ry: -0.03, rz: 0.0, s: 1, o: 1, curl: 0.05, wave: 0.05, ease: OUT },
      { t: 3.40, x: 1.16, y: REST, z: -0.34, rx: 0.0, ry: 0.055, rz: 0.0, s: 0.94, o: 1, curl: 0.06, wave: 0.06, ease: HARD },
      { t: 6.20, x: 0.00, y: REST, z: -2.52, rx: 0.0, ry: 0.02, rz: 0.0, s: 0.70, o: 1, curl: 0.05, wave: 0.05, ease: HARD },
      { t: 16.40, x: 0.00, y: REST, z: -2.52, rx: 0.0, ry: 0.02, rz: 0.0, s: 0.70, o: 1, curl: 0.04, wave: 0.04, ease: LIN },
      { t: 18.20, x: 0.00, y: REST, z: -2.82, rx: 0.0, ry: 0.0, rz: 0.0, s: 0.60, o: 1, curl: 0.03, wave: 0.03, ease: HARD },
      { t: 24.00, x: 0.00, y: REST, z: -2.82, rx: 0.0, ry: 0.0, rz: 0.0, s: 0.60, o: 1, curl: 0.03, wave: 0.03, ease: LIN }
    ],
    /* 2.0–6.0 Momo notices the job. This is the one moving video surface. */
    momo: [
      { t: 0.00, x: -4.60, y: 0.30, z: 1.30, rx: 0.10, ry: 0.60, rz: 0, s: 1, o: 0, curl: 0.40, wave: 0.40 },
      { t: 2.05, x: -4.30, y: 0.26, z: 1.24, rx: 0.09, ry: 0.56, rz: 0, s: 1, o: 0, curl: 0.38, wave: 0.40, ease: LIN },
      { t: 2.90, x: -2.36, y: 0.16, z: 1.02, rx: 0.05, ry: 0.34, rz: 0, s: 1, o: 1, curl: 0.30, wave: 0.30, ease: HARD },
      { t: 3.70, x: -1.72, y: REST, z: 0.94, rx: 0.0, ry: 0.24, rz: 0, s: 1, o: 1, curl: 0.09, wave: 0.09, ease: OUT },
      { t: 5.90, x: -1.72, y: REST, z: 0.94, rx: 0.0, ry: 0.24, rz: 0, s: 1, o: 1, curl: 0.05, wave: 0.05, ease: LIN },
      { t: 6.90, x: -3.28, y: REST, z: -1.72, rx: 0.0, ry: 0.30, rz: 0, s: 0.56, o: 1, curl: 0.05, wave: 0.05, ease: HARD },
      { t: 16.40, x: -3.28, y: REST, z: -1.72, rx: 0.0, ry: 0.30, rz: 0, s: 0.56, o: 1, curl: 0.04, wave: 0.04, ease: LIN },
      { t: 18.60, x: -3.34, y: REST, z: -1.98, rx: 0.0, ry: 0.26, rz: 0, s: 0.50, o: 1, curl: 0.03, wave: 0.03, ease: HARD },
      { t: 24.00, x: -3.34, y: REST, z: -1.98, rx: 0.0, ry: 0.26, rz: 0, s: 0.50, o: 1, curl: 0.03, wave: 0.03, ease: LIN }
    ],
    web: [
      { t: 0.00, x: 0, y: 0.008, z: 0.65, s: 1, o: 0 },
      { t: 14.30, x: 0, y: 0.008, z: 0.65, s: 1, o: 0, ease: LIN },
      { t: 15.40, x: 0, y: 0.008, z: 0.65, s: 1, o: 1, ease: OUT },
      { t: 16.90, x: 0, y: 0.008, z: 0.65, s: 1, o: 1, ease: LIN },
      { t: 17.70, x: 0, y: 0.008, z: 0.65, s: 0.9, o: 0, ease: HARD },
      { t: 24.00, x: 0, y: 0.008, z: 0.65, s: 0.9, o: 0, ease: LIN }
    ],
    campaign: [
      { t: 0.00, x: 0, y: 0.10, z: 0.30, rx: 0.05, ry: 0, rz: 0, s: 0.86, o: 0, curl: 0.5, wave: 0.4 },
      { t: 17.40, x: 0, y: 0.10, z: 0.30, rx: 0.05, ry: 0, rz: 0, s: 0.86, o: 0, curl: 0.5, wave: 0.4, ease: LIN },
      { t: 18.30, x: 0, y: 0.36, z: -0.02, rx: 0.03, ry: 0, rz: 0, s: 0.97, o: 1, curl: 0.26, wave: 0.24, ease: HARD },
      { t: 19.40, x: 0, y: REST, z: -0.16, rx: 0, ry: 0, rz: 0, s: 1, o: 1, curl: 0.07, wave: 0.07, ease: OUT },
      { t: 24.00, x: 0, y: REST, z: -0.18, rx: 0, ry: 0, rz: 0, s: 1, o: 1, curl: 0.04, wave: 0.04, ease: LIN }
    ]
  };

  const TRACKS_P = {
    brief: [
      { t: 0.00, x: 1.60, y: 3.60, z: -2.40, rx: 0.62, ry: -0.86, rz: 0.16, s: 0.86, o: 0, curl: 0.95, wave: 0.85 },
      { t: 0.16, x: 1.44, y: 3.10, z: -2.05, rx: 0.54, ry: -0.78, rz: 0.14, s: 0.86, o: 1, curl: 0.92, wave: 0.85, ease: LIN },
      { t: 1.02, x: 0.44, y: 0.92, z: -0.52, rx: 0.16, ry: -0.26, rz: 0.05, s: 0.86, o: 1, curl: 0.54, wave: 0.52, ease: IN },
      { t: 1.62, x: 0.02, y: REST, z: -0.10, rx: 0.0, ry: -0.035, rz: 0.0, s: 0.86, o: 1, curl: 0.10, wave: 0.10, ease: OUT },
      { t: 2.00, x: 0.00, y: REST, z: -0.12, rx: 0.0, ry: -0.03, rz: 0.0, s: 0.86, o: 1, curl: 0.05, wave: 0.05, ease: OUT },
      { t: 3.40, x: 0.00, y: REST, z: -1.52, rx: 0.0, ry: 0.04, rz: 0.0, s: 0.76, o: 1, curl: 0.06, wave: 0.06, ease: HARD },
      { t: 6.20, x: -0.86, y: REST, z: -3.62, rx: 0.0, ry: 0.03, rz: 0.0, s: 0.46, o: 1, curl: 0.05, wave: 0.05, ease: HARD },
      { t: 24.00, x: -0.86, y: REST, z: -3.62, rx: 0.0, ry: 0.03, rz: 0.0, s: 0.46, o: 1, curl: 0.03, wave: 0.03, ease: LIN }
    ],
    momo: [
      { t: 0.00, x: -3.10, y: 0.30, z: 1.60, rx: 0.10, ry: 0.60, rz: 0, s: 0.88, o: 0, curl: 0.40, wave: 0.40 },
      { t: 2.05, x: -2.90, y: 0.26, z: 1.52, rx: 0.09, ry: 0.56, rz: 0, s: 0.88, o: 0, curl: 0.38, wave: 0.40, ease: LIN },
      { t: 2.90, x: -0.60, y: 0.16, z: 1.42, rx: 0.05, ry: 0.20, rz: 0, s: 0.88, o: 1, curl: 0.30, wave: 0.30, ease: HARD },
      { t: 3.70, x: 0.00, y: REST, z: 1.38, rx: 0.0, ry: 0.05, rz: 0, s: 0.88, o: 1, curl: 0.09, wave: 0.09, ease: OUT },
      { t: 5.90, x: 0.00, y: REST, z: 1.38, rx: 0.0, ry: 0.05, rz: 0, s: 0.88, o: 1, curl: 0.05, wave: 0.05, ease: LIN },
      { t: 6.90, x: 0.88, y: REST, z: -3.62, rx: 0.0, ry: 0.06, rz: 0, s: 0.46, o: 1, curl: 0.05, wave: 0.05, ease: HARD },
      { t: 24.00, x: 0.88, y: REST, z: -3.62, rx: 0.0, ry: 0.06, rz: 0, s: 0.46, o: 1, curl: 0.03, wave: 0.03, ease: LIN }
    ],
    web: [
      { t: 0.00, x: 0, y: 0.062, z: -0.12, s: 1, o: 0 },
      { t: 14.30, x: 0, y: 0.062, z: -0.12, s: 1, o: 0, ease: LIN },
      { t: 15.40, x: 0, y: 0.062, z: -0.12, s: 1, o: 1, ease: OUT },
      { t: 16.90, x: 0, y: 0.062, z: -0.12, s: 1, o: 1, ease: LIN },
      { t: 17.70, x: 0, y: 0.062, z: -0.12, s: 0.9, o: 0, ease: HARD },
      { t: 24.00, x: 0, y: 0.062, z: -0.12, s: 0.9, o: 0, ease: LIN }
    ],
    campaign: [
      { t: 0.00, x: 0, y: 0.10, z: -0.30, rx: 0.05, ry: 0, rz: 0, s: 0.56, o: 0, curl: 0.5, wave: 0.4 },
      { t: 17.40, x: 0, y: 0.10, z: -0.30, rx: 0.05, ry: 0, rz: 0, s: 0.56, o: 0, curl: 0.5, wave: 0.4, ease: LIN },
      { t: 18.30, x: 0, y: 0.36, z: -0.58, rx: 0.03, ry: 0, rz: 0, s: 0.63, o: 1, curl: 0.26, wave: 0.24, ease: HARD },
      { t: 19.40, x: 0, y: REST, z: -0.70, rx: 0, ry: 0, rz: 0, s: 0.65, o: 1, curl: 0.07, wave: 0.07, ease: OUT },
      { t: 24.00, x: 0, y: REST, z: -0.72, rx: 0, ry: 0, rz: 0, s: 0.65, o: 1, curl: 0.04, wave: 0.04, ease: LIN }
    ]
  };

  TASK_KEYS.forEach((key, i) => {
    TRACKS[key] = taskTrack({ in: TASK_IN[i], spin: TASK_SPIN[i], from: L_FROM[i], rest: L_REST[i], tuck: L_TUCK[i], deal: 1, tuckS: 0.415 });
    TRACKS_P[key] = taskTrack({ in: TASK_IN[i], spin: TASK_SPIN[i], from: P_FROM[i], rest: P_REST[i], tuck: P_TUCK[i], deal: 0.80, tuckS: 0.30 });
  });

  /* camera: position and look-target, both pure functions of t, with held beats */
  const CAM_POS = [
    { t: 0.00, x: 0.42, y: 2.42, z: 3.42 },
    { t: 2.00, x: 0.26, y: 2.72, z: 3.76, ease: OUT },
    { t: 3.90, x: -0.34, y: 3.05, z: 4.30, ease: SMOOTH },
    { t: 6.00, x: -0.30, y: 3.55, z: 4.95, ease: SMOOTH },
    { t: 8.20, x: -0.62, y: 5.35, z: 4.95, ease: SMOOTH },
    { t: 11.00, x: 0.30, y: 6.05, z: 5.10, ease: SMOOTH },
    { t: 13.40, x: -0.24, y: 6.45, z: 5.25, ease: SMOOTH },
    { t: 16.00, x: 0.00, y: 6.85, z: 5.35, ease: SMOOTH },
    { t: 18.60, x: 0.00, y: 5.35, z: 5.05, ease: HARD },
    { t: 20.20, x: 0.00, y: 5.02, z: 4.86, ease: OUT },
    { t: 24.00, x: 0.00, y: 4.98, z: 4.82, ease: LIN }
  ];
  const CAM_TGT = [
    { t: 0.00, x: 0.20, y: 0.0, z: 0.05 },
    { t: 2.00, x: 0.05, y: 0.0, z: 0.05, ease: OUT },
    { t: 3.90, x: -0.52, y: 0.0, z: 0.50, ease: SMOOTH },
    { t: 6.00, x: -0.55, y: 0.0, z: 0.35, ease: SMOOTH },
    { t: 8.20, x: -0.30, y: 0.0, z: 0.30, ease: SMOOTH },
    { t: 11.00, x: 0.10, y: 0.0, z: 0.55, ease: SMOOTH },
    { t: 13.40, x: 0.10, y: 0.0, z: 0.75, ease: SMOOTH },
    { t: 16.00, x: 0.00, y: 0.0, z: 0.62, ease: SMOOTH },
    { t: 18.60, x: 0.00, y: 0.0, z: 0.30, ease: HARD },
    { t: 20.20, x: 0.00, y: 0.0, z: 0.10, ease: OUT },
    { t: 24.00, x: 0.00, y: 0.0, z: 0.10, ease: LIN }
  ];

  /* bloom fires only on identity moments; dim lifts under the end card */
  const BLOOM = [
    { t: 0.00, s: 0 }, { t: 1.02, s: 0, ease: LIN }, { t: 1.30, s: 1.0, ease: HARD },
    { t: 2.10, s: 0, ease: OUT }, { t: 2.90, s: 0.55, ease: HARD }, { t: 3.80, s: 0, ease: OUT },
    { t: 7.60, s: 0.45, ease: HARD }, { t: 8.40, s: 0, ease: OUT },
    { t: 10.00, s: 0.45, ease: HARD }, { t: 10.80, s: 0, ease: OUT },
    { t: 12.40, s: 0.45, ease: HARD }, { t: 13.20, s: 0, ease: OUT },
    { t: 14.80, s: 0.45, ease: HARD }, { t: 15.60, s: 0, ease: OUT },
    { t: 18.30, s: 0.85, ease: HARD }, { t: 19.60, s: 0, ease: OUT },
    { t: 24.00, s: 0, ease: LIN }
  ];
  const DIM = [
    { t: 0.00, s: 0 }, { t: 20.00, s: 0, ease: LIN },
    { t: 21.30, s: 0.44, ease: HARD }, { t: 24.00, s: 0.44, ease: LIN }
  ];

  /* the single moving decoder: one clip, one window */
  const VIDEO_WINDOW = [2.05, 6.90, 4.6];   /* [in, out, clip seconds consumed] */
  const VIDEO_START = 0.55;

  class MomoAssignmentStage extends HTMLElement {
    constructor() {
      super();
      this.t = 0;
      this.playing = false;
      this.ready = false;
      this.aspect = '16:9';
      this.score = new Score();
      this._lastEmit = -1;
      this._destroyed = false;
    }

    get duration() { return DUR; }
    get timingContract() {
      return {
        duration: DUR, fps: FPS, frames: DUR * FPS + 1,
        deterministic: 'every card transform, camera position, look target, bloom and dim value is sample(track, t) — a pure function of t',
        frameApi: 'await stage.renderFrameAt(t) seeks the one video decoder, drains the serial queue, then draws',
        masters: ['16:9', '9:16'],
        nondeterministic: 'HTML video decode only; the video surface falls back to its baked still when the decoder has no frame'
      };
    }

    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      this.style.cssText = 'display:block;position:relative;width:100%;aspect-ratio:16/9;background:' + C.night + ';border-radius:14px;overflow:hidden';
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = 'display:block;width:100%;height:100%';
      this.appendChild(this.canvas);
      this.boot().catch(err => {
        console.error('[momo-assignment-stage]', err);
        this.dispatchEvent(new CustomEvent('momo-state', { bubbles: true, detail: { error: String(err) } }));
      });
    }

    disconnectedCallback() {
      this._destroyed = true;
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      if (this.vid) { try { this.vid.el.pause(); } catch (e) {} }
      if (this.renderer) this.renderer.dispose();
    }

    async boot() {
      const THREE = await import(THREE_URL);
      this.THREE = THREE;
      if (this._destroyed) return;
      try {
        await document.fonts.load('900 128px Archivo');
        await document.fonts.load('400 42px Nunito');
        await document.fonts.load('800 28px Nunito');
      } catch (e) {}

      const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
      r.setClearColor(new THREE.Color(C.night), 1);
      r.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer = r;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(C.night);
      this.camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 120);
      this._tgt = new THREE.Vector3();

      this.rt = new THREE.WebGLRenderTarget(16, 9, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
      this.postScene = new THREE.Scene();
      this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.postMat = new THREE.ShaderMaterial({
        vertexShader: POST_VERT, fragmentShader: POST_FRAG,
        uniforms: {
          uScene: { value: this.rt.texture }, uTime: { value: 0 },
          uBloom: { value: 0 }, uDim: { value: 0 },
          uNight: { value: new THREE.Color(C.night) },
          uBlue: { value: new THREE.Color(C.blue) },
          uGold: { value: new THREE.Color(C.gold) }
        }
      });
      this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMat));

      await this.build();
      this.collectOverlays();

      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(this);
      this.syncViewport(true);

      this.ready = true;
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.dispatchEvent(new CustomEvent('momo-ready', { bubbles: true, detail: { reduced: this.reduced } }));

      if (this.reduced) this.seek(21.6);
      else { this.seek(0); this.play(); }
      this.loop();
    }

    async build() {
      const THREE = this.THREE;
      const d = k => this.dataset[k] || '';
      this.cards = {};

      /* desk */
      const deskTex = new THREE.CanvasTexture(drawDesk());
      deskTex.colorSpace = THREE.SRGBColorSpace;
      deskTex.minFilter = THREE.LinearMipmapLinearFilter;
      deskTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const desk = new THREE.Mesh(
        new THREE.PlaneGeometry(64, 64, 2, 2),
        new THREE.ShaderMaterial({
          vertexShader: CARD_VERT, fragmentShader: CARD_FRAG, transparent: true,
          side: THREE.DoubleSide, depthWrite: true,
          uniforms: {
            uMap: { value: deskTex }, uTime: { value: 0 }, uCurl: { value: 0 }, uWave: { value: 0 },
            uSize: { value: new THREE.Vector2(64, 64) }, uOpacity: { value: 1 },
            uPhase: { value: 0 }, uEdge: { value: 0 }, uRadius: { value: 0.2 }, uContain: { value: 0 },
            uNight: { value: new THREE.Color(C.night) }, uNavy: { value: new THREE.Color(C.navy) },
            uBlue: { value: new THREE.Color(C.blue) }, uGold: { value: new THREE.Color(C.gold) },
            uFogNear: { value: 8.5 }, uFogFar: { value: 22.0 }
          }
        })
      );
      desk.rotation.order = 'YXZ';
      desk.rotation.x = -Math.PI / 2;
      desk.position.y = 0;
      desk.frustumCulled = false;
      this.scene.add(desk);
      this.desk = desk;

      const icons = await Promise.all([
        loadImage(d('iconSearch')), loadImage(d('iconBuild')),
        loadImage(d('iconAudience')), loadImage(d('iconOperations'))
      ]);

      const taskSpecs = [
        { key: 'search', meta: 'TASK 01 · SEARCH', title: 'Search', sub: ['Be the answer when someone', 'asks an engine first.'], foot: 'AI SEARCH · AEO + GEO' },
        { key: 'design', meta: 'TASK 02 · DESIGN', title: 'Design', sub: ['One page, built to earn', 'the next phone call.'], foot: 'AI DESIGN' },
        { key: 'marketing', meta: 'TASK 03 · MARKETING', title: 'Marketing', sub: ['A reason to choose them,', 'written in plain words.'], foot: 'AI MARKETING' },
        { key: 'automation', meta: 'TASK 04 · AUTOMATION', title: 'Automation', sub: ['The routine work stops', 'waiting on a busy desk.'], foot: 'AI AUTOMATION' }
      ];

      const mk = (key, tex, w, h, seg, edge, radius) => {
        const geo = new this.THREE.PlaneGeometry(w, h, seg[0], seg[1]);
        const mat = new this.THREE.ShaderMaterial({
          vertexShader: CARD_VERT, fragmentShader: CARD_FRAG, transparent: true,
          side: this.THREE.DoubleSide, depthWrite: true,
          uniforms: {
            uMap: { value: tex }, uTime: { value: 0 }, uCurl: { value: 0 }, uWave: { value: 0 },
            uSize: { value: new this.THREE.Vector2(w, h) }, uOpacity: { value: 0 },
            uPhase: { value: Math.random() * 6.283 },
            uEdge: { value: edge || 0 }, uRadius: { value: radius === undefined ? 0.045 : radius },
            uContain: { value: 0 },
            uNight: { value: new this.THREE.Color(C.night) }, uNavy: { value: new this.THREE.Color(C.navy) },
            uBlue: { value: new this.THREE.Color(C.blue) }, uGold: { value: new this.THREE.Color(C.gold) },
            uFogNear: { value: 9.5 }, uFogFar: { value: 26.0 }
          }
        });
        const mesh = new this.THREE.Mesh(geo, mat);
        mesh.rotation.order = 'YXZ';
        mesh.frustumCulled = false;
        mesh.visible = false;
        this.scene.add(mesh);
        this.cards[key] = { key, mesh, mat, state: {} };
        return this.cards[key];
      };

      const canvasTex = cv => {
        const tx = new this.THREE.CanvasTexture(cv);
        tx.colorSpace = this.THREE.SRGBColorSpace;
        tx.minFilter = this.THREE.LinearMipmapLinearFilter;
        tx.magFilter = this.THREE.LinearFilter;
        tx.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        tx.generateMipmaps = true;
        return tx;
      };

      mk('brief', canvasTex(drawBrief()), 3.30, 2.20, [40, 56], 0);
      taskSpecs.forEach((s, i) => mk(s.key, canvasTex(drawTask(s, icons[i])), 2.90, 1.93, [36, 50], 0));
      this.webWide = canvasTex(drawWeb(false));
      this.webTall = canvasTex(drawWeb(true));
      mk('web', this.webWide, 5.40, 3.95, [8, 8], 0, 0.0);
      mk('campaign', canvasTex(drawCampaign()), 4.62, 3.08, [48, 64], 0.55);

      /* ---- the one moving video surface ----
         Base texture is a frame baked out of the supplied master, so Momo is on
         the card from the first frame. The decoder plays over the top during its
         window; it enhances the surface, it never gates whether there is one. */
      this._logo = await loadImage(d('logo'));
      const stillImg = await loadImage(d('stillMomo'));
      let baseTex;
      if (stillImg) { baseTex = new THREE.Texture(stillImg); baseTex.needsUpdate = true; }
      else { baseTex = new THREE.CanvasTexture(drawBrief()); }
      baseTex.colorSpace = THREE.SRGBColorSpace;
      baseTex.minFilter = THREE.LinearMipmapLinearFilter;
      baseTex.magFilter = THREE.LinearFilter;
      baseTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      baseTex.generateMipmaps = true;

      const card = mk('momo', baseTex, 3.42, 2.28, [40, 56], 0);

      const el = document.createElement('video');
      let src = d('srcMomo');
      el.muted = true; el.defaultMuted = true; el.playsInline = true;
      el.setAttribute('playsinline', ''); el.preload = 'auto'; el.loop = false;
      /* Fully inert: no host media chrome, no focus, no remote/PiP surface can
         attach to it. It is a texture source, not a player. */
      el.controls = false; el.tabIndex = -1;
      el.setAttribute('aria-hidden', 'true');
      el.disablePictureInPicture = true;
      el.setAttribute('disableremoteplayback', '');
      el.style.cssText = 'position:absolute;left:-10px;width:1px;height:1px;opacity:0;pointer-events:none';
      this.appendChild(el);
      const vtex = new THREE.VideoTexture(el);
      vtex.colorSpace = THREE.SRGBColorSpace;
      vtex.minFilter = THREE.LinearFilter; vtex.magFilter = THREE.LinearFilter;
      this.vid = { el, tex: vtex, baseTex, url: src, attached: false, armed: false, hasStill: !!stillImg, failed: false, card };
      /* A decode failure must resolve to the baked still, once, and never retry —
         an unhandled error state is what surfaces a native "unable to play
         media" overlay and leaves the card waiting on a frame that never comes. */
      el.addEventListener('error', () => {
        const er = el.error;
        this.vid.failed = true;
        this.setMap(this.vid.card, this.vid.baseTex);
        console.warn('[momo-assignment-stage] video decode failed; holding the baked still', er && er.code, er && er.message);
        this.dispatchEvent(new CustomEvent('momo-state', {
          bubbles: true,
          detail: { playing: this.playing, t: this.t, mediaFallback: true }
        }));
      });
    }

    collectOverlays() {
      const root = this.closest('[data-momo-root]') || this.parentElement || document;
      this.overlays = {};
      this._ovCount = 0;
      root.querySelectorAll('[data-momo-overlay]').forEach(n => {
        this.overlays[n.getAttribute('data-momo-overlay')] = n;
        this._ovCount++;
      });
    }

    /* ---------- layout: one race-free sync, called on resize AND per frame ---------- */
    syncViewport(force) {
      if (!this.renderer) return false;
      const w = this.clientWidth || 960;
      const h = this.clientHeight || Math.round(w * 9 / 16);
      if (!force && w === this._vw && h === this._vh) return false;
      this._vw = w; this._vh = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(w, h, false);
      this.rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
      const root = this.closest('[data-momo-root]') || this;
      root.style.setProperty('--momo-fw', w + 'px');
      const a = w / h;
      this.camera.aspect = a;
      this.portrait = a < 1;
      this.camera.fov = this.portrait ? 46 : 36;
      this.camera.updateProjectionMatrix();
      return true;
    }
    resize() { if (this.syncViewport(true) && !this.playing) this.applyFrame(this.t, true); }

    /* ---------- clock ---------- */
    play() {
      if (!this.ready || this.playing) return;
      if (this.t >= DUR - 0.02) { this.t = 0; this.score.reset(); }
      this.playing = true;
      this._wall = performance.now();
      this.emitState();
    }
    pause() {
      this.playing = false;
      if (this.vid && !this.vid.el.paused) this.vid.el.pause();
      this.emitState();
    }
    toggle() { this.playing ? this.pause() : this.play(); }
    replay() { this.score.reset(); this.seek(0); this.play(); }
    posterFrame() { this.pause(); this.seek(21.6); }
    seek(t) {
      this.t = Math.min(DUR, Math.max(0, t));
      this._wall = performance.now();
      this.applyFrame(this.t, true);
      this.emitTick(true);
      this.emitState();
    }
    setAspect(mode) {
      this.aspect = mode;
      this.style.aspectRatio = mode === '9:16' ? '9 / 16' : '16 / 9';
      const root = this.closest('[data-momo-root]');
      if (root) {
        root.style.maxWidth = mode === '9:16' ? 'min(100%, 430px)' : 'none';
        root.style.margin = mode === '9:16' ? '0 auto' : '0';
      }
      requestAnimationFrame(() => requestAnimationFrame(() => this.resize()));
    }
    setSound(v) { this.score.setOn(v); }

    emitState() {
      this.dispatchEvent(new CustomEvent('momo-state', { bubbles: true, detail: { playing: this.playing, t: this.t } }));
    }
    emitTick(force) {
      const now = performance.now();
      if (!force && now - this._lastEmit < 90) return;
      this._lastEmit = now;
      this.dispatchEvent(new CustomEvent('momo-tick', { bubbles: true, detail: { t: this.t, playing: this.playing } }));
    }

    loop() {
      if (this._destroyed) return;
      this._raf = requestAnimationFrame(() => this.loop());
      const now = performance.now();
      if (this.playing) {
        const dt = Math.min(0.1, (now - this._wall) / 1000);
        this._wall = now;
        this.t += dt;
        if (this.t >= DUR) { this.t = DUR; this.pause(); }
        this.applyFrame(this.t, false);
        this.emitTick(false);
      }
      this.draw();
    }

    /* every visual property derives from t alone */
    applyFrame(t, hardSync) {
      if (!this.cards) return;
      this.syncViewport(false);
      const P = this.portrait ? 1 : 0;
      /* 9:16 is a recomposed master, not a squeezed crop: it has its own authored
         track set (a single column), so no positional scaling is applied to it. */
      const set = P ? TRACKS_P : TRACKS;
      const sx = 1, sz = 1, cs = 1;

      for (const key in this.cards) {
        const c = this.cards[key];
        const k = sample(set[key] || TRACKS[key], t, c.state);
        const vis = k.o > 0.004;
        c.mesh.visible = vis;
        if (!vis) continue;
        if (key === 'web') {
          if (this.webTall) this.setMap(c, P ? this.webTall : this.webWide);
          /* the connection sheet is one plane in both masters; in 9:16 it is
             stretched into a vertical spine rather than left squashed */
          if (P) c.mesh.scale.set(k.s * 0.50, k.s * 1.78, k.s);
          else c.mesh.scale.setScalar(k.s);
        }
        c.mesh.position.set(k.x * sx, k.y, k.z * sz);
        c.mesh.rotation.set(-Math.PI / 2 + k.rx, k.ry, k.rz);
        if (key !== 'web') c.mesh.scale.setScalar(k.s * cs);
        c.mat.uniforms.uOpacity.value = k.o;
        c.mat.uniforms.uCurl.value = k.curl;
        c.mat.uniforms.uWave.value = k.wave;
        c.mat.uniforms.uTime.value = t;
      }
      this.desk.material.uniforms.uTime.value = t;

      const cp = sample(CAM_POS, t, this._cp || (this._cp = {}));
      const ct = sample(CAM_TGT, t, this._ct || (this._ct = {}));
      this.camera.position.set(cp.x * sx, cp.y * (P ? 1.02 : 1), cp.z * (P ? 1.28 : 1));
      this._tgt.set(ct.x * sx, ct.y, ct.z * sz + (P ? -0.35 : 0));
      this.camera.lookAt(this._tgt);

      this.postMat.uniforms.uBloom.value = sample(BLOOM, t, this._bl || (this._bl = {})).s;
      this.postMat.uniforms.uDim.value = sample(DIM, t, this._dm || (this._dm = {})).s;
      this.postMat.uniforms.uTime.value = t;

      this.syncVideo(t, hardSync);
      this.updateOverlays(t);
      this.cueScore(t);
    }

    /* ---------- the single decoder ----------
       One clip, one window, attached on demand. Rate-locked to the window rather
       than seek-corrected: seeking a playing 1080p element stalls it. */
    ensureSrc() {
      const v = this.vid;
      if (v.failed || v.attached) return;
      v.el.src = v.url; v.attached = true; v.armed = false;
      try { v.el.load(); } catch (e) {}
    }
    /* One video in this film, so there is no second decoder to free. The source
       is attached once and RETAINED — detaching by removing src and calling
       load() aborts the pending load and leaves the element in an error/empty
       state, which is what raises a native media error in the host. */
    releaseSrc() {
      const v = this.vid;
      if (!v.attached) return;
      try { if (!v.el.paused) v.el.pause(); } catch (e) {}
      v.armed = false;
    }
    enqueueSeek(target) {
      const v = this.vid;
      if (v.seekPending) return;
      v.seekPending = true;
      this._q = (this._q || Promise.resolve()).then(() => new Promise(res => {
        const fin = () => {
          v.el.removeEventListener('seeked', fin);
          v.seekPending = false; v.tex.needsUpdate = true; res();
        };
        if (v.el.readyState < 1) { fin(); return; }
        v.el.addEventListener('seeked', fin);
        setTimeout(fin, 3000);
        try { v.el.currentTime = target; } catch (e) { fin(); }
      }));
    }

    syncVideo(t, hard) {
      const v = this.vid;
      if (!v) return;
      const [tin, tout, span] = VIDEO_WINDOW;
      const live = t >= tin - 0.4 && t <= tout;
      const local = clamp01((t - tin) / Math.max(0.001, tout - tin));
      const target = VIDEO_START + local * span;
      const natural = span / (tout - tin);

      if (!live || v.failed) {
        this.releaseSrc();
        this.setMap(v.card, v.baseTex);
        return;
      }
      this.ensureSrc();
      /* attached is not the same as having a picture: hold the baked still until
         the decoder actually delivers a frame */
      this.setMap(v.card, v.el.readyState >= 2 ? v.tex : v.baseTex);

      if (hard || !this.playing) {
        if (!v.el.paused) v.el.pause();
        v.armed = false;
        if (v.el.readyState >= 1 && Math.abs(v.el.currentTime - target) > 0.04) this.enqueueSeek(target);
        v.tex.needsUpdate = true;
      } else if (!v.armed) {
        if (!v.el.paused) v.el.pause();
        if (Math.abs(v.el.currentTime - target) > 0.12) this.enqueueSeek(target);
        else if (!v.seekPending && v.el.readyState >= 2) {
          v.armed = true;
          v.el.playbackRate = natural;
          const p = v.el.play(); if (p && p.catch) p.catch(() => {});
        }
        v.tex.needsUpdate = true;
      } else {
        if (v.el.paused) { const p = v.el.play(); if (p && p.catch) p.catch(() => {}); }
        const drift = target - v.el.currentTime;
        let rate = natural * (1 + Math.min(0.3, Math.max(-0.3, drift * 0.6)));
        rate = Math.min(2, Math.max(0.25, rate));
        if (Math.abs(v.el.playbackRate - rate) > 0.01) v.el.playbackRate = rate;
        if (!v.el.seeking && Math.abs(drift) > 2.0) this.enqueueSeek(target);
      }
    }
    setMap(card, tex) {
      if (tex && card.mat.uniforms.uMap.value !== tex) card.mat.uniforms.uMap.value = tex;
    }

    /* ---------- text beats: one source of truth for DOM and capture ---------- */
    beats(t) {
      const band = (a, b, c, d) => {
        if (t < a || t > d) return 0;
        if (t < b) return OUT(clamp01((t - a) / (b - a)));
        if (t > c) return 1 - HARD(clamp01((t - c) / (d - c)));
        return 1;
      };
      return {
        /* 2–6 the clear task */
        task: band(2.55, 3.25, 5.60, 6.35),
        taskReveal: HARD(clamp01((t - 2.55) / 0.7)),
        /* 16–20 the assembled campaign */
        assembled: band(19.10, 19.80, 20.60, 21.20),
        /* 20–24 end card */
        endcard: band(21.05, 21.85, 24.0, 24.1),
        endLift: 1 - OUT(clamp01((t - 21.05) / 1.5))
      };
    }

    updateOverlays(t) {
      if (!this.overlays) return;
      /* React may still be streaming the overlay markup when the stage boots, and
         it arrives in pieces — so keep re-collecting until the full set is here. */
      if (this._ovCount < 5) {
        this._ovTry = (this._ovTry || 0) + 1;
        if (this._ovTry % 12 === 1) this.collectOverlays();
        if (!this._ovCount) return;
      }
      const B = this.beats(t);
      const set = (k, o, extra) => {
        const n = this.overlays[k];
        if (!n) return;
        n.style.opacity = String(o);
        n.style.pointerEvents = 'none';
        if (extra) Object.assign(n.style, extra);
      };
      const clip = 100 - 100 * B.taskReveal;
      set('task', B.task, { clipPath: 'inset(0 ' + clip.toFixed(2) + '% 0 0)' });
      set('taskscrim', B.task * 0.92);
      set('assembled', B.assembled);
      set('endcard', B.endcard, { transform: 'translateY(' + (26 * B.endLift).toFixed(2) + 'px)' });
      set('endscrim', B.endcard * 0.96);
    }

    cueScore(t) {
      if (!this.score.on) return;
      if (t > 1.62) this.score.land('brief');
      if (t > 2.90) this.score.tone('momo', 220);
      if (t > 7.84) this.score.land('c1');
      if (t > 10.24) this.score.land('c2');
      if (t > 12.64) this.score.land('c3');
      if (t > 15.04) this.score.land('c4');
      if (t > 15.40) this.score.tone('web', 293.7);
      if (t > 18.30) this.score.tone('assemble', 329.6);
      if (t > 21.30) this.score.tone('end', 174.6);
    }

    draw() {
      if (!this.renderer) return;
      this.renderer.setRenderTarget(this.rt);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.postScene, this.postCam);
    }

    async renderFrameAt(t) {
      this.playing = false;
      this.t = Math.min(DUR, Math.max(0, t));
      this.applyFrame(this.t, true);
      this.emitTick(true);
      this.emitState();
      for (let pass = 0; pass < 3; pass++) {
        await (this._q || Promise.resolve());
        this.applyFrame(this.t, true);
        if (!this.vid.seekPending) break;
      }
      await (this._q || Promise.resolve());
      this.vid.tex.needsUpdate = true;
      this.draw();
      return true;
    }

    /* ---------- capture: GL frame plus the same text beats, composited ---------- */
    drawCaptureFrame() {
      const W = this.canvas.width, H = this.canvas.height;
      if (!this._cap) {
        this._cap = document.createElement('canvas');
        this._capCx = this._cap.getContext('2d');
      }
      if (this._cap.width !== W || this._cap.height !== H) { this._cap.width = W; this._cap.height = H; }
      const cx = this._capCx;
      cx.clearRect(0, 0, W, H);
      cx.drawImage(this.canvas, 0, 0, W, H);

      const u = W / 1920;
      const B = this.beats(this.t);
      const pad = 0.052 * W;

      if (B.task > 0.003) {
        cx.save();
        cx.globalAlpha = B.task * 0.92;
        const grad = cx.createLinearGradient(0, H, 0, H * 0.40);
        grad.addColorStop(0, 'rgba(3,23,46,1)');
        grad.addColorStop(0.36, 'rgba(3,23,46,.90)');
        grad.addColorStop(1, 'rgba(3,23,46,0)');
        cx.fillStyle = grad;
        cx.fillRect(0, H * 0.40, W, H * 0.60);
        cx.restore();

        cx.save();
        cx.globalAlpha = B.task;
        const size = 96 * u;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        const full = cx.measureText('Sort the job').width;
        cx.beginPath();
        cx.rect(pad, H * 0.55, full * B.taskReveal + size, H * 0.40);
        cx.clip();
        cx.fillStyle = '#ffffff';
        cx.fillText('One brief', pad, H - pad - size * 1.16);
        const w1 = cx.measureText('One brief').width;
        cx.fillStyle = C.gold;
        cx.fillText('.', pad + w1, H - pad - size * 1.16);
        cx.fillStyle = '#ffffff';
        cx.fillText('Sort the job', pad, H - pad);
        const w2 = cx.measureText('Sort the job').width;
        cx.fillStyle = C.gold;
        cx.fillText('.', pad + w2, H - pad);
        cx.restore();
      }

      if (B.assembled > 0.003) {
        cx.save();
        cx.globalAlpha = B.assembled;
        cx.font = '800 ' + (26 * u).toFixed(1) + 'px Nunito, sans-serif';
        /* this beat sits on the pale desk, so the meta line is navy, not pale */
        cx.fillStyle = C.navy;
        let mx = pad;
        for (const ch of 'ASSEMBLED FOR HUMAN REVIEW') {
          cx.fillText(ch, mx, pad + 26 * u);
          mx += cx.measureText(ch).width + 2.3 * u;
        }
        cx.restore();
      }

      if (B.endcard > 0.003) {
        cx.save();
        cx.globalAlpha = B.endcard * 0.96;
        cx.fillStyle = 'rgba(3,23,46,.86)';
        cx.fillRect(0, 0, W, H);
        cx.restore();

        cx.save();
        cx.globalAlpha = B.endcard;
        const lift = 26 * u * B.endLift;
        const logo = this._logo;
        const lw = Math.min(320 * u, W * 0.24);
        let cy = H * 0.40 + lift;
        if (logo && logo.naturalWidth) {
          const lh = lw * (logo.naturalHeight / logo.naturalWidth);
          const plateW = lw + 56 * u, plateH = lh + 40 * u;
          const px = (W - plateW) / 2, py = cy - plateH / 2;
          cx.fillStyle = '#ffffff';
          const r = 14 * u;
          cx.beginPath();
          cx.moveTo(px + r, py); cx.arcTo(px + plateW, py, px + plateW, py + plateH, r);
          cx.arcTo(px + plateW, py + plateH, px, py + plateH, r);
          cx.arcTo(px, py + plateH, px, py, r); cx.arcTo(px, py, px + plateW, py, r);
          cx.closePath(); cx.fill();
          cx.drawImage(logo, (W - lw) / 2, cy - lh / 2, lw, lh);
          cy = py + plateH;
        }
        const size = 54 * u;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        cx.textAlign = 'center';
        cx.fillStyle = '#ffffff';
        cx.fillText('One brief.', W / 2, cy + size * 1.5);
        cx.fillText('A connected next step', W / 2, cy + size * 2.66);
        const tw = cx.measureText('A connected next step').width;
        cx.fillStyle = C.gold;
        cx.fillText('.', W / 2 + tw / 2, cy + size * 2.66);
        cx.font = '800 ' + (24 * u).toFixed(1) + 'px Nunito, sans-serif';
        cx.fillStyle = C.pale;
        cx.textAlign = 'center';
        cx.fillText('P R O P O S E D   C O N C E P T', W / 2, cy + size * 3.9);
        cx.restore();
      }
      return this._cap;
    }

    record(onDone) {
      if (this._rec) return;
      if (!this._logo) {
        const src = this.dataset.logo;
        if (src) { const im = new Image(); im.onload = () => { this._logo = im; }; im.src = src; }
      }
      const cap = this.drawCaptureFrame();
      const stream = cap.captureStream(FPS);
      if (this.score.on && this.score.dest) {
        this.score.dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
      }
      const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      const mime = types.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
      if (!mime) { onDone && onDone({ error: 'MediaRecorder is unavailable in this browser.' }); return; }
      const chunks = [];
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 14000000 });
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        this._rec = null;
        if (this._capRaf) cancelAnimationFrame(this._capRaf);
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'momo-first-assignment-' + (this.aspect === '9:16' ? '9x16' : '16x9') + '.webm';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        onDone && onDone({ bytes: blob.size, mime });
      };
      this._rec = rec;
      this.score.reset();
      this.seek(0);
      this.play();
      rec.start(250);
      const pump = () => {
        this.drawCaptureFrame();
        if (this.t >= DUR - 0.05 || !this.playing) { rec.stop(); return; }
        this._capRaf = requestAnimationFrame(pump);
      };
      this._capRaf = requestAnimationFrame(pump);
    }
  }

  customElements.define(TAG, MomoAssignmentStage);
})();
