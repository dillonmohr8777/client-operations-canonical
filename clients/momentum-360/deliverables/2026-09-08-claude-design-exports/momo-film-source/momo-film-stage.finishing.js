/* Momo — Living Portfolio Film :: WebGL stage
   Real three.js scene. Subdivided deformable planes, video textures from the three
   supplied MP4 masters, original ripple/curl shaders in Momentum colours, and a
   deterministic timeline (every transform is a pure function of t).

   Public API on the <momo-film-stage> element:
     play() pause() toggle() seek(t) posterFrame() replay()
     setAspect('16:9' | '9:16')  setSound(bool)
     record()                       -> realtime WebM capture of the canvas
     await renderFrameAt(t)         -> frame-exact render, seeks every video and waits
     duration                       -> 30
   Events: 'momo-ready', 'momo-tick' (throttled), 'momo-state'
*/
(function () {
  const TAG = 'momo-film-stage';
  if (customElements.get(TAG)) return;

  const DUR = 30;
  const THREE_URL = 'https://unpkg.com/three@0.160.0/build/three.module.js';

  const C = {
    night: '#03172e', navy: '#072d53', blue: '#1766ab', gold: '#efb928',
    paper: '#ffffff', pale: '#f0f5f9', ink: '#102d49', muted: '#52677c',
    line: '#d5e0e9', paperDim: '#d5e4f1'
  };

  /* ---------- easing ---------- */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const fx = t => ((ax * t + bx) * t + cx) * t;
    const dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return function (p) {
      let t = p;
      for (let i = 0; i < 6; i++) {
        const e = fx(t) - p, d = dx(t);
        if (Math.abs(e) < 1e-5) break;
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      t = Math.min(1, Math.max(0, t));
      return ((ay * t + by) * t + cy) * t;
    };
  }
  /* the one Momentum curve: cubic-bezier(.85,0,.15,1) */
  const HARD = bezier(0.85, 0, 0.15, 1);
  const OUT = bezier(0.16, 1, 0.3, 1);
  const SMOOTH = t => t * t * (3 - 2 * t);
  const LIN = t => t;

  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp01 = v => Math.min(1, Math.max(0, v));

  const FIELDS = ['x', 'y', 'z', 'rx', 'ry', 'rz', 's', 'o', 'curl', 'wave'];
  const DEFAULTS = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, o: 0, curl: 0, wave: 0 };

  function sample(keys, t, out) {
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
      const av = a[f] !== undefined ? a[f] : DEFAULTS[f];
      const bv = b[f] !== undefined ? b[f] : DEFAULTS[f];
      out[f] = lerp(av, bv, e);
    }
    return out;
  }

  /* ---------- shaders ---------- */
  const SHEET_VERT = [
    'uniform float uTime; uniform float uCurl; uniform float uWave;',
    'uniform vec2 uSize; uniform float uPhase;',
    'varying vec2 vUv; varying vec3 vN; varying float vDepth; varying vec3 vView;',
    'vec3 disp(vec2 q){',
    '  float x = q.x - 0.5;',
    '  float z = 0.0;',
    '  z += uCurl * (x*x - 0.0833) * 3.4;',
    '  z += uWave * 0.50 * sin(q.x*7.85 + uTime*0.85 + uPhase);',
    '  z += uWave * 0.32 * sin(q.y*5.20 - uTime*0.62 + uPhase*1.7);',
    '  float dx = uWave * 0.10 * sin(q.y*6.28 + uTime*0.44 + uPhase);',
    '  float dy = uCurl * 0.10 * (x*x - 0.0833) + uWave*0.05*cos(q.x*6.28 - uTime*0.5);',
    '  return vec3(dx, dy, z);',
    '}',
    'vec3 surf(vec2 q){ return vec3((q.x-0.5)*uSize.x, (q.y-0.5)*uSize.y, 0.0) + disp(q); }',
    'void main(){',
    '  vUv = uv;',
    '  float e = 0.012;',
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

  const SHEET_FRAG = [
    'precision highp float;',
    'uniform sampler2D uMap; uniform float uOpacity; uniform vec2 uSize;',
    'uniform float uHairline; uniform vec3 uNight; uniform vec3 uNavy;',
    'uniform vec3 uBlue; uniform vec3 uGold; uniform float uFogNear; uniform float uFogFar;',
    'varying vec2 vUv; varying vec3 vN; varying float vDepth; varying vec3 vView;',
    'float sdBox(vec2 p, vec2 b, float r){ vec2 d = abs(p)-b+r; return min(max(d.x,d.y),0.0)+length(max(d,0.0))-r; }',
    /* plain ShaderMaterial gets no colour-management injection, so decode by hand */
    'vec3 srgb2lin(vec3 c){ return mix(c/12.92, pow((c+0.055)/1.055, vec3(2.4)), step(0.04045, c)); }',
    'void main(){',
    '  vec2 hp = (vUv - 0.5) * uSize;',
    '  float d = sdBox(hp, uSize*0.5, 0.055);',
    '  float mask = 1.0 - smoothstep(-0.006, 0.006, d);',
    '  if (mask <= 0.001) discard;',
    '  vec3 tex = srgb2lin(texture2D(uMap, vUv).rgb);',
    '  vec3 L = normalize(vec3(-0.30, 0.62, 0.86));',
    '  vec3 n = normalize(vN);',
    '  float lam = dot(n, L);',
    '  float shade = 0.62 + 0.48 * clamp(abs(lam), 0.0, 1.0);',
    '  vec3 col = tex * shade;',
    '  float shadow = clamp(-lam, 0.0, 1.0);',
    '  col = mix(col, col * 0.52 + uNavy * 0.30, shadow * 0.52);',
    '  float rim = pow(1.0 - clamp(dot(n, normalize(vView)), 0.0, 1.0), 3.0);',
    '  col += uBlue * rim * 0.30;',
    '  float edge = 1.0 - smoothstep(0.0, 0.014, abs(d));',
    '  col = mix(col, uGold, edge * uHairline);',
    '  float fog = clamp((vDepth - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 1.0);',
    '  col = mix(col, uNight, fog * 0.92);',
    '  gl_FragColor = vec4(col, mask * uOpacity);',
    '}'
  ].join('\n');

  const POST_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

  const POST_FRAG = [
    'precision highp float;',
    'uniform sampler2D uScene; uniform float uTime; uniform float uAmp;',
    'uniform float uAspect; uniform vec3 uNight; uniform vec3 uBlue; uniform vec3 uGold;',
    'varying vec2 vUv;',
    /* the render target is linear; the default framebuffer is not, and a raw
       ShaderMaterial receives no <colorspace_fragment>, so encode explicitly */
    'vec3 lin2srgb(vec3 c){ c = max(c, vec3(0.0)); return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }',
    'void main(){',
    '  vec2 uv = vUv;',
    '  vec2 c = uv - 0.5;',
    /* broad fluid ripple, strongest toward the sides, quiet through the centre so copy stays legible */
    '  float side = pow(clamp(abs(c.x)*2.0, 0.0, 1.0), 1.55);',
    '  float vert = pow(clamp(abs(c.y)*2.0, 0.0, 1.0), 1.9);',
    '  float field = max(side, vert*0.65);',
    '  float w = sin(uv.y*8.4 + uTime*1.15) * 0.6',
    '          + sin(uv.y*15.7 - uTime*0.72) * 0.26',
    '          + sin((uv.x*4.1 + uv.y*3.3) - uTime*0.9) * 0.34;',
    '  float h = cos(uv.x*10.6 + uTime*0.95) * 0.5 + cos(uv.x*5.3 - uTime*0.6) * 0.28;',
    '  vec2 off = vec2(w * field, h * field * 0.55) * uAmp;',
    '  vec2 s1 = clamp(uv + off, 0.0, 1.0);',
    '  vec2 s2 = clamp(uv + off * 1.22, 0.0, 1.0);',
    '  vec3 a = texture2D(uScene, s1).rgb;',
    '  vec3 b = texture2D(uScene, s2).rgb;',
    /* the split is kept inside the Momentum palette: one tap leans action blue, one leans gold */
    '  vec3 col = mix(a, b, 0.5);',
    '  float sep = clamp(length(off) * 26.0, 0.0, 1.0);',
    '  col = mix(col, col + (a - b) * 0.9 * (uBlue - uGold) * 1.4, sep * 0.35);',
    '  float lum = dot(col, vec3(0.299, 0.587, 0.114));',
    '  col = mix(col, uNight, clamp((0.012 - lum) * 14.0, 0.0, 1.0));',
    '  gl_FragColor = vec4(lin2srgb(col), 1.0);',
    '}'
  ].join('\n');

  /* ---------- editorial panel textures (drawn, never photographed) ---------- */
  function drawPanel(spec, icon) {
    const W = spec.tall ? 720 : 1280, H = spec.tall ? 1600 : 800;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const pad = spec.tall ? 68 : 88;

    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    g.fillStyle = C.pale; g.fillRect(0, 0, W, spec.tall ? 300 : 8);

    /* meta line — 12px uppercase, 0.08em, the one uppercase register in the system */
    g.fillStyle = C.muted;
    g.font = '800 ' + (spec.tall ? 24 : 24) + 'px Nunito, sans-serif';
    let mx = pad, my = pad + 26;
    for (const ch of spec.meta) {
      g.fillText(ch, mx, my);
      mx += g.measureText(ch).width + (spec.tall ? 1.9 : 2.1);
    }

    /* display headline, navy, gold terminal period */
    const size = spec.tall ? 116 : 132;
    g.font = '900 ' + size + 'px Archivo, sans-serif';
    g.fillStyle = C.navy;
    let ly = my + (spec.tall ? 120 : 150);
    for (const line of spec.title) {
      g.fillText(line, pad, ly);
      ly += size * 1.07;
    }
    const lastW = g.measureText(spec.title[spec.title.length - 1]).width;
    g.fillStyle = C.gold;
    g.fillText('.', pad + lastW, ly - size * 1.07);

    /* hairline + subline */
    ly += spec.tall ? 26 : 34;
    g.fillStyle = C.line; g.fillRect(pad, ly, W - pad * 2, 1);
    ly += spec.tall ? 62 : 74;
    g.fillStyle = C.ink;
    g.font = '400 ' + (spec.tall ? 40 : 40) + 'px Nunito, sans-serif';
    for (const line of spec.sub) { g.fillText(line, pad, ly); ly += (spec.tall ? 40 : 40) * 1.7; }

    /* ceramic service icon on a midnight plate, 14px-radius equivalent.
       On the long sheet the plate carries the middle of the sheet instead of
       leaving a void between the subline and the footer. */
    if (icon) {
      const s = spec.tall ? 404 : 300;
      const px = spec.tall ? (W - s) / 2 : W - pad - s;
      const py = spec.tall ? Math.round(ly + 54) : H - pad - s;
      g.save();
      g.beginPath();
      const r = 26;
      g.moveTo(px + r, py); g.arcTo(px + s, py, px + s, py + s, r);
      g.arcTo(px + s, py + s, px, py + s, r); g.arcTo(px, py + s, px, py, r);
      g.arcTo(px, py, px + s, py, r); g.closePath();
      g.fillStyle = C.night; g.fill(); g.clip();
      g.drawImage(icon, px, py, s, s);
      g.restore();
    }

    /* footer rule + provenance, exactly the register the system uses */
    g.fillStyle = C.line; g.fillRect(pad, H - pad - 34, W - pad * 2, 1);
    g.fillStyle = C.muted;
    g.font = '800 ' + (spec.tall ? 22 : 22) + 'px Nunito, sans-serif';
    g.fillText(spec.foot, pad, H - pad);
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
      lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 0.7;
      lp.connect(this.master);
      this.pad = this.ctx.createGain(); this.pad.gain.value = 0.5; this.pad.connect(lp);
      [55, 82.5, 110.3].forEach((f, i) => {
        const o = this.ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const g = this.ctx.createGain(); g.gain.value = i === 0 ? 0.35 : 0.14;
        o.connect(g); g.connect(this.pad); o.start();
      });
      return this.ctx;
    }
    setOn(v) {
      this.on = v;
      const ctx = this.ensure();
      if (!ctx) return;
      if (v && ctx.state === 'suspended') ctx.resume();
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(v ? 0.16 : 0, ctx.currentTime + 0.5);
    }
    mark(id, freq) {
      if (!this.on || !this.ctx || this.fired[id]) return;
      this.fired[id] = true;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.10, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 1.7);
    }
    reset() { this.fired = {}; }
  }

  /* ---------- element ---------- */
  class MomoFilmStage extends HTMLElement {
    constructor() {
      super();
      this.t = 0;
      this.playing = false;
      this.ready = false;
      this.aspect = '16:9';
      this.score = new Score();
      this._lastEmit = -1;
      this._raf = null;
      this._destroyed = false;
    }

    get duration() { return DUR; }

    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      this.style.display = 'block';
      this.style.position = 'relative';
      this.style.width = '100%';
      this.style.aspectRatio = '16 / 9';
      this.style.background = C.night;
      this.style.borderRadius = '14px';
      this.style.overflow = 'hidden';
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = 'display:block;width:100%;height:100%';
      this.appendChild(this.canvas);
      this.boot().catch(err => {
        console.error('[momo-film-stage]', err);
        this.dispatchEvent(new CustomEvent('momo-state', { bubbles: true, detail: { error: String(err) } }));
      });
    }

    disconnectedCallback() {
      this._destroyed = true;
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      this.videos && this.videos.forEach(v => { try { v.el.pause(); v.el.removeAttribute('src'); v.el.load(); } catch (e) {} });
      if (this.renderer) this.renderer.dispose();
    }

    async boot() {
      const THREE = await import(THREE_URL);
      this.THREE = THREE;
      if (this._destroyed) return;

      try { await document.fonts.load('900 132px Archivo'); await document.fonts.load('400 40px Nunito'); } catch (e) {}
      this._logo = await loadImage(this.dataset.logo || '');

      const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
      r.setClearColor(new THREE.Color(C.night), 1);
      r.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer = r;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(C.night);
      this.camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 100);

      this.rt = new THREE.WebGLRenderTarget(16, 9, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
      this.postScene = new THREE.Scene();
      this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.postMat = new THREE.ShaderMaterial({
        vertexShader: POST_VERT, fragmentShader: POST_FRAG,
        uniforms: {
          uScene: { value: this.rt.texture }, uTime: { value: 0 }, uAmp: { value: 0 },
          uAspect: { value: 16 / 9 },
          uNight: { value: new THREE.Color(C.night) },
          uBlue: { value: new THREE.Color(C.blue) },
          uGold: { value: new THREE.Color(C.gold) }
        }
      });
      this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMat));

      await this.buildSheets();
      this.collectOverlays();
      /* sequential: one decoder at a time, one freeze frame per clip */
      await this.prepareFreezes();

      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(this);
      this.resize();

      this.ready = true;
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.dispatchEvent(new CustomEvent('momo-ready', { bubbles: true, detail: { reduced: this.reduced } }));

      if (this.reduced) {
        this.seek(28.4);
      } else {
        this.seek(0);
        this.play();
      }
      this.loop();
    }

    /* ---------- content ---------- */
    async buildSheets() {
      const THREE = this.THREE;
      const d = k => this.dataset[k] || '';

      const clipDefs = [
        { key: 'reveal', src: d('srcReveal'), clipStart: 0.15, w: 4.6, h: 2.59, seg: [72, 44] },
        { key: 'money', src: d('srcMoney'), clipStart: 5.5, w: 4.6, h: 2.59, seg: [72, 44] },
        { key: 'great', src: d('srcGreat'), clipStart: 7.0, w: 4.6, h: 2.59, seg: [72, 44] }
      ];

      const iconPaths = [d('iconBuild'), d('iconAudience'), d('iconOperations'), d('iconSearch')];
      const icons = await Promise.all(iconPaths.map(loadImage));

      const panelDefs = [
        {
          key: 'design', icon: icons[0], w: 3.15, h: 1.97, seg: [56, 36],
          spec: {
            meta: 'SERVICE LINE 01', title: ['AI DESIGN'],
            sub: ['Interfaces, identity and editorial', 'systems, drawn to be read.'],
            foot: 'MOMENTUM DIGITAL · AI DIVISION'
          }
        },
        {
          key: 'marketing', icon: icons[1], w: 3.15, h: 1.97, seg: [56, 36],
          spec: {
            meta: 'SERVICE LINE 02', title: ['AI MARKETING'],
            sub: ['Campaigns written for people first', 'and machines second.'],
            foot: 'MOMENTUM DIGITAL · AI DIVISION'
          }
        },
        {
          key: 'automation', icon: icons[2], w: 3.15, h: 1.97, seg: [56, 36],
          spec: {
            meta: 'SERVICE LINE 03', title: ['AI AUTOMATION'],
            sub: ['Workflows that carry the routine', 'work of a busy shop.'],
            foot: 'MOMENTUM DIGITAL · AI DIVISION'
          }
        },
        {
          key: 'aeo', icon: icons[3], w: 1.72, h: 3.82, seg: [40, 76], tall: true,
          spec: {
            meta: 'SERVICE LINE 04', title: ['AEO', '+ GEO'],
            sub: ['Answer engines and', 'generative search.'],
            foot: 'MOMENTUM · AI DIVISION', tall: true
          }
        }
      ];

      this.videos = [];
      this.sheets = [];

      for (const def of clipDefs) {
        const el = document.createElement('video');
        /* The preview host serves these MP4s without range support, which leaves
           HTMLMediaElement.seekable empty even when the file is fully buffered.
           Fetching the exact bytes into a Blob URL restores frame-accurate seeking
           without altering, re-encoding or re-timing the supplied master. */
        let src = def.src;
        try {
          const resp = await fetch(def.src);
          if (resp.ok) src = URL.createObjectURL(await resp.blob());
        } catch (e) { /* fall back to the direct path */ }
        el.muted = true; el.defaultMuted = true; el.playsInline = true;
        el.setAttribute('playsinline', ''); el.preload = 'auto'; el.loop = true;
        el.crossOrigin = 'anonymous';
        el.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-10px';
        this.appendChild(el);
        const tex = new THREE.VideoTexture(el);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
        /* src is attached on demand — see ensureSrc/releaseSrc */
        this.videos.push({ key: def.key, el, tex, clipStart: def.clipStart, url: src, attached: false });
        this.sheets.push(this.makeSheet(def.key, tex, def));
      }

      for (const def of panelDefs) {
        const cv = drawPanel(def.spec, def.icon);
        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        tex.generateMipmaps = true;
        this.sheets.push(this.makeSheet(def.key, tex, def, 1));
      }

      this.tracks = buildTracks();
      this.camTrack = CAM_TRACK;
      this.rippleTrack = RIPPLE_TRACK;
      this._tmp = {};
    }

    makeSheet(key, tex, def, hairline) {
      const THREE = this.THREE;
      const geo = new THREE.PlaneGeometry(def.w, def.h, def.seg[0], def.seg[1]);
      const mat = new THREE.ShaderMaterial({
        vertexShader: SHEET_VERT, fragmentShader: SHEET_FRAG,
        transparent: true, side: THREE.DoubleSide, depthWrite: true,
        uniforms: {
          uMap: { value: tex }, uTime: { value: 0 }, uCurl: { value: 0 }, uWave: { value: 0 },
          uSize: { value: new THREE.Vector2(def.w, def.h) }, uOpacity: { value: 0 },
          uPhase: { value: Math.random() * 6.28 },
          uHairline: { value: hairline ? 0.55 : 0.28 },
          uNight: { value: new THREE.Color(C.night) },
          uNavy: { value: new THREE.Color(C.navy) },
          uBlue: { value: new THREE.Color(C.blue) },
          uGold: { value: new THREE.Color(C.gold) },
          uFogNear: { value: 9.0 }, uFogFar: { value: 26.0 }
        }
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.visible = false;
      this.scene.add(mesh);
      return { key, mesh, mat, def, state: {} };
    }

    collectOverlays() {
      const root = this.closest('[data-momo-root]') || this.parentElement;
      this.overlays = {};
      this._ovCount = 0;
      const scope = root || document;
      scope.querySelectorAll('[data-momo-overlay]').forEach(n => {
        this.overlays[n.getAttribute('data-momo-overlay')] = n;
        this._ovCount++;
      });
    }

    /* ---------- layout ---------- */
    /* Single race-free viewport sync. Called from the resize observer AND from
       every frame, so an aspect switch can never leave a stale portrait flag
       (which would render the wide ring inside a tall frame). */
    syncViewport(force) {
      if (!this.renderer) return;
      const w = this.clientWidth || 960;
      const h = this.clientHeight || Math.round(w * 9 / 16);
      if (!force && w === this._vw && h === this._vh) return;
      this._vw = w; this._vh = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(w, h, false);
      this.rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
      /* Overlay type is sized off the FRAME, not the viewport, so the 16:9 and
         9:16 compositions are designed rather than incidental. */
      const root = this.closest('[data-momo-root]') || this;
      root.style.setProperty('--momo-fw', w + 'px');
      const a = w / h;
      this.camera.aspect = a;
      this.postMat.uniforms.uAspect.value = a;
      this._aspect = a;
      this.portrait = a < 1;
      this.camera.updateProjectionMatrix();
      return true;
    }

    resize() {
      if (this.syncViewport(true) && !this.playing) this.applyFrame(this.t, true);
    }

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
      this.videos && this.videos.forEach(v => v.el.pause());
      this.emitState();
    }
    toggle() { this.playing ? this.pause() : this.play(); }
    replay() { this.score.reset(); this.seek(0); this.play(); }
    posterFrame() { this.pause(); this.seek(28.4); }
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
      /* keep the overlay frame locked to the stage so the copy stays composed */
      const root = this.closest('[data-momo-root]');
      if (root) {
        root.style.maxWidth = mode === '9:16' ? 'min(100%, 420px)' : 'none';
        root.style.margin = mode === '9:16' ? '0 auto' : '0';
      }
      /* two frames: one for the aspect-ratio style, one for layout to settle */
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
      } else if (this.ready && now - (this._settleTick || 0) > 400) {
        /* While paused, nothing else drives the serial seek queue — so any sheet
           still waiting on a decoded frame or a freeze capture would sit black
           forever. Re-run the frame until every visible sheet has an image. */
        this._settleTick = now;
        const live = this.liveKey(this.t);
        const waiting = this.videos.some(v => {
          const sh = this.sheets && this.sheets.find(x => x.key === v.key);
          if (!sh || !sh.mesh.visible) return false;
          if (v.key === live) return v.el.readyState < 2;
          return !v.freezeTex && v.el.readyState < 2;
        });
        if (waiting) this.applyFrame(this.t, true);
      }
      this.draw();
    }

    /* every visual property is derived from t alone */
    applyFrame(t, hardSync) {
      if (!this.sheets) return;
      this.syncViewport(false);
      const P = this.portrait ? 1 : 0;
      /* 9:16 is composed, not cropped: the ring narrows hard on x and opens up on y,
         so the procession reads as a vertical column and no sheet leaves frame */
      const spreadX = P ? 0.33 : 1;
      const spreadY = P ? 1.30 : 1;

      for (const s of this.sheets) {
        const k = sample(this.tracks[s.key], t, s.state);
        const vis = k.o > 0.003;
        s.mesh.visible = vis;
        if (!vis) continue;
        s.mesh.position.set(k.x * spreadX, k.y * spreadY, k.z);
        s.mesh.rotation.set(k.rx, k.ry, k.rz);
        s.mesh.scale.setScalar(k.s * (P ? 0.62 : 1));
        s.mat.uniforms.uOpacity.value = k.o;
        s.mat.uniforms.uCurl.value = k.curl;
        s.mat.uniforms.uWave.value = k.wave * 0.72; // finishing: quieter paper preserves readable art
        s.mat.uniforms.uTime.value = t;
      }

      const cam = sample(this.camTrack, t, this._tmp);
      this.camera.position.set(cam.x * spreadX, cam.y, cam.z + (P ? 1.9 : 0));
      this.camera.rotation.set(cam.rx, cam.ry, cam.rz);

      const rip = sample(this.rippleTrack, t, {});
      this.postMat.uniforms.uAmp.value = rip.s * 0.72;
      this.postMat.uniforms.uTime.value = t;

      this.syncVideos(t, hardSync);
      this.updateOverlays(t);
      this.cueScore(t);
    }

    /* ---------- one decoder at a time ----------
       Three simultaneous 1080p H.264 elements exceed what this sandbox will
       decode: two of three wedge at HAVE_METADATA and never produce a frame.
       So exactly one clip ever holds a src. Every other visible video sheet
       shows a freeze frame of its own featured moment, captured sequentially
       at boot. This is a real environment limit, not a stylistic choice. */
    ensureSrc(v) {
      if (v.attached) return;
      for (const o of this.videos) if (o !== v && o.attached) this.releaseSrc(o);
      v.el.src = v.url;
      v.attached = true;
      v.armed = false;
      try { v.el.load(); } catch (e) {}
    }

    releaseSrc(v) {
      if (!v.attached) return;
      try { v.el.pause(); v.el.removeAttribute('src'); v.el.load(); } catch (e) {}
      v.attached = false;
      v.armed = false;
      v.seekPending = false;
    }

    waitFor(el, ev, ms) {
      return new Promise(res => {
        let done = false;
        const fin = () => { if (done) return; done = true; el.removeEventListener(ev, fin); res(); };
        el.addEventListener(ev, fin);
        setTimeout(fin, ms);
      });
    }

    /* Load each clip in turn, park it on its featured still, keep that frame as
       a canvas texture, then release the decoder for the next one. */
    async prepareFreezes() {
      for (const v of this.videos) {
        const win = WINDOWS[v.key];
        const still = v.clipStart + win[2];
        this.ensureSrc(v);
        if (v.el.readyState < 1) await this.waitFor(v.el, 'loadedmetadata', 8000);
        if (v.el.readyState >= 1) {
          try { v.el.currentTime = still; } catch (e) {}
          if (v.el.readyState < 2 || v.el.seeking) await this.waitFor(v.el, 'seeked', 8000);
        }
        if (!this.captureFreeze(v)) {
          await this.waitFor(v.el, 'loadeddata', 3000);
          this.captureFreeze(v);
        }
        this.releaseSrc(v);
      }
    }

    /* Which clip owns the moving image right now. Windows never overlap. */
    liveKey(t) {
      for (const k in WINDOWS) {
        const w = WINDOWS[k];
        if (t >= w[0] - 0.35 && t <= w[1]) return k;
      }
      return null;
    }

    /* All seeks go through one serial queue. Concurrent seeks on several 1080p
       elements are what stall them, so they are strictly one at a time. */
    enqueueSeek(v, target, then) {
      if (v.seekPending) return;
      v.seekPending = true;
      this._q = (this._q || Promise.resolve()).then(() => new Promise(res => {
        const finish = () => {
          v.el.removeEventListener('seeked', finish);
          v.seekPending = false;
          v.tex.needsUpdate = true;
          if (then) { try { then(); } catch (e) {} }
          res();
        };
        if (v.el.readyState < 1) { finish(); return; }
        v.el.addEventListener('seeked', finish);
        setTimeout(finish, 3500);
        try { v.el.currentTime = target; } catch (e) { finish(); }
      }));
    }

    /* A still of the clip's own last moment, used once its window closes so the
       sheet can stay in the composition without holding a decoder open. */
    captureFreeze(v) {
      if (v.el.readyState < 2) return false;
      const THREE = this.THREE;
      if (!v.freezeCv) {
        v.freezeCv = document.createElement('canvas');
        v.freezeCv.width = 1280; v.freezeCv.height = 720;
      }
      try {
        v.freezeCv.getContext('2d').drawImage(v.el, 0, 0, 1280, 720);
      } catch (e) { return false; }
      if (!v.freezeTex) {
        v.freezeTex = new THREE.CanvasTexture(v.freezeCv);
        v.freezeTex.colorSpace = THREE.SRGBColorSpace;
        v.freezeTex.minFilter = THREE.LinearFilter;
        v.freezeTex.magFilter = THREE.LinearFilter;
      } else {
        v.freezeTex.needsUpdate = true;
      }
      return true;
    }

    setMap(sheet, tex) {
      if (tex && sheet.mat.uniforms.uMap.value !== tex) sheet.mat.uniforms.uMap.value = tex;
    }

    syncVideos(t, hard) {
      const live = this.liveKey(t);
      for (const v of this.videos) {
        const sheet = this.sheets.find(s => s.key === v.key);
        const visible = sheet && sheet.mesh.visible && sheet.state.o > 0.05;
        const win = WINDOWS[v.key];
        const local = clamp01((t - win[0]) / Math.max(0.001, win[1] - win[0]));
        const target = v.clipStart + local * win[2];
        const natural = win[2] / Math.max(0.001, win[1] - win[0]);

        if (!visible) {
          if (!v.el.paused) v.el.pause();
          if (v.key !== live) this.releaseSrc(v);
          v.armed = false;
          continue;
        }

        /* outside its window: after it, hold the freeze frame; before it,
           pre-roll to the window's first frame — but only if this clip already
           owns the single decoder, otherwise the freeze stands in. */
        if (v.key !== live) {
          if (v.attached && !this.playing) this.releaseSrc(v);
          v.armed = false;
          if (!v.freezeTex && v.attached) {
            const still = v.clipStart + win[2];
            if (v.el.readyState >= 2 && Math.abs(v.el.currentTime - still) < 0.25) {
              this.captureFreeze(v);
            } else {
              this.enqueueSeek(v, still, () => this.captureFreeze(v));
            }
          }
          this.setMap(sheet, v.freezeTex || v.tex);
          continue;
        }

        this.ensureSrc(v);

        this.setMap(sheet, v.tex);

        if (hard || !this.playing) {
          if (!v.el.paused) v.el.pause();
          v.armed = false;
          if (Math.abs(v.el.currentTime - target) > 0.04) this.enqueueSeek(v, target);
          v.tex.needsUpdate = true;
        } else if (!v.armed) {
          /* arm on the exact frame before letting it run, so the sheet never
             appears showing the wrong moment of the clip */
          if (!v.el.paused) v.el.pause();
          if (Math.abs(v.el.currentTime - target) > 0.12) {
            this.enqueueSeek(v, target);
          } else if (!v.seekPending && v.el.readyState >= 2) {
            v.armed = true;
            v.el.playbackRate = natural;
            const p = v.el.play(); if (p && p.catch) p.catch(() => {});
          }
          v.tex.needsUpdate = true;
        } else {
          if (v.el.paused) { const p = v.el.play(); if (p && p.catch) p.catch(() => {}); }
          /* drift is trimmed by nudging playbackRate, never by seeking — seeking
             a playing 1080p element stalls it */
          const drift = target - v.el.currentTime;
          let rate = natural * (1 + Math.min(0.3, Math.max(-0.3, drift * 0.6)));
          rate = Math.min(2, Math.max(0.25, rate));
          if (Math.abs(v.el.playbackRate - rate) > 0.01) v.el.playbackRate = rate;
          if (Math.abs(drift) > 2.0) this.enqueueSeek(v, target);
        }
      }
    }

    /* One source of truth for the text beats. The HTML overlays and the
       composited capture layer both read this, so the recorded file and the
       live preview cannot drift apart. */
    beats(t) {
      const band = (a, b, c, d) => {
        if (t < a || t > d) return 0;
        if (t < b) return OUT(clamp01((t - a) / (b - a)));
        if (t > c) return 1 - HARD(clamp01((t - c) / (d - c)));
        return 1;
      };
      return {
        meta: band(0.5, 1.4, 3.4, 4.4),
        title: band(0.3, 1.0, 5.2, 6.2),
        titleReveal: OUT(clamp01((t - 0.3) / 0.7)),
        endcard: band(25.7, 26.5, 30, 30.1),
        endcardLift: 1 - OUT(clamp01((t - 25.7) / 0.8))
      };
    }

    updateOverlays(t) {
      if (!this.overlays) return;
      /* React may still be streaming the overlay markup when the stage boots */
      if (!this._ovCount) {
        this._ovTry = (this._ovTry || 0) + 1;
        if (this._ovTry % 20 === 1) this.collectOverlays();
        if (!this._ovCount) return;
      }
      const set = (key, o, extra) => {
        const n = this.overlays[key];
        if (!n) return;
        n.style.opacity = String(o);
        n.style.pointerEvents = 'none';
        if (extra) Object.assign(n.style, extra);
      };
      const B = this.beats(t);
      set('meta', B.meta);
      /* the scrim is what keeps full-opacity white ink legible once the first
         cream sheet moves in behind the title */
      set('scrim', B.title * 0.96);
      const clip = 100 - 100 * B.titleReveal;
      set('title', B.title, { clipPath: 'inset(0 ' + clip.toFixed(2) + '% 0 0)' });
      set('endcard', B.endcard);
      const ec = this.overlays.endcard;
      if (ec) ec.style.transform = 'translateY(' + (26 * B.endcardLift).toFixed(2) + 'px)';
    }

    /* ---------- composited capture layer ----------
       The WebGL canvas holds only the sheets. Anything captured from it alone
       would be a film with no title and no end card, so capture goes through a
       2D surface: the GL frame first, then the same text beats drawn on top from
       beats(t). Identical copy, identical palette, identical timing. */
    drawCaptureFrame() {
      const cx = this._cap && this._cap.getContext('2d');
      if (!cx) return;
      const W = this._cap.width, H = this._cap.height;
      cx.clearRect(0, 0, W, H);
      cx.drawImage(this.canvas, 0, 0, W, H);

      const B = this.beats(this.t);
      const u = W / 1920; /* every measure below is authored against the 1920 master */
      const pad = 100 * u;

      const tracked = (text, x, y, size, spacing) => {
        let px = x;
        for (const ch of text) {
          cx.fillText(ch, px, y);
          px += cx.measureText(ch).width + spacing;
        }
        return px - x;
      };

      if (B.meta > 0.003) {
        cx.save();
        cx.globalAlpha = B.meta;
        cx.fillStyle = C.paperDim;
        cx.font = '800 ' + (26 * u).toFixed(1) + 'px Nunito, sans-serif';
        tracked('MOMENTUM DIGITAL · AI DIVISION', pad, H * 0.115, 26 * u, 2.1 * u);
        cx.restore();
      }

      if (B.title > 0.003) {
        const size = 108 * u;
        cx.save();
        cx.globalAlpha = B.title * 0.96;
        const grad = cx.createLinearGradient(0, H, 0, H * 0.42);
        grad.addColorStop(0, 'rgba(3,23,46,1)');
        grad.addColorStop(0.34, 'rgba(3,23,46,.92)');
        grad.addColorStop(0.66, 'rgba(3,23,46,.55)');
        grad.addColorStop(1, 'rgba(3,23,46,0)');
        cx.fillStyle = grad;
        cx.fillRect(0, H * 0.42, W, H * 0.58);
        cx.restore();

        cx.save();
        cx.globalAlpha = B.title;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        /* the same left-to-right wipe the overlay uses */
        cx.beginPath();
        cx.rect(0, 0, W * B.titleReveal, H);
        cx.clip();
        cx.fillStyle = C.paper;
        cx.fillText('Ideas into', pad, H - pad - size * 1.07);
        const w2 = cx.measureText('motion').width;
        cx.fillText('motion', pad, H - pad);
        cx.fillStyle = C.gold;
        cx.fillText('.', pad + w2, H - pad);
        cx.restore();
      }

      if (B.endcard > 0.003) {
        cx.save();
        cx.globalAlpha = B.endcard;
        cx.translate(0, 26 * u * B.endcardLift);
        const logo = this._logo;
        const lw = 300 * u;
        const lh = logo ? lw * (logo.naturalHeight / logo.naturalWidth) : 0;
        const plateW = lw + 64 * u, plateH = lh + 40 * u;
        const gap = 38 * u;
        const headSize = 62 * u, tagSize = 26 * u;
        const blockH = plateH + gap + headSize + gap * 0.8 + tagSize;
        let y = (H - blockH) / 2;

        if (logo) {
          const px = (W - plateW) / 2, r = 14 * u;
          cx.beginPath();
          cx.moveTo(px + r, y); cx.arcTo(px + plateW, y, px + plateW, y + plateH, r);
          cx.arcTo(px + plateW, y + plateH, px, y + plateH, r);
          cx.arcTo(px, y + plateH, px, y, r);
          cx.arcTo(px, y, px + plateW, y, r); cx.closePath();
          cx.fillStyle = C.paper; cx.fill();
          cx.drawImage(logo, px + 32 * u, y + 20 * u, lw, lh);
        }
        y += plateH + gap + headSize * 0.78;

        cx.font = '900 ' + headSize.toFixed(1) + 'px Archivo, sans-serif';
        cx.textAlign = 'center';
        const headW = cx.measureText('Make your next move').width;
        cx.fillStyle = C.paper;
        cx.fillText('Make your next move', W / 2, y);
        cx.textAlign = 'left';
        cx.fillStyle = C.gold;
        cx.fillText('.', W / 2 + headW / 2, y);
        y += gap * 0.8 + tagSize;

        cx.fillStyle = C.paperDim;
        cx.font = '800 ' + tagSize.toFixed(1) + 'px Nunito, sans-serif';
        let probe = 0;
        for (const ch of 'NEEDMOMENTUM.COM') probe += cx.measureText(ch).width + 2.1 * u;
        tracked('NEEDMOMENTUM.COM', (W - probe) / 2, y, tagSize, 2.1 * u);
        cx.restore();
      }
    }

    cueScore(t) {
      if (!this.score.on) return;
      if (t > 4.2) this.score.mark('a', 220);
      if (t > 9.6) this.score.mark('b', 293.7);
      if (t > 14.6) this.score.mark('c', 329.6);
      if (t > 19.6) this.score.mark('d', 246.9);
      if (t > 26.6) this.score.mark('e', 174.6);
    }

    draw() {
      if (!this.renderer) return;
      this.renderer.setRenderTarget(this.rt);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.postScene, this.postCam);
    }

    /* frame-exact single frame: drive the serial seek queue to completion */
    async renderFrameAt(t) {
      this.playing = false;
      this.t = Math.min(DUR, Math.max(0, t));
      this.applyFrame(this.t, true);
      this.emitTick(true);
      this.emitState();
      /* applyFrame enqueues whatever seeks this frame needs; the queue runs them
         one at a time. Drain it, then re-run in case a freeze capture queued more. */
      for (let pass = 0; pass < 3; pass++) {
        await (this._q || Promise.resolve());
        this.applyFrame(this.t, true);
        if (!this.videos.some(v => v.seekPending)) break;
      }
      await (this._q || Promise.resolve());
      this.videos.forEach(v => { v.tex.needsUpdate = true; if (v.freezeTex) v.freezeTex.needsUpdate = true; });
      this.draw();
      return true;
    }

    /* realtime capture of the sheets AND the text beats, composited */
    record(onDone) {
      if (this._rec) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cap = document.createElement('canvas');
      cap.width = Math.round(this.clientWidth * dpr);
      cap.height = Math.round(this.clientHeight * dpr);
      cap.getContext('2d');
      this._cap = cap;
      const stream = cap.captureStream(60);
      if (this.score.on && this.score.dest) {
        this.score.dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
      }
      const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      const mime = types.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
      if (!mime) { onDone && onDone({ error: 'MediaRecorder unavailable in this browser.' }); return; }
      const chunks = [];
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 16000000 });
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        this._rec = null;
        this._cap = null;
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'momo-ideas-into-motion-' + (this.aspect === '9:16' ? '9x16' : '16x9') + '.webm';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        onDone && onDone({ bytes: blob.size, mime });
      };
      this._rec = rec;
      this._capLoop = () => {
        if (!this._cap) return;
        this.drawCaptureFrame();
        requestAnimationFrame(this._capLoop);
      };
      requestAnimationFrame(this._capLoop);
      this.score.reset();
      this.seek(0);
      this.play();
      rec.start(250);
      const stop = () => {
        if (this.t >= DUR - 0.05 || !this.playing) { rec.stop(); }
        else requestAnimationFrame(stop);
      };
      requestAnimationFrame(stop);
    }
  }

  /* video windows: [liveInT, liveOutT, secondsOfClipConsumed].
     They deliberately do NOT overlap: only one 1080p clip decodes at a time.
     A sheet stays on screen after its window closes, holding a freeze frame. */
  const WINDOWS = {
    reveal: [3.2, 12.5, 7.6],
    money: [13.0, 18.2, 5.0],
    great: [18.4, 27.5, 8.4]
  };

  /* ---------- the 30-second score ---------- */
  const CAM_TRACK = [
    { t: 0, x: 0.0, y: 0.10, z: 8.6, ry: 0.03, s: 1, o: 1 },
    { t: 4.0, x: -0.14, y: 0.04, z: 7.4, ry: -0.02, s: 1, o: 1, ease: OUT },
    { t: 9.0, x: 0.22, y: -0.06, z: 6.8, ry: 0.04, s: 1, o: 1, ease: SMOOTH },
    { t: 14.0, x: -0.20, y: 0.10, z: 7.1, ry: -0.05, s: 1, o: 1, ease: SMOOTH },
    { t: 19.0, x: 0.18, y: -0.04, z: 7.0, ry: 0.05, s: 1, o: 1, ease: SMOOTH },
    { t: 24.0, x: 0.0, y: 0.0, z: 7.6, ry: 0.0, s: 1, o: 1, ease: SMOOTH },
    { t: 27.0, x: 0.0, y: 0.0, z: 8.0, ry: 0.0, s: 1, o: 1, ease: HARD },
    { t: 30, x: 0.0, y: 0.0, z: 8.05, ry: 0.0, s: 1, o: 1, ease: LIN }
  ];

  /* ripple amplitude — carries every transition, resolves to nothing on the copy beats */
  const RIPPLE_TRACK = [
    { t: 0, s: 0.004 },
    { t: 2.6, s: 0.006, ease: SMOOTH },
    { t: 4.4, s: 0.030, ease: HARD },
    { t: 6.4, s: 0.009, ease: OUT },
    { t: 9.4, s: 0.034, ease: HARD },
    { t: 11.4, s: 0.008, ease: OUT },
    { t: 14.2, s: 0.036, ease: HARD },
    { t: 16.2, s: 0.008, ease: OUT },
    { t: 19.4, s: 0.038, ease: HARD },
    { t: 21.4, s: 0.009, ease: OUT },
    { t: 24.4, s: 0.026, ease: HARD },
    { t: 26.6, s: 0.0, ease: OUT },
    { t: 30, s: 0.0, ease: LIN }
  ];

  function buildTracks() {
    return {
      /* 1 — Momo Reveal. Arrives from depth and curls toward the viewer. */
      reveal: [
        { t: 0.0, x: 0.35, y: -0.15, z: -8.0, ry: 0.90, rz: 0.10, s: 1, o: 0.55, curl: 0.15, wave: 0.30 },
        { t: 3.2, x: 0.30, y: -0.10, z: -5.5, ry: 0.72, rz: 0.09, s: 1, o: 0.85, curl: 0.20, wave: 0.34, ease: OUT },
        { t: 5.6, x: 0.10, y: 0.00, z: -2.0, ry: 0.52, rz: 0.04, s: 1, o: 1, curl: 0.85, wave: 0.34, ease: HARD },
        { t: 7.8, x: -0.06, y: 0.04, z: -0.55, ry: 0.16, rz: -0.02, s: 0.9, o: 1, curl: 1.55, wave: 0.20, ease: OUT },
        { t: 10.6, x: -2.60, y: 0.55, z: -3.0, ry: -0.46, rz: 0.05, s: 1, o: 1, curl: 0.55, wave: 0.50, ease: SMOOTH },
        { t: 15.0, x: -4.90, y: 1.35, z: -6.4, ry: -0.88, rz: 0.09, s: 1, o: 0.85, curl: 0.30, wave: 0.55, ease: SMOOTH },
        { t: 20.0, x: -4.30, y: 1.50, z: -6.9, ry: -0.70, rz: 0.06, s: 1, o: 0.75, curl: 0.26, wave: 0.48, ease: SMOOTH },
        { t: 25.2, x: -3.55, y: 1.52, z: -3.60, ry: 0.30, rz: -0.03, s: 0.56, o: 1, curl: 0.14, wave: 0.14, ease: HARD },
        { t: 27.2, x: -3.53, y: 1.53, z: -3.58, ry: 0.28, rz: -0.03, s: 0.56, o: 1, curl: 0.05, wave: 0.03, ease: OUT },
        { t: 30, x: -3.53, y: 1.53, z: -3.58, ry: 0.28, rz: -0.03, s: 0.56, o: 1, curl: 0.04, wave: 0.02, ease: LIN }
      ],
      /* 2 — Momo Watches the Money. Enters low from the right, undulating. */
      money: [
        { t: 0, x: 4.8, y: -1.6, z: -11.0, ry: -1.20, rz: -0.10, s: 1, o: 0, curl: 0.2, wave: 0.5 },
        { t: 12.6, x: 4.6, y: -1.5, z: -9.6, ry: -1.10, rz: -0.10, s: 1, o: 0, curl: 0.3, wave: 0.6 },
        { t: 15.2, x: 1.05, y: -0.42, z: -1.5, ry: -0.44, rz: -0.05, s: 1, o: 1, curl: 0.95, wave: 0.55, ease: HARD },
        { t: 17.8, x: 0.35, y: -0.15, z: -1.00, ry: -0.16, rz: -0.02, s: 0.9, o: 1, curl: 1.25, wave: 0.30, ease: OUT },
        { t: 21.0, x: 2.70, y: -0.95, z: -3.1, ry: 0.42, rz: 0.04, s: 1, o: 1, curl: 0.55, wave: 0.52, ease: SMOOTH },
        { t: 25.2, x: 3.55, y: -1.52, z: -3.60, ry: -0.30, rz: 0.03, s: 0.56, o: 1, curl: 0.14, wave: 0.14, ease: HARD },
        { t: 27.2, x: 3.53, y: -1.53, z: -3.58, ry: -0.28, rz: 0.03, s: 0.56, o: 1, curl: 0.05, wave: 0.03, ease: OUT },
        { t: 30, x: 3.53, y: -1.53, z: -3.58, ry: -0.28, rz: 0.03, s: 0.56, o: 1, curl: 0.04, wave: 0.02, ease: LIN }
      ],
      /* 3 — Great Ones Build Momentum. Sweeps across the top on the last orbit. */
      great: [
        { t: 0, x: -4.6, y: 2.4, z: -12.0, ry: 1.05, rz: 0.12, s: 1, o: 0, curl: 0.2, wave: 0.5 },
        { t: 18.0, x: -4.2, y: 2.2, z: -10.0, ry: 0.95, rz: 0.12, s: 1, o: 0, curl: 0.3, wave: 0.6 },
        { t: 20.6, x: -0.85, y: 0.55, z: -1.6, ry: 0.40, rz: 0.05, s: 1, o: 1, curl: 0.90, wave: 0.50, ease: HARD },
        { t: 22.8, x: -0.20, y: 0.22, z: -1.10, ry: 0.14, rz: 0.02, s: 0.9, o: 1, curl: 1.20, wave: 0.26, ease: OUT },
        { t: 25.2, x: 3.60, y: 1.52, z: -3.90, ry: -0.34, rz: -0.03, s: 0.56, o: 1, curl: 0.16, wave: 0.16, ease: HARD },
        { t: 27.2, x: 3.58, y: 1.53, z: -3.88, ry: -0.32, rz: -0.03, s: 0.56, o: 1, curl: 0.05, wave: 0.03, ease: OUT },
        { t: 30, x: 3.58, y: 1.53, z: -3.88, ry: -0.32, rz: -0.03, s: 0.56, o: 1, curl: 0.04, wave: 0.02, ease: LIN }
      ],
      /* editorial panels — the choreographed orbit between the video moments */
      design: [
        { t: 0, x: -5.2, y: -1.2, z: -8.0, ry: 0.95, rz: -0.08, s: 1, o: 0, curl: 0.2, wave: 0.45 },
        { t: 8.6, x: -4.8, y: -1.1, z: -7.2, ry: 0.90, rz: -0.08, s: 1, o: 0, curl: 0.25, wave: 0.5 },
        { t: 10.4, x: -1.75, y: -0.55, z: -1.3, ry: 0.44, rz: -0.04, s: 1, o: 1, curl: 0.62, wave: 0.34, ease: HARD },
        { t: 13.2, x: -0.30, y: -0.22, z: -0.85, ry: 0.12, rz: -0.01, s: 1, o: 1, curl: 0.34, wave: 0.12, ease: OUT },
        { t: 16.4, x: -3.10, y: -1.05, z: -3.4, ry: -0.44, rz: 0.05, s: 1, o: 0.9, curl: 0.55, wave: 0.44, ease: SMOOTH },
        { t: 21.0, x: -3.40, y: -1.30, z: -4.6, ry: -0.58, rz: 0.06, s: 1, o: 0.8, curl: 0.45, wave: 0.42, ease: SMOOTH },
        { t: 25.2, x: -3.55, y: -1.52, z: -3.60, ry: 0.30, rz: 0.03, s: 0.56, o: 1, curl: 0.13, wave: 0.13, ease: HARD },
        { t: 27.2, x: -3.53, y: -1.53, z: -3.58, ry: 0.28, rz: 0.03, s: 0.56, o: 1, curl: 0.05, wave: 0.03, ease: OUT },
        { t: 30, x: -3.53, y: -1.53, z: -3.58, ry: 0.28, rz: 0.03, s: 0.56, o: 1, curl: 0.04, wave: 0.02, ease: LIN }
      ],
      marketing: [
        { t: 0, x: 5.0, y: 1.8, z: -8.6, ry: -0.95, rz: 0.08, s: 1, o: 0, curl: 0.2, wave: 0.45 },
        { t: 11.6, x: 4.7, y: 1.7, z: -7.8, ry: -0.92, rz: 0.08, s: 1, o: 0, curl: 0.25, wave: 0.5 },
        { t: 13.4, x: 1.90, y: 0.72, z: -1.6, ry: -0.46, rz: 0.04, s: 1, o: 1, curl: 0.60, wave: 0.32, ease: HARD },
        { t: 16.0, x: 0.42, y: 0.34, z: -0.90, ry: -0.14, rz: 0.01, s: 1, o: 1, curl: 0.32, wave: 0.11, ease: OUT },
        { t: 19.4, x: 3.15, y: 1.25, z: -3.6, ry: 0.42, rz: -0.05, s: 1, o: 0.9, curl: 0.52, wave: 0.42, ease: SMOOTH },
        { t: 22.6, x: 2.10, y: 2.35, z: -5.2, ry: 0.20, rz: -0.03, s: 1, o: 0.85, curl: 0.34, wave: 0.34, ease: SMOOTH },
        { t: 25.2, x: 0.0, y: 2.55, z: -4.6, ry: 0.0, rz: 0.0, s: 0.58, o: 1, curl: 0.12, wave: 0.12, ease: HARD },
        { t: 27.2, x: 0.0, y: 2.54, z: -4.6, ry: 0.0, rz: 0.0, s: 0.58, o: 1, curl: 0.05, wave: 0.03, ease: OUT },
        { t: 30, x: 0.0, y: 2.54, z: -4.6, ry: 0.0, rz: 0.0, s: 0.58, o: 1, curl: 0.04, wave: 0.02, ease: LIN }
      ],
      automation: [
        { t: 0, x: 4.4, y: -2.6, z: -9.4, ry: -0.85, rz: -0.10, s: 1, o: 0, curl: 0.2, wave: 0.45 },
        { t: 16.2, x: 4.2, y: -2.5, z: -8.8, ry: -0.82, rz: -0.10, s: 1, o: 0, curl: 0.25, wave: 0.5 },
        { t: 18.2, x: 1.55, y: -1.00, z: -2.0, ry: -0.40, rz: -0.05, s: 1, o: 1, curl: 0.58, wave: 0.34, ease: HARD },
        { t: 20.4, x: 0.55, y: -0.72, z: -1.25, ry: -0.16, rz: -0.02, s: 1, o: 1, curl: 0.34, wave: 0.13, ease: OUT },
        { t: 23.2, x: -1.40, y: -2.10, z: -4.4, ry: 0.30, rz: 0.03, s: 1, o: 0.9, curl: 0.44, wave: 0.38, ease: SMOOTH },
        { t: 25.2, x: 0.0, y: -2.55, z: -4.6, ry: 0.0, rz: 0.0, s: 0.58, o: 1, curl: 0.12, wave: 0.12, ease: HARD },
        { t: 27.2, x: 0.0, y: -2.54, z: -4.6, ry: 0.0, rz: 0.0, s: 0.58, o: 1, curl: 0.05, wave: 0.03, ease: OUT },
        { t: 30, x: 0.0, y: -2.54, z: -4.6, ry: 0.0, rz: 0.0, s: 0.58, o: 1, curl: 0.04, wave: 0.02, ease: LIN }
      ],
      /* the long sheet — tall format, present from the first orbit as a slow vertical current */
      aeo: [
        { t: 0, x: -6.4, y: 0.4, z: -12.0, ry: 0.80, rz: 0.06, s: 1, o: 0, curl: 0.2, wave: 0.55 },
        { t: 1.8, x: -6.2, y: 0.4, z: -11.0, ry: 0.78, rz: 0.06, s: 1, o: 0.30, curl: 0.22, wave: 0.58, ease: OUT },
        { t: 6.2, x: -5.4, y: 0.4, z: -9.0, ry: 0.78, rz: 0.06, s: 1, o: 0.45, curl: 0.25, wave: 0.6, ease: SMOOTH },
        { t: 8.4, x: -3.55, y: 0.05, z: -4.2, ry: 0.56, rz: 0.05, s: 1, o: 0.92, curl: 0.50, wave: 0.60, ease: HARD },
        { t: 12.4, x: -2.30, y: 0.55, z: -2.6, ry: 0.34, rz: 0.03, s: 1, o: 1, curl: 0.42, wave: 0.46, ease: SMOOTH },
        { t: 17.0, x: 3.55, y: -0.20, z: -4.6, ry: -0.52, rz: -0.05, s: 1, o: 0.9, curl: 0.48, wave: 0.58, ease: SMOOTH },
        { t: 22.0, x: -4.10, y: 0.10, z: -5.2, ry: 0.58, rz: 0.05, s: 1, o: 0.9, curl: 0.44, wave: 0.54, ease: SMOOTH },
        { t: 25.2, x: -5.95, y: 0.00, z: -4.6, ry: 0.38, rz: 0.0, s: 0.76, o: 1, curl: 0.12, wave: 0.12, ease: HARD },
        { t: 27.2, x: -5.92, y: 0.00, z: -4.58, ry: 0.36, rz: 0.0, s: 0.76, o: 1, curl: 0.05, wave: 0.03, ease: OUT },
        { t: 30, x: -5.92, y: 0.00, z: -4.58, ry: 0.36, rz: 0.0, s: 0.76, o: 1, curl: 0.04, wave: 0.02, ease: LIN }
      ]
    };
  }

  customElements.define(TAG, MomoFilmStage);
})();

