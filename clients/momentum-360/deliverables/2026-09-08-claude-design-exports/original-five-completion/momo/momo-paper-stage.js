/* Momo paper-desk stage :: spec-driven WebGL film engine
   Generalised from the First Assignment engine, whose behaviour it preserves:
   subdivided deformable card planes lying on a paper desk in three.js, one
   moving video decoder with a baked-still base, quiet post, and a deterministic
   timeline where every transform is a pure function of t.

   A film supplies a spec on window.MOMO_FILM_SPECS[name]; the element picks it
   up via data-film. Public API and events match the First Assignment stage:
     play() pause() toggle() seek(t) replay() posterFrame()
     setAspect('16:9'|'9:16') setSound(bool) record() renderFrameAt(t)
     duration, timingContract
*/
(function () {
  const TAG = 'momo-paper-stage';
  if (customElements.get(TAG)) return;

  const FPS = 30;
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
      return ((ay * t + by) * t + cy) * Math.min(1, Math.max(0, t));
    };
  }
  const HARD = bezier(0.85, 0, 0.15, 1);
  const OUT = bezier(0.16, 1, 0.3, 1);
  const IN = bezier(0.5, 0, 0.9, 0.4);
  const SMOOTH = t => t * t * (3 - 2 * t);
  const LIN = t => t;
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const REST = 0.022;

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

  const CARD_VERT = [
    'uniform float uTime; uniform float uCurl; uniform float uWave;',
    'uniform vec2 uSize; uniform float uPhase;',
    'varying vec2 vUv; varying vec3 vN; varying float vDepth; varying vec3 vView;',
    /* one-sided so a card never displaces below its own plane */
    'vec3 disp(vec2 q){',
    '  float y = q.y - 0.5;',
    '  float z = uCurl * y * y * 2.6;',
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
    'uniform float uEdge; uniform float uRadius;',
    'uniform vec3 uNight; uniform vec3 uNavy; uniform vec3 uBlue; uniform vec3 uGold;',
    'uniform float uFogNear; uniform float uFogFar;',
    'varying vec2 vUv; varying vec3 vN; varying float vDepth; varying vec3 vView;',
    'float sdBox(vec2 p, vec2 b, float r){ vec2 d = abs(p)-b+r; return min(max(d.x,d.y),0.0)+length(max(d,0.0))-r; }',
    'vec3 srgb2lin(vec3 c){ return mix(c/12.92, pow((c+0.055)/1.055, vec3(2.4)), step(0.04045, c)); }',
    'void main(){',
    '  vec2 hp = (vUv - 0.5) * uSize;',
    '  float d = sdBox(hp, uSize*0.5, uRadius);',
    '  vec4 src = texture2D(uMap, vUv);',
    /* alpha folded in before the discard: transparent surfaces neither paint
       black nor write depth over the cards behind them */
    '  float mask = (1.0 - smoothstep(-0.005, 0.005, d)) * src.a;',
    '  if (mask <= 0.004) discard;',
    '  vec3 tex = srgb2lin(src.rgb);',
    '  vec3 L = normalize(vec3(-0.34, 0.78, 0.52));',
    '  vec3 n = normalize(vN);',
    '  float lam = dot(n, L);',
    '  vec3 col = tex * (0.74 + 0.34 * clamp(abs(lam), 0.0, 1.0));',
    '  col = mix(col, col * 0.62 + uNavy * 0.20, clamp(-lam, 0.0, 1.0) * 0.52);',
    '  float rim = pow(1.0 - clamp(dot(n, normalize(vView)), 0.0, 1.0), 3.0);',
    '  col += uBlue * rim * 0.16;',
    '  float edge = 1.0 - smoothstep(0.0, 0.011, abs(d));',
    '  col = mix(col, mix(srgb2lin(vec3(0.835,0.878,0.914)), uGold, uEdge), edge * 0.85);',
    '  float fog = clamp((vDepth - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 1.0);',
    '  col = mix(col, uNight, fog * 0.88);',
    '  gl_FragColor = vec4(col, mask * uOpacity);',
    '}'
  ].join('\n');

  const POST_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const POST_FRAG = [
    'precision highp float;',
    'uniform sampler2D uScene; uniform float uBloom; uniform float uDim;',
    'uniform vec3 uNight; uniform vec3 uBlue; uniform vec3 uGold;',
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
    '  float fall = smoothstep(0.60, 1.02, length(c));',
    '  col = mix(col, uNight, fall * 0.40 + uDim * 0.62);',
    '  gl_FragColor = vec4(lin2srgb(col), 1.0);',
    '}'
  ].join('\n');

  /* ---------- shared drawing helpers, exposed to film specs ---------- */
  function trackText(g, text, x, y, spacing) {
    let mx = x;
    for (const ch of text) { g.fillText(ch, mx, y); mx += g.measureText(ch).width + spacing; }
    return mx - x;
  }
  function paperBase(g, W, H) {
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    g.fillStyle = C.field; g.fillRect(0, 0, W, 10);
  }
  function newCanvas(W, H) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    return cv;
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  /* the design system's pale contained tile — the correct home for the ceramic
     icon masters, which are supplied on white */
  function iconTile(g, icon, x, y, s) {
    g.save();
    roundRect(g, x, y, s, s, 26);
    g.fillStyle = C.field; g.fill();
    g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
    g.clip();
    if (icon) g.drawImage(icon, x + 18, y + 18, s - 36, s - 36);
    g.restore();
  }
  function footRule(g, W, H, pad, text) {
    g.fillStyle = C.line; g.fillRect(pad, H - pad - 44, W - pad * 2, 2);
    g.fillStyle = C.muted;
    g.font = '800 30px Nunito, sans-serif';
    trackText(g, text, pad, H - pad, 2.6);
  }
  function drawDesk() {
    const cv = newCanvas(64, 64);
    const g = cv.getContext('2d');
    g.fillStyle = C.field; g.fillRect(0, 0, 64, 64);
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

  window.MomoPaper = {
    C, trackText, paperBase, newCanvas, roundRect, iconTile, footRule,
    ease: { HARD, OUT, IN, SMOOTH, LIN }, lerp, clamp01, REST
  };

  /* Film specs are separate script loads that need the helpers above. Whichever
     file lands last runs the installers, so load order cannot break the film. */
  if (window.MOMO_SPEC_QUEUE && window.MOMO_SPEC_QUEUE.length) {
    const q = window.MOMO_SPEC_QUEUE.splice(0);
    for (const install of q) {
      try { install(); } catch (e) { console.error('[momo-paper-stage] film spec failed to install', e); }
    }
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
      lp.type = 'lowpass'; lp.frequency.value = 300; lp.Q.value = 0.6;
      lp.connect(this.master);
      const pad = this.ctx.createGain(); pad.gain.value = 0.5; pad.connect(lp);
      [55, 82.5, 110].forEach((f, i) => {
        const o = this.ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const g = this.ctx.createGain(); g.gain.value = i === 0 ? 0.34 : 0.13;
        o.connect(g); g.connect(pad); o.start();
      });
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

  class MomoPaperStage extends HTMLElement {
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

    get spec() {
      return (window.MOMO_FILM_SPECS || {})[this.dataset.film] || null;
    }
    get duration() { return this._dur || 20; }
    get timingContract() {
      const s = this.spec || {};
      return {
        film: this.dataset.film, slug: s.slug,
        duration: this.duration, fps: FPS, frames: Math.round(this.duration * FPS) + 1,
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
        console.error('[momo-paper-stage]', err);
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
      /* the spec file and this file are independent script loads; wait for the
         spec rather than throwing on a load-order race */
      let spec = this.spec;
      if (!spec) {
        const until = Date.now() + 5000;
        while (!spec && Date.now() < until && !this._destroyed) {
          await new Promise(r => setTimeout(r, 60));
          spec = this.spec;
        }
      }
      if (!spec) throw new Error('no film spec for data-film="' + this.dataset.film + '"');
      this._dur = spec.duration;

      const THREE = await import(THREE_URL);
      this.THREE = THREE;
      if (this._destroyed) return;
      try {
        await document.fonts.load('900 128px Archivo');
        await document.fonts.load('400 42px Nunito');
        await document.fonts.load('800 30px Nunito');
      } catch (e) {}

      const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
      r.setClearColor(new THREE.Color(C.night), 1);
      r.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer = r;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(C.night);
      this.camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 140);
      this._tgt = new THREE.Vector3();

      this.rt = new THREE.WebGLRenderTarget(16, 9, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
      this.postScene = new THREE.Scene();
      this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.postMat = new THREE.ShaderMaterial({
        vertexShader: POST_VERT, fragmentShader: POST_FRAG,
        uniforms: {
          uScene: { value: this.rt.texture }, uBloom: { value: 0 }, uDim: { value: 0 },
          uNight: { value: new THREE.Color(C.night) },
          uBlue: { value: new THREE.Color(C.blue) },
          uGold: { value: new THREE.Color(C.gold) }
        }
      });
      this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMat));

      await this.build(spec);
      this.collectOverlays();

      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(this);
      this.syncViewport(true);

      this.ready = true;
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.dispatchEvent(new CustomEvent('momo-ready', { bubbles: true, detail: { reduced: this.reduced } }));

      if (this.reduced) this.seek(spec.poster);
      else { this.seek(0); this.play(); }
      this.loop();
    }

    canvasTex(cv, mip) {
      const THREE = this.THREE;
      const tx = new THREE.CanvasTexture(cv);
      tx.colorSpace = THREE.SRGBColorSpace;
      tx.minFilter = mip === false ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
      tx.magFilter = THREE.LinearFilter;
      tx.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      tx.generateMipmaps = mip !== false;
      return tx;
    }

    makeCard(key, tex, def) {
      const THREE = this.THREE;
      const geo = new THREE.PlaneGeometry(def.w, def.h, def.seg[0], def.seg[1]);
      const mat = new THREE.ShaderMaterial({
        vertexShader: CARD_VERT, fragmentShader: CARD_FRAG, transparent: true,
        side: THREE.DoubleSide, depthWrite: true,
        uniforms: {
          uMap: { value: tex }, uTime: { value: 0 }, uCurl: { value: 0 }, uWave: { value: 0 },
          uSize: { value: new THREE.Vector2(def.w, def.h) }, uOpacity: { value: 0 },
          uPhase: { value: Math.random() * 6.283 },
          uEdge: { value: def.edge || 0 },
          uRadius: { value: def.radius === undefined ? 0.045 : def.radius },
          uNight: { value: new THREE.Color(C.night) }, uNavy: { value: new THREE.Color(C.navy) },
          uBlue: { value: new THREE.Color(C.blue) }, uGold: { value: new THREE.Color(C.gold) },
          uFogNear: { value: 9.5 }, uFogFar: { value: 30.0 }
        }
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.order = 'YXZ';
      mesh.frustumCulled = false;
      mesh.visible = false;
      this.scene.add(mesh);
      const card = { key, mesh, mat, def, state: {} };
      this.cards[key] = card;
      return card;
    }

    async build(spec) {
      const THREE = this.THREE;
      const d = k => this.dataset[k] || '';
      this.cards = {};

      const deskTex = this.canvasTex(drawDesk());
      const desk = new THREE.Mesh(
        new THREE.PlaneGeometry(120, 120, 2, 2),
        new THREE.ShaderMaterial({
          vertexShader: CARD_VERT, fragmentShader: CARD_FRAG, transparent: true,
          side: THREE.DoubleSide, depthWrite: true,
          uniforms: {
            uMap: { value: deskTex }, uTime: { value: 0 }, uCurl: { value: 0 }, uWave: { value: 0 },
            uSize: { value: new THREE.Vector2(120, 120) }, uOpacity: { value: 1 },
            uPhase: { value: 0 }, uEdge: { value: 0 }, uRadius: { value: 0.2 },
            uNight: { value: new THREE.Color(C.night) }, uNavy: { value: new THREE.Color(C.navy) },
            uBlue: { value: new THREE.Color(C.blue) }, uGold: { value: new THREE.Color(C.gold) },
            uFogNear: { value: 11.0 }, uFogFar: { value: 34.0 }
          }
        })
      );
      desk.rotation.order = 'YXZ';
      desk.rotation.x = -Math.PI / 2;
      desk.frustumCulled = false;
      this.scene.add(desk);
      this.desk = desk;

      this._logo = await loadImage(d('logo'));

      /* the spec resolves its own artwork and returns the card definitions */
      const built = await spec.build({
        stage: this, THREE, data: d, loadImage,
        canvasTex: (cv, mip) => this.canvasTex(cv, mip)
      });
      this._defs = built.cards;
      for (const def of built.cards) this.makeCard(def.key, def.tex, def);
      this._altTex = built.altTex || {};

      /* ---- the one moving video surface ---- */
      const v = built.video;
      if (v) {
        const stillImg = await loadImage(v.still);
        let baseTex;
        if (stillImg) { baseTex = new THREE.Texture(stillImg); baseTex.needsUpdate = true; }
        else { baseTex = this.canvasTex(newCanvas(8, 8)); }
        baseTex.colorSpace = THREE.SRGBColorSpace;
        baseTex.minFilter = THREE.LinearMipmapLinearFilter;
        baseTex.magFilter = THREE.LinearFilter;
        baseTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        baseTex.generateMipmaps = true;

        const card = this.cards[v.card];
        if (card) card.mat.uniforms.uMap.value = baseTex;

        const el = document.createElement('video');
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
        this.vid = {
          el, tex: vtex, baseTex, url: v.src, cardKey: v.card, card,
          window: v.window, clipStart: v.clipStart,
          attached: false, armed: false, hasStill: !!stillImg, failed: false
        };
        /* A decode failure must resolve to the baked still, once, and never
           retry — an unhandled error state is what surfaces a native "unable to
           play media" overlay and leaves the card waiting on a frame that is
           never coming. */
        el.addEventListener('error', () => {
          const er = el.error;
          this.vid.failed = true;
          this.setMap(this.vid.card, this.vid.baseTex);
          console.warn('[momo-paper-stage] video decode failed; holding the baked still', er && er.code, er && er.message);
          this.dispatchEvent(new CustomEvent('momo-state', {
            bubbles: true,
            detail: { playing: this.playing, t: this.t, mediaFallback: true }
          }));
        });
      }
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
      return true;
    }
    resize() { if (this.syncViewport(true) && !this.playing) this.applyFrame(this.t, true); }

    play() {
      if (!this.ready || this.playing) return;
      if (this.t >= this.duration - 0.02) { this.t = 0; this.score.reset(); }
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
    posterFrame() { this.pause(); this.seek((this.spec || {}).poster || this.duration - 2); }
    seek(t) {
      this.t = Math.min(this.duration, Math.max(0, t));
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
        if (this.t >= this.duration) { this.t = this.duration; this.pause(); }
        this.applyFrame(this.t, false);
        this.emitTick(false);
      }
      this.draw();
    }

    applyFrame(t, hardSync) {
      if (!this.cards) return;
      const spec = this.spec;
      if (!spec) return;
      this.syncViewport(false);
      const P = this.portrait ? 1 : 0;
      const tracks = P ? (spec.tracksP || spec.tracks) : spec.tracks;

      for (const key in this.cards) {
        const c = this.cards[key];
        const track = tracks[key] || spec.tracks[key];
        if (!track) continue;
        const k = sample(track, t, c.state);
        const vis = k.o > 0.004;
        c.mesh.visible = vis;
        if (!vis) continue;
        /* a spec may swap a card's texture mid-flight — this is how a paper
           surface transforms into another artefact at the peak of its flip */
        if (spec.mapFor) {
          const tex = spec.mapFor(key, t, this, P);
          if (tex) this.setMap(c, tex);
        }
        c.mesh.position.set(k.x, k.y, k.z);
        c.mesh.rotation.set(-Math.PI / 2 + k.rx, k.ry, k.rz);
        if (spec.scaleFor) {
          const sc = spec.scaleFor(key, k, P);
          if (sc) c.mesh.scale.set(sc[0], sc[1], sc[2]);
          else c.mesh.scale.setScalar(k.s);
        } else {
          c.mesh.scale.setScalar(k.s);
        }
        c.mat.uniforms.uOpacity.value = k.o;
        c.mat.uniforms.uCurl.value = k.curl;
        c.mat.uniforms.uWave.value = k.wave;
        c.mat.uniforms.uTime.value = t;
      }
      this.desk.material.uniforms.uTime.value = t;

      const camPos = P ? (spec.camPosP || spec.camPos) : spec.camPos;
      const camTgt = P ? (spec.camTgtP || spec.camTgt) : spec.camTgt;
      const cp = sample(camPos, t, this._cp || (this._cp = {}));
      const ct = sample(camTgt, t, this._ct || (this._ct = {}));
      this.camera.position.set(cp.x, cp.y, cp.z);
      this._tgt.set(ct.x, ct.y, ct.z);
      this.camera.lookAt(this._tgt);

      this.postMat.uniforms.uBloom.value = sample(spec.bloom, t, this._bl || (this._bl = {})).s;
      this.postMat.uniforms.uDim.value = sample(spec.dim, t, this._dm || (this._dm = {})).s;

      this.syncVideo(t, hardSync);
      this.updateOverlays(t);
      if (spec.cueScore) spec.cueScore(t, this.score);
    }

    /* ---------- the single decoder ----------
       This film has exactly one video, so there is no second decoder to free.
       The source is therefore attached once and RETAINED — detaching by
       removing src and calling load() aborts the pending load and puts the
       element into an error/empty state, which is what raises a native media
       error in the host. Outside the window we simply pause. */
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
        setTimeout(fin, 3000);
        try { v.el.currentTime = target; } catch (e) { fin(); }
      }));
    }

    syncVideo(t, hard) {
      const v = this.vid;
      if (!v || !v.card) return;
      const [tin, tout, span] = v.window;
      const live = t >= tin - 0.4 && t <= tout;
      const local = clamp01((t - tin) / Math.max(0.001, tout - tin));
      const target = v.clipStart + local * span;
      const natural = span / (tout - tin);

      if (!live || v.failed) {
        this.releaseSrc();
        this.setMap(v.card, v.baseTex);
        return;
      }
      this.ensureSrc();
      /* attached is not the same as having a picture */
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

    beats(t) {
      const spec = this.spec;
      return spec && spec.beats ? spec.beats(t, { HARD, OUT, clamp01 }) : {};
    }

    updateOverlays(t) {
      if (!this.overlays) return;
      const want = (this.spec && this.spec.overlayCount) || 0;
      if (this._ovCount < want) {
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
      if (this.spec && this.spec.applyOverlays) this.spec.applyOverlays(B, set, t);
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
      this.t = Math.min(this.duration, Math.max(0, t));
      this.applyFrame(this.t, true);
      this.emitTick(true);
      this.emitState();
      for (let pass = 0; pass < 3; pass++) {
        await (this._q || Promise.resolve());
        this.applyFrame(this.t, true);
        if (!this.vid || !this.vid.seekPending) break;
      }
      await (this._q || Promise.resolve());
      if (this.vid) this.vid.tex.needsUpdate = true;
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
      const spec = this.spec;
      if (spec && spec.drawCapture) {
        spec.drawCapture(cx, {
          W, H, u: W / 1920, B: this.beats(this.t), logo: this._logo,
          C, trackText, roundRect, t: this.t
        });
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
        a.download = ((this.spec || {}).slug || 'momo-film') + '-' + (this.aspect === '9:16' ? '9x16' : '16x9') + '.webm';
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
        if (this.t >= this.duration - 0.05 || !this.playing) { rec.stop(); return; }
        this._capRaf = requestAnimationFrame(pump);
      };
      this._capRaf = requestAnimationFrame(pump);
    }
  }

  customElements.define(TAG, MomoPaperStage);
})();
