/* Inside the Living Portfolio :: architectural gallery walkthrough engine
   20.00s. A camera walks a navy gallery corridor holding three FIXED framed
   scenes, each carrying only existing Momo footage or a baked still from that
   same footage. The motion is camera travel through architecture — approach,
   lateral traverse, pull back to the connected collection — deliberately not
   the orbiting sheets of the portfolio film, not paper tumbling, not a desk.

   Nothing in the scene animates except the camera, the wall datum that joins
   the three bays at the pull-back, and the overlay beats. Every one of those is
   sample(track, t) — a pure function of t.

   Public API matches the other stages:
     play() pause() toggle() seek(t) replay() posterFrame()
     setAspect('16:9'|'9:16') setSound(bool) record() renderFrameAt(t)
     duration -> 20 ; timingContract
   Events: 'momo-ready', 'momo-tick', 'momo-state'
*/
(function () {
  const TAG = 'momo-gallery-stage';
  if (customElements.get(TAG)) return;

  const DUR = 20;
  const FPS = 30;
  const POSTER = 15.8;
  const THREE_URL = 'https://unpkg.com/three@0.160.0/build/three.module.js';

  const C = {
    night: '#03172e', navy: '#072d53', blue: '#1766ab', gold: '#efb928',
    paper: '#ffffff', field: '#f0f5f9', ink: '#102d49', muted: '#52677c',
    line: '#d5e0e9', pale: '#d5e4f1'
  };

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
      t = Math.min(1, Math.max(0, t));
      return ((ay * t + by) * t + cy) * t;
    };
  }
  const HARD = bezier(0.85, 0, 0.15, 1);
  const OUT = bezier(0.16, 1, 0.3, 1);
  const SMOOTH = t => t * t * (3 - 2 * t);
  const LIN = t => t;
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp01 = v => Math.min(1, Math.max(0, v));

  const F = ['x', 'y', 'z', 's'];
  const DEFV = { x: 0, y: 0, z: 0, s: 0 };
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
    for (const f of F) {
      const av = a[f] !== undefined ? a[f] : DEFV[f];
      const bv = b[f] !== undefined ? b[f] : DEFV[f];
      out[f] = lerp(av, bv, e);
    }
    return out;
  }

  /* ---------- one shader for every surface in the gallery ---------- */
  const VERT = [
    'varying vec2 vUv; varying float vDepth;',
    'void main(){',
    '  vUv = uv;',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  vDepth = -mv.z;',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  const FRAG = [
    'precision highp float;',
    'uniform sampler2D uMap; uniform float uOpacity; uniform vec3 uTint;',
    'uniform float uUseMap; uniform float uEdge; uniform float uGrad;',
    'uniform vec3 uNight; uniform vec3 uGold;',
    'uniform float uFogNear; uniform float uFogFar;',
    'varying vec2 vUv; varying float vDepth;',
    'vec3 srgb2lin(vec3 c){ return mix(c/12.92, pow((c+0.055)/1.055, vec3(2.4)), step(0.04045, c)); }',
    'void main(){',
    '  vec3 col;',
    '  float a = 1.0;',
    '  if (uUseMap > 0.5) {',
    '    vec4 src = texture2D(uMap, vUv);',
    '    if (src.a <= 0.004) discard;',
    '    col = srgb2lin(src.rgb); a = src.a;',
    '  } else {',
    /* uTint arrives from THREE.Color, which has already converted the hex from
       sRGB to linear — converting again here is what crushed the navy walls to
       near-black. Texture samples DO still need decoding: a raw ShaderMaterial
       receives none of three.js’s colour-management injection. */
    '    col = uTint;',
    '  }',
    /* architectural falloff: a wall or floor reads darker away from the eyeline */
    '  col *= 1.0 - uGrad * (1.0 - vUv.y) * 0.55;',
    /* gold hairline on the outer edge of a framed bay */
    '  if (uEdge > 0.5) {',
    '    float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));',
    '    col = mix(uGold, col, smoothstep(0.0, 0.006, e));',
    '  }',
    '  float fog = clamp((vDepth - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 1.0);',
    '  col = mix(col, uNight, fog * 0.92);',
    '  gl_FragColor = vec4(col, a * uOpacity);',
    '}'
  ].join('\n');

  const POST_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const POST_FRAG = [
    'precision highp float;',
    'uniform sampler2D uScene; uniform float uDim; uniform vec3 uNight;',
    'varying vec2 vUv;',
    'vec3 lin2srgb(vec3 c){ c = max(c, vec3(0.0)); return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }',
    'void main(){',
    '  vec3 col = texture2D(uScene, vUv).rgb;',
    '  vec2 c = (vUv - 0.5) * vec2(1.0, 1.10);',
    '  float fall = smoothstep(0.62, 1.04, length(c));',
    '  col = mix(col, uNight, fall * 0.42 + uDim * 0.70);',
    '  gl_FragColor = vec4(lin2srgb(col), 1.0);',
    '}'
  ].join('\n');

  /* ---------- drawing helpers ---------- */
  function newCanvas(W, H) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    return cv;
  }
  function trackText(g, text, x, y, sp) {
    let mx = x;
    for (const ch of text) { g.fillText(ch, mx, y); mx += g.measureText(ch).width + sp; }
    return mx - x;
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

  /* The wall plaque beside each bay — the only copy inside the scene, set in
     the system's meta register so it is readable at the approach distance. */
  function drawPlaque(num, title, line) {
    const W = 1024, H = 512, pad = 54;
    const cv = newCanvas(W, H);
    const g = cv.getContext('2d');
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    g.fillStyle = C.field; g.fillRect(0, 0, W, 8);

    g.fillStyle = C.muted;
    g.font = '800 34px Nunito, sans-serif';
    trackText(g, num, pad, pad + 34, 3.0);

    g.font = '900 76px Archivo, sans-serif';
    g.fillStyle = C.navy;
    g.fillText(title, pad, 214);
    const w = g.measureText(title).width;
    g.fillStyle = C.gold;
    g.fillText('.', pad + w, 214);

    g.fillStyle = C.line; g.fillRect(pad, 258, W - pad * 2, 2);

    g.fillStyle = C.ink;
    g.font = '400 40px Nunito, sans-serif';
    g.fillText(line, pad, 330);

    g.fillStyle = C.muted;
    g.font = '800 28px Nunito, sans-serif';
    trackText(g, 'MOMENTUM DIGITAL · AI DIVISION', pad, H - pad, 2.6);
    return cv;
  }

  /* A blank matte for a bay: white board the image sits on. */
  function drawMatte() {
    const cv = newCanvas(16, 16);
    const g = cv.getContext('2d');
    g.fillStyle = C.paper; g.fillRect(0, 0, 16, 16);
    return cv;
  }

  /* The wall datum: a gold rule that draws itself across the three bays at the
     pull-back, which is what makes the collection read as connected. */
  function drawDatum(tall) {
    const W = tall ? 64 : 2048, H = tall ? 2048 : 64;
    const cv = newCanvas(W, H);
    const g = cv.getContext('2d');
    g.fillStyle = C.gold;
    if (tall) g.fillRect(W / 2 - 5, 0, 10, H);
    else g.fillRect(0, H / 2 - 5, W, 10);
    return cv;
  }

  /* ---------- quiet synthesized score ---------- */
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
      lp.type = 'lowpass'; lp.frequency.value = 280; lp.Q.value = 0.6;
      lp.connect(this.master);
      const pad = this.ctx.createGain(); pad.gain.value = 0.5; pad.connect(lp);
      [55, 82.5, 110].forEach((f, i) => {
        const o = this.ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const g = this.ctx.createGain(); g.gain.value = i === 0 ? 0.34 : 0.12;
        o.connect(g); g.connect(pad); o.start();
      });
      return this.ctx;
    }
    setOn(v) {
      this.on = v;
      const ctx = this.ensure();
      if (!ctx) return;
      if (v && ctx.state === 'suspended') ctx.resume();
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(v ? 0.14 : 0, ctx.currentTime + 0.45);
    }
    tone(id, freq) {
      if (!this.on || !this.ctx || this.fired[id]) return;
      this.fired[id] = true;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.085, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 2.1);
    }
    reset() { this.fired = {}; }
  }

  /* ---------- the corridor ----------
     Three bays on one back wall. Wide: spaced along X, camera dollies sideways.
     Portrait: the same three bays authored up the wall, camera dollies
     vertically — a recomposition, not a crop of the wide walk. */
  const BAY_W = 4.60, BAY_H = 2.59;          /* 16:9 image, matching the masters */
  const MATTE_PAD = 0.42;
  const WALL_Z = -3.30;
  const EYE = 0.30;

  const BAYS_WIDE = [
    { key: 'reveal', x: -6.90, y: EYE + 0.18 },
    { key: 'money', x: 0.00, y: EYE + 0.18 },
    { key: 'great', x: 6.90, y: EYE + 0.18 }
  ];
  const BAYS_TALL = [
    { key: 'reveal', x: 0, y: 4.05 },
    { key: 'money', x: 0, y: 0.30 },
    { key: 'great', x: 0, y: -3.45 }
  ];

  /* camera: approach bay 1, traverse to 2 and 3, pull back to the collection.
     Readable holds sit at 3.4–4.6, 7.8–9.0, 12.0–13.2 and 16.4–20.
     Dolly distances are computed against each lens so a bay reads inside the
     architecture rather than overfilling the frame: at 36° and 16:9 the visible
     width is 1.155 × distance-to-wall, so the 5.44-wide matte wants ~6.2 units
     of standoff on the holds and ~17.9 to hold all three at the pull-back. */
  const CAM_WIDE = [
    { t: 0.00, x: -6.90, y: EYE + 0.34, z: 4.70 },
    { t: 1.20, x: -6.90, y: EYE + 0.30, z: 4.10, ease: OUT },
    { t: 3.40, x: -6.90, y: EYE + 0.22, z: 2.90, ease: HARD },
    { t: 4.60, x: -6.90, y: EYE + 0.22, z: 2.88, ease: LIN },
    { t: 7.80, x: 0.00, y: EYE + 0.22, z: 2.88, ease: HARD },
    { t: 9.00, x: 0.00, y: EYE + 0.22, z: 2.88, ease: LIN },
    { t: 12.00, x: 6.90, y: EYE + 0.22, z: 2.88, ease: HARD },
    { t: 13.20, x: 6.90, y: EYE + 0.22, z: 2.88, ease: LIN },
    { t: 16.40, x: 0.00, y: EYE + 0.55, z: 14.60, ease: HARD },
    { t: 20.00, x: 0.00, y: EYE + 0.58, z: 14.80, ease: LIN }
  ];
  const TGT_WIDE = [
    { t: 0.00, x: -6.90, y: EYE + 0.18, z: WALL_Z },
    { t: 4.60, x: -6.90, y: EYE + 0.18, z: WALL_Z, ease: LIN },
    { t: 7.80, x: 0.00, y: EYE + 0.18, z: WALL_Z, ease: HARD },
    { t: 9.00, x: 0.00, y: EYE + 0.18, z: WALL_Z, ease: LIN },
    { t: 12.00, x: 6.90, y: EYE + 0.18, z: WALL_Z, ease: HARD },
    { t: 13.20, x: 6.90, y: EYE + 0.18, z: WALL_Z, ease: LIN },
    { t: 16.40, x: 0.00, y: EYE + 0.18, z: WALL_Z, ease: HARD },
    { t: 20.00, x: 0.00, y: EYE + 0.18, z: WALL_Z, ease: LIN }
  ];

  /* the authored vertical walk: same three bays re-hung up the wall. At 46° in
     9:16 the visible width is only 0.478 × standoff, so the holds sit further
     back than the wide walk and the pull-back is driven by height, not width. */
  const CAM_TALL = [
    { t: 0.00, x: 0, y: 4.05, z: 6.10 },
    { t: 1.20, x: 0, y: 4.05, z: 5.60, ease: OUT },
    { t: 3.40, x: 0, y: 4.05, z: 5.10, ease: HARD },
    { t: 4.60, x: 0, y: 4.05, z: 5.08, ease: LIN },
    { t: 7.80, x: 0, y: 0.30, z: 5.08, ease: HARD },
    { t: 9.00, x: 0, y: 0.30, z: 5.08, ease: LIN },
    { t: 12.00, x: 0, y: -3.45, z: 5.08, ease: HARD },
    { t: 13.20, x: 0, y: -3.45, z: 5.08, ease: LIN },
    { t: 16.40, x: 0, y: 0.30, z: 9.30, ease: HARD },
    { t: 20.00, x: 0, y: 0.30, z: 9.45, ease: LIN }
  ];
  const TGT_TALL = [
    { t: 0.00, x: 0, y: 4.05, z: WALL_Z },
    { t: 4.60, x: 0, y: 4.05, z: WALL_Z, ease: LIN },
    { t: 7.80, x: 0, y: 0.30, z: WALL_Z, ease: HARD },
    { t: 9.00, x: 0, y: 0.30, z: WALL_Z, ease: LIN },
    { t: 12.00, x: 0, y: -3.45, z: WALL_Z, ease: HARD },
    { t: 13.20, x: 0, y: -3.45, z: WALL_Z, ease: LIN },
    { t: 16.40, x: 0, y: 0.30, z: WALL_Z, ease: HARD },
    { t: 20.00, x: 0, y: 0.30, z: WALL_Z, ease: LIN }
  ];

  /* the datum draws on at the pull-back and holds */
  const DATUM = [
    { t: 0.00, s: 0 },
    { t: 13.60, s: 0, ease: LIN },
    { t: 16.20, s: 1, ease: HARD },
    { t: 20.00, s: 1, ease: LIN }
  ];
  const DIM = [
    { t: 0.00, s: 0.06 },
    { t: 1.20, s: 0.0, ease: OUT },
    { t: 16.40, s: 0.0, ease: LIN },
    { t: 17.60, s: 0.30, ease: HARD },
    { t: 20.00, s: 0.32, ease: LIN }
  ];

  /* Momo's bay is the only live decoder, and only inside this window.
     [in, out, seconds of clip consumed] against the 8.05s Reveal master. */
  const VID_WINDOW = [1.30, 6.40, 4.60];
  const VID_START = 0.90;

  const PLAQUES = {
    reveal: ['SCENE 01', 'Momo', 'The guide who walks the work.'],
    money: ['SCENE 02', 'The watch', 'Attention held on what matters.'],
    great: ['SCENE 03', 'The build', 'Momentum, put together in public.']
  };

  class MomoGalleryStage extends HTMLElement {
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
        film: 'inside-the-living-portfolio',
        slug: 'momo-inside-the-living-portfolio',
        duration: DUR, fps: FPS, frames: DUR * FPS + 1, poster: POSTER,
        deterministic: 'the three bays are fixed geometry; camera position, look target, wall datum and dim are sample(track, t) — a pure function of t',
        frameApi: 'await stage.renderFrameAt(t) seeks the one video decoder under a bounded wait, then draws',
        masters: ['16:9', '9:16 (authored vertical walk, not a crop)'],
        decoders: 1,
        nondeterministic: 'HTML video decode only; Momo\u2019s bay shows its baked still until the decoder delivers a frame'
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
        console.error('[momo-gallery-stage]', err);
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
        await document.fonts.load('900 76px Archivo');
        await document.fonts.load('400 40px Nunito');
        await document.fonts.load('800 34px Nunito');
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
          uScene: { value: this.rt.texture }, uDim: { value: 0 },
          uNight: { value: new THREE.Color(C.night) }
        }
      });
      this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMat));

      await this.build();

      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(this);
      this.syncViewport(true);

      this.ready = true;
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.dispatchEvent(new CustomEvent('momo-ready', { bubbles: true, detail: { reduced: this.reduced } }));

      /* an immediately readable first frame either way */
      if (this.reduced) { this.seek(POSTER); }
      else { this.seek(0); this.play(); }
      this.loop();
    }

    surface(w, h, opts) {
      const THREE = this.THREE;
      const o = opts || {};
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG,
        transparent: true, side: THREE.DoubleSide, depthWrite: o.depthWrite !== false,
        uniforms: {
          uMap: { value: o.map || null },
          uUseMap: { value: o.map ? 1 : 0 },
          uTint: { value: new THREE.Color(o.tint || C.navy) },
          uOpacity: { value: o.opacity === undefined ? 1 : o.opacity },
          uEdge: { value: o.edge ? 1 : 0 },
          uGrad: { value: o.grad || 0 },
          uNight: { value: new THREE.Color(C.night) },
          uGold: { value: new THREE.Color(C.gold) },
          uFogNear: { value: o.fogNear === undefined ? 13 : o.fogNear },
          uFogFar: { value: o.fogFar === undefined ? 46 : o.fogFar }
        }
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.frustumCulled = false;
      this.scene.add(mesh);
      return { mesh, mat };
    }

    canvasTex(cv, mip) {
      const THREE = this.THREE;
      const tx = new THREE.CanvasTexture(cv);
      tx.colorSpace = THREE.SRGBColorSpace;
      tx.magFilter = THREE.LinearFilter;
      if (mip === false) { tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false; }
      else {
        tx.minFilter = THREE.LinearMipmapLinearFilter;
        tx.generateMipmaps = true;
        tx.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      }
      return tx;
    }

    async build() {
      const THREE = this.THREE;
      const d = k => this.dataset[k] || '';

      /* ---- architecture: back wall, floor, ceiling, two side returns ---- */
      this.shell = [];
      const back = this.surface(60, 26, { tint: C.navy, grad: 0.26, fogNear: 26, fogFar: 70 });
      back.mesh.position.set(0, 2.0, WALL_Z - 0.06);
      this.shell.push(back);

      const floor = this.surface(60, 46, { tint: C.night, grad: 0.0, fogNear: 10, fogFar: 40 });
      floor.mesh.rotation.x = -Math.PI / 2;
      floor.mesh.position.set(0, -2.60, WALL_Z + 22);
      this.shell.push(floor);

      const ceil = this.surface(60, 46, { tint: C.night, grad: 0.0, fogNear: 12, fogFar: 42 });
      ceil.mesh.rotation.x = Math.PI / 2;
      ceil.mesh.position.set(0, 6.40, WALL_Z + 22);
      this.shell.push(ceil);

      const left = this.surface(46, 26, { tint: C.navy, grad: 0.52, fogNear: 12, fogFar: 40 });
      left.mesh.rotation.y = Math.PI / 2;
      left.mesh.position.set(-15.5, 2.0, WALL_Z + 22);
      this.shell.push(left);

      const right = this.surface(46, 26, { tint: C.navy, grad: 0.52, fogNear: 12, fogFar: 40 });
      right.mesh.rotation.y = -Math.PI / 2;
      right.mesh.position.set(15.5, 2.0, WALL_Z + 22);
      this.shell.push(right);

      /* ---- the wall datum that joins the three bays ---- */
      this.datumWide = this.surface(15.4, 0.15, { map: this.canvasTex(drawDatum(false), false), depthWrite: false, fogNear: 26, fogFar: 70 });
      this.datumWide.mesh.position.set(0, EYE + 0.18 - BAY_H / 2 - MATTE_PAD - 1.02, WALL_Z + 0.05);
      this.datumTall = this.surface(0.15, 11.0, { map: this.canvasTex(drawDatum(true), false), depthWrite: false, fogNear: 26, fogFar: 70 });
      this.datumTall.mesh.position.set(-(BAY_W * 0.62) / 2 - 0.96, 0.30, WALL_Z + 0.05);

      /* ---- three fixed bays ---- */
      const matteTex = this.canvasTex(drawMatte(), false);
      const stills = {
        reveal: await loadImage(d('stillReveal')),
        money: await loadImage(d('stillMoney')),
        great: await loadImage(d('stillGreat'))
      };

      this.bays = {};
      for (const key of ['reveal', 'money', 'great']) {
        const img = stills[key];
        let baseTex;
        if (img) {
          baseTex = new THREE.Texture(img);
          baseTex.needsUpdate = true;
          baseTex.colorSpace = THREE.SRGBColorSpace;
          baseTex.minFilter = THREE.LinearMipmapLinearFilter;
          baseTex.magFilter = THREE.LinearFilter;
          baseTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
          baseTex.generateMipmaps = true;
        } else {
          baseTex = this.canvasTex(drawMatte(), false);
        }
        const matte = this.surface(BAY_W + MATTE_PAD * 2, BAY_H + MATTE_PAD * 2, { map: matteTex, edge: true, fogNear: 15, fogFar: 50 });
        const image = this.surface(BAY_W, BAY_H, { map: baseTex, fogNear: 15, fogFar: 50 });
        const p = PLAQUES[key];
        const plaque = this.surface(1.30, 0.65, { map: this.canvasTex(drawPlaque(p[0], p[1], p[2])), fogNear: 15, fogFar: 50 });
        this.bays[key] = { matte, image, plaque, baseTex };
      }
      this.layoutBays(false);

      /* ---- the one live decoder: Momo's bay ---- */
      const el = document.createElement('video');
      el.muted = true; el.defaultMuted = true; el.playsInline = true;
      el.setAttribute('playsinline', ''); el.preload = 'auto'; el.loop = false;
      /* inert: a texture source, not a player */
      el.controls = false; el.tabIndex = -1;
      el.setAttribute('aria-hidden', 'true');
      el.disablePictureInPicture = true;
      el.setAttribute('disableremoteplayback', '');
      el.style.cssText = 'position:absolute;left:-10px;width:1px;height:1px;opacity:0;pointer-events:none';
      this.appendChild(el);
      const vtex = new THREE.VideoTexture(el);
      vtex.colorSpace = THREE.SRGBColorSpace;
      vtex.minFilter = THREE.LinearFilter; vtex.magFilter = THREE.LinearFilter;
      this.vid = {
        el, tex: vtex, url: d('srcReveal'), bay: this.bays.reveal,
        baseTex: this.bays.reveal.baseTex,
        attached: false, armed: false, failed: false, hasStill: !!stills.reveal
      };
      el.addEventListener('error', () => {
        const er = el.error;
        this.vid.failed = true;
        this.setMap(this.vid.bay.image, this.vid.baseTex);
        console.warn('[momo-gallery-stage] video decode failed; holding the baked still', er && er.code, er && er.message);
        this.dispatchEvent(new CustomEvent('momo-state', {
          bubbles: true, detail: { playing: this.playing, t: this.t, mediaFallback: 'reveal' }
        }));
      });

      this._logo = await loadImage(d('logo'));
      this.collectOverlays();
    }

    /* the bays are fixed geometry; only which composition they are hung in
       changes between the wide walk and the authored vertical walk */
    layoutBays(tall) {
      if (this._laidOut === (tall ? 'tall' : 'wide')) return;
      this._laidOut = tall ? 'tall' : 'wide';
      const set = tall ? BAYS_TALL : BAYS_WIDE;
      const s = tall ? 0.62 : 1;
      for (const b of set) {
        const bay = this.bays[b.key];
        if (!bay) continue;
        bay.matte.mesh.scale.setScalar(s);
        bay.image.mesh.scale.setScalar(s);
        bay.plaque.mesh.scale.setScalar(s);
        bay.matte.mesh.position.set(b.x, b.y, WALL_Z + 0.02);
        bay.image.mesh.position.set(b.x, b.y, WALL_Z + 0.04);
        const px = tall ? b.x + (BAY_W * s) / 2 - 0.65 * s : b.x - (BAY_W / 2) + 0.65;
        const py = b.y - (BAY_H * s) / 2 - MATTE_PAD * s - 0.40 * s;
        bay.plaque.mesh.position.set(px, py, WALL_Z + 0.04);
      }
      this.datumWide.mesh.visible = !tall;
      this.datumTall.mesh.visible = tall;
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
      if (this.bays) this.layoutBays(!!this.portrait);
      return true;
    }
    resize() { if (this.syncViewport(true) && !this.playing) this.applyFrame(this.t, true); }

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
    posterFrame() { this.pause(); this.seek(POSTER); }
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

    applyFrame(t, hardSync) {
      if (!this.bays) return;
      this.syncViewport(false);
      const P = !!this.portrait;
      this.layoutBays(P);

      const cp = sample(P ? CAM_TALL : CAM_WIDE, t, this._cp || (this._cp = {}));
      const ct = sample(P ? TGT_TALL : TGT_WIDE, t, this._ct || (this._ct = {}));
      this.camera.position.set(cp.x, cp.y, cp.z);
      this._tgt.set(ct.x, ct.y, ct.z);
      this.camera.lookAt(this._tgt);

      /* the datum draws on from the centre outward */
      const dv = sample(DATUM, t, this._dt || (this._dt = {})).s;
      const dm = P ? this.datumTall : this.datumWide;
      dm.mat.uniforms.uOpacity.value = dv;
      if (P) dm.mesh.scale.set(1, dv, 1);
      else dm.mesh.scale.set(dv, 1, 1);

      this.postMat.uniforms.uDim.value = sample(DIM, t, this._dmv || (this._dmv = {})).s;

      this.syncVideo(t, hardSync);
      this.updateOverlays(t);
      this.cueScore(t);
    }

    /* ---------- the single decoder ----------
       One video in this film. The source is attached once and RETAINED —
       detaching by removing src and calling load() aborts the pending load and
       leaves the element in an error state, which is what raises a native media
       error. Outside its window the element is simply paused. */
    ensureSrc() {
      const v = this.vid;
      if (!v || v.failed || v.attached) return;
      v.el.src = v.url; v.attached = true; v.armed = false;
      try { v.el.load(); } catch (e) {}
    }
    releaseSrc() {
      const v = this.vid;
      if (!v || !v.attached) return;
      try { if (!v.el.paused) v.el.pause(); } catch (e) {}
      v.armed = false;
    }
    enqueueSeek(target) {
      const v = this.vid;
      if (!v || v.seekPending) return;
      v.seekPending = true;
      this._q = (this._q || Promise.resolve()).then(() => new Promise(res => {
        const fin = () => {
          v.el.removeEventListener('seeked', fin);
          v.seekPending = false; v.tex.needsUpdate = true; res();
        };
        if (v.el.readyState < 1) { fin(); return; }
        v.el.addEventListener('seeked', fin);
        setTimeout(fin, 2500);
        try { v.el.currentTime = target; } catch (e) { fin(); }
      }));
    }

    syncVideo(t, hard) {
      const v = this.vid;
      if (!v || !v.bay) return;
      const [tin, tout, span] = VID_WINDOW;
      const live = t >= tin - 0.4 && t <= tout;
      const local = clamp01((t - tin) / Math.max(0.001, tout - tin));
      const target = VID_START + local * span;
      const natural = span / (tout - tin);

      if (!live || v.failed) {
        this.releaseSrc();
        this.setMap(v.bay.image, v.baseTex);
        return;
      }
      this.ensureSrc();
      /* attached is not the same as having a picture: the baked still stays up
         until the decoder actually delivers a frame */
      this.setMap(v.bay.image, v.el.readyState >= 2 ? v.tex : v.baseTex);

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
        /* drift trimmed by rate, never by seeking a playing 1080p element */
        const drift = target - v.el.currentTime;
        let rate = natural * (1 + Math.min(0.3, Math.max(-0.3, drift * 0.6)));
        rate = Math.min(2, Math.max(0.25, rate));
        if (Math.abs(v.el.playbackRate - rate) > 0.01) v.el.playbackRate = rate;
        if (!v.el.seeking && Math.abs(drift) > 2.0) this.enqueueSeek(target);
      }
    }
    setMap(surf, tex) {
      if (tex && surf.mat.uniforms.uMap.value !== tex) surf.mat.uniforms.uMap.value = tex;
    }

    beats(t) {
      const band = (a, b, c, d) => {
        if (t < a || t > d) return 0;
        if (t < b) return OUT(clamp01((t - a) / (b - a)));
        if (t > c) return 1 - HARD(clamp01((t - c) / (d - c)));
        return 1;
      };
      return {
        meta: band(0.25, 1.10, 3.10, 4.10),
        title: band(0.55, 1.40, 3.40, 4.60),
        titleReveal: HARD(clamp01((t - 0.55) / 0.85)),
        collection: band(16.30, 17.20, 17.40, 18.10),
        endcard: band(17.70, 18.60, 20.0, 20.1),
        endLift: 1 - OUT(clamp01((t - 17.70) / 1.5))
      };
    }

    updateOverlays(t) {
      if (!this.overlays) return;
      if (this._ovCount < 6) {
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
      set('meta', B.meta);
      set('scrim', B.title * 0.95);
      set('title', B.title, { clipPath: 'inset(0 ' + (100 - 100 * B.titleReveal).toFixed(2) + '% 0 0)' });
      set('collection', B.collection);
      set('endscrim', B.endcard * 0.9);
      set('endcard', B.endcard, { transform: 'translateY(' + (22 * B.endLift).toFixed(2) + 'px)' });
    }

    cueScore(t) {
      if (!this.score.on) return;
      if (t > 1.30) this.score.tone('a', 220);
      if (t > 7.80) this.score.tone('b', 293.7);
      if (t > 12.00) this.score.tone('c', 329.6);
      if (t > 16.40) this.score.tone('d', 174.6);
    }

    draw() {
      if (!this.renderer) return;
      this.renderer.setRenderTarget(this.rt);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.postScene, this.postCam);
    }

    /* Bounded: the seek queue is given a hard ceiling so a stalled decoder can
       never hang an export run. */
    async renderFrameAt(t) {
      this.playing = false;
      this.t = Math.min(DUR, Math.max(0, t));
      this.applyFrame(this.t, true);
      this.emitTick(true);
      this.emitState();
      const deadline = Date.now() + 3000;
      for (let pass = 0; pass < 3; pass++) {
        await Promise.race([
          (this._q || Promise.resolve()),
          new Promise(r => setTimeout(r, Math.max(0, deadline - Date.now())))
        ]);
        this.applyFrame(this.t, true);
        if (!this.vid || !this.vid.seekPending || Date.now() > deadline) break;
      }
      if (this.vid) this.vid.tex.needsUpdate = true;
      this.draw();
      return true;
    }

    /* ---------- capture: GL frame plus the same beats, composited ---------- */
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

      const B = this.beats(this.t);
      const u = W / 1920;
      const pad = W * 0.052;

      if (B.meta > 0.003) {
        cx.save();
        cx.globalAlpha = B.meta;
        cx.fillStyle = C.pale;
        cx.font = '800 ' + (22 * u).toFixed(1) + 'px Nunito, sans-serif';
        let mx = pad;
        for (const ch of 'INSIDE THE LIVING PORTFOLIO') { cx.fillText(ch, mx, H * 0.11); mx += cx.measureText(ch).width + 2.4 * u; }
        cx.restore();
      }

      if (B.title > 0.003) {
        cx.save();
        cx.globalAlpha = B.title * 0.95;
        const g = cx.createLinearGradient(0, H, 0, H * 0.40);
        g.addColorStop(0, 'rgba(3,23,46,1)');
        g.addColorStop(0.36, 'rgba(3,23,46,.90)');
        g.addColorStop(1, 'rgba(3,23,46,0)');
        cx.fillStyle = g;
        cx.fillRect(0, H * 0.40, W, H * 0.60);
        cx.restore();

        const size = 92 * u;
        cx.save();
        cx.beginPath();
        cx.rect(0, 0, W * B.titleReveal, H);
        cx.clip();
        cx.globalAlpha = B.title;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        cx.fillStyle = '#ffffff';
        cx.fillText('Inside the', pad, H * 0.80);
        cx.fillText('living portfolio', pad, H * 0.80 + size * 1.07);
        const w = cx.measureText('living portfolio').width;
        cx.fillStyle = C.gold;
        cx.fillText('.', pad + w, H * 0.80 + size * 1.07);
        cx.restore();
      }

      if (B.collection > 0.003) {
        cx.save();
        cx.globalAlpha = B.collection;
        cx.font = '800 ' + (22 * u).toFixed(1) + 'px Nunito, sans-serif';
        const s = 'THREE SCENES · ONE CONNECTED COLLECTION';
        let tw = 0;
        for (const ch of s) tw += cx.measureText(ch).width + 2.4 * u;
        /* the same solid navy plate the DOM overlay uses — in portrait this line
           lands over a bay, and pale type on a cream still is unreadable */
        const ph = 34 * u, pw = tw + 32 * u;
        const bx = (W - pw) / 2, by = H * 0.05;
        const r = 8 * u;
        cx.beginPath();
        cx.moveTo(bx + r, by); cx.arcTo(bx + pw, by, bx + pw, by + ph, r);
        cx.arcTo(bx + pw, by + ph, bx, by + ph, r); cx.arcTo(bx, by + ph, bx, by, r);
        cx.arcTo(bx, by, bx + pw, by, r); cx.closePath();
        cx.fillStyle = C.navy; cx.fill();
        cx.fillStyle = '#ffffff';
        let mx = bx + 16 * u;
        for (const ch of s) { cx.fillText(ch, mx, by + 23 * u); mx += cx.measureText(ch).width + 2.4 * u; }
        cx.restore();
      }

      if (B.endcard > 0.003) {
        cx.save();
        cx.globalAlpha = B.endcard * 0.9;
        cx.fillStyle = 'rgba(3,23,46,.88)';
        cx.fillRect(0, 0, W, H);
        cx.restore();

        cx.save();
        cx.globalAlpha = B.endcard;
        cx.translate(0, 22 * u * B.endLift);
        const cy = H * 0.44;
        if (this._logo) {
          const lw = Math.min(W * 0.19, 320 * u);
          const lh = lw * (this._logo.height / this._logo.width);
          const px = (W - lw) / 2, py = cy - lh - 26 * u;
          cx.fillStyle = '#ffffff';
          const r = 14 * u, bx = px - 26 * u, by = py - 18 * u, bw = lw + 52 * u, bh = lh + 36 * u;
          cx.beginPath();
          cx.moveTo(bx + r, by); cx.arcTo(bx + bw, by, bx + bw, by + bh, r);
          cx.arcTo(bx + bw, by + bh, bx, by + bh, r); cx.arcTo(bx, by + bh, bx, by, r);
          cx.arcTo(bx, by, bx + bw, by, r); cx.closePath(); cx.fill();
          cx.drawImage(this._logo, px, py, lw, lh);
        }
        const size = 50 * u;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        cx.textAlign = 'center';
        cx.fillStyle = '#ffffff';
        cx.fillText('The whole portfolio', W / 2, cy + size * 1.5);
        cx.fillText('in one walk', W / 2, cy + size * 2.62);
        cx.fillStyle = C.gold;
        cx.fillText('.', W / 2 + cx.measureText('in one walk').width / 2, cy + size * 2.62);
        cx.font = '800 ' + (22 * u).toFixed(1) + 'px Nunito, sans-serif';
        cx.fillStyle = C.pale;
        cx.fillText('P R O P O S E D   C O N C E P T', W / 2, cy + size * 3.85);
        cx.restore();
      }
      return this._cap;
    }

    record(onDone) {
      if (this._rec) return;
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
        a.download = 'momo-inside-the-living-portfolio-' + (this.aspect === '9:16' ? '9x16' : '16x9') + '.webm';
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

  customElements.define(TAG, MomoGalleryStage);
})();
