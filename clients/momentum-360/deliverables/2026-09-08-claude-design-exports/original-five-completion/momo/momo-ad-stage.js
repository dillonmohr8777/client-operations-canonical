/* Momentum AI launch ad — "Ask About" :: canvas 2D typographic stage
   20.00s. The Lucky Strike move: the category's noise stamps in and gets struck
   through until one line is left standing. Near-black ground, type that arrives
   once and holds, long silences. Deliberately not a mechanism film — no bending
   sheets, no desk, no tumbling paper, no gallery walk.

   Canvas 2D rather than WebGL on purpose: this film is type, so the drawn frame
   IS the captured frame and there is no shader between the two.

   Public API matches the other stages:
     play() pause() toggle() seek(t) replay() posterFrame()
     setAspect('16:9'|'9:16') setSound(bool) record() renderFrameAt(t)
     duration -> 20 ; timingContract
   Events: 'momo-ready', 'momo-tick', 'momo-state'
*/
(function () {
  const TAG = 'momo-ad-stage';
  if (customElements.get(TAG)) return;

  const DUR = 20;
  const FPS = 30;
  const POSTER = 12.0;          /* the hero line, held */

  const C = {
    night: '#03172e', navy: '#072d53', blue: '#1766ab', gold: '#efb928',
    paper: '#ffffff', ink: '#102d49', muted: '#52677c', pale: '#d5e4f1',
    line: '#d5e0e9'
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
  /* the one Momentum curve, hard in and hard out */
  const HARD = bezier(0.85, 0, 0.15, 1);
  const OUT = bezier(0.16, 1, 0.3, 1);
  const clamp01 = v => Math.min(1, Math.max(0, v));

  /* Ads 02–04 live in momo-ad-specs.js and need these helpers. Load order is not
     guaranteed between the two files, so whichever lands last runs the
     installers — the same pattern the paper stage uses for its film specs. */
  window.MomoAd = { C, HARD, OUT, clamp01 };
  if (window.MOMO_AD_QUEUE && window.MOMO_AD_QUEUE.length) {
    const q = window.MOMO_AD_QUEUE.splice(0);
    for (const install of q) {
      try { install(); } catch (e) { console.error('[momo-ad-stage] ad spec failed to install', e); }
    }
  }

  /* ---------- the score ----------
     Four competitor claims stamp in and are struck through, accumulating as a
     stack of nothing. Then black. Then the concession. Then the line. */
  const NOISE = [
    { text: 'AI-POWERED', in: 1.00, cut: 2.15 },
    { text: 'AI-DRIVEN', in: 1.95, cut: 3.10 },
    { text: 'AI-FIRST', in: 2.90, cut: 4.05 },
    { text: 'AI-ENABLED', in: 3.85, cut: 5.00 }
  ];
  const NOISE_CLEAR = 5.70;      /* the whole stack wipes */
  const NOISE_GONE = 6.40;

  const CONCEDE = [7.40, 9.30];  /* "Everyone has access to AI." */
  const HERO = [9.90, 14.30];    /* the line that stands */
  const MOMO = [14.60, 16.50];   /* once, late, as relief */
  const END = [16.80, DUR];      /* logo + launch stamp */

  const HERO_TEXT = ['Give your competition', 'something to ask', 'AI about'];
  const HERO_TALL = ['Give your', 'competition', 'something to', 'ask AI about'];

  /* Momo's clip window against the 8.05s Reveal master */
  const VID_WINDOW = [MOMO[0] - 0.30, MOMO[1], 2.10];
  const VID_START = 3.40;

  function loadImage(src) {
    return new Promise(res => {
      if (!src) return res(null);
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = src;
    });
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
      lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 0.6;
      lp.connect(this.master);
      const pad = this.ctx.createGain(); pad.gain.value = 0.5; pad.connect(lp);
      [55, 82.5].forEach((f, i) => {
        const o = this.ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const g = this.ctx.createGain(); g.gain.value = i === 0 ? 0.32 : 0.11;
        o.connect(g); g.connect(pad); o.start();
      });
      /* one short decaying noise buffer: the strike */
      const n = Math.floor(this.ctx.sampleRate * 0.14);
      this.noise = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4.0);
      return this.ctx;
    }
    setOn(v) {
      this.on = v;
      const ctx = this.ensure();
      if (!ctx) return;
      if (v && ctx.state === 'suspended') ctx.resume();
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(v ? 0.14 : 0, ctx.currentTime + 0.4);
    }
    strike(id) {
      if (!this.on || !this.ctx || this.fired[id]) return;
      this.fired[id] = true;
      const t = this.ctx.currentTime;
      const s = this.ctx.createBufferSource(); s.buffer = this.noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2100; bp.Q.value = 1.1;
      const g = this.ctx.createGain(); g.gain.value = 0.07;
      s.connect(bp); bp.connect(g); g.connect(this.master); s.start(t);
    }
    tone(id, freq) {
      if (!this.on || !this.ctx || this.fired[id]) return;
      this.fired[id] = true;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.085, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 2.3);
    }
    reset() { this.fired = {}; }
  }

  class MomoAdStage extends HTMLElement {
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

    /* An ad named via data-ad renders from window.MOMO_AD_SPECS; with no
       data-ad this stage renders its own built-in film, "Ask About". */
    get spec() {
      const name = this.dataset.ad;
      if (!name) return null;
      return (window.MOMO_AD_SPECS || {})[name] || null;
    }
    get poster() { const s = this.spec; return s ? s.poster : POSTER; }
    get slug() { const s = this.spec; return s ? s.slug : 'momentum-ai-ask-about'; }
    get vidWindow() { const s = this.spec; return s && s.video ? s.video.window : VID_WINDOW; }
    get vidStart() { const s = this.spec; return s && s.video ? s.video.clipStart : VID_START; }

    get duration() { return DUR; }
    get timingContract() {
      const s = this.spec;
      return {
        film: s ? s.slug : 'momentum-ai-launch-ask-about',
        slug: this.slug,
        title: s ? s.title : 'Ask about',
        duration: DUR, fps: FPS, frames: DUR * FPS + 1, poster: this.poster,
        motion: s ? s.motion : 'subtractive — the category’s claims stamp in and are struck through until one line is left standing',
        renderer: 'canvas 2D — the drawn frame is the captured frame, no shader between',
        deterministic: 'every beat opacity, extent, type position and dim value is a pure function of t',
        frameApi: 'await stage.renderFrameAt(t) seeks the one decoder under a bounded wait, then draws',
        masters: ['16:9', '9:16 (authored measure and beats, not a crop)'],
        decoders: 1,
        nondeterministic: 'HTML video decode only; the Momo beat draws its baked still until the decoder delivers a frame'
      };
    }

    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      this.style.cssText = 'display:block;position:relative;width:100%;aspect-ratio:16/9;background:' + C.night + ';border-radius:14px;overflow:hidden';
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = 'display:block;width:100%;height:100%';
      this.appendChild(this.canvas);
      this.cx = this.canvas.getContext('2d');
      this.boot().catch(err => {
        console.error('[momo-ad-stage]', err);
        this.dispatchEvent(new CustomEvent('momo-state', { bubbles: true, detail: { error: String(err) } }));
      });
    }

    disconnectedCallback() {
      this._destroyed = true;
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      if (this.vid) { try { this.vid.el.pause(); } catch (e) {} }
    }

    async boot() {
      const d = k => this.dataset[k] || '';
      /* an ad spec is a separate script load; wait for it rather than racing */
      if (this.dataset.ad && !this.spec) {
        const until = Date.now() + 5000;
        while (!this.spec && Date.now() < until && !this._destroyed) {
          await new Promise(r => setTimeout(r, 60));
        }
        if (!this.spec) throw new Error('no ad spec for data-ad="' + this.dataset.ad + '"');
      }
      try {
        await document.fonts.load('900 120px Archivo');
        await document.fonts.load('800 26px Nunito');
        await document.fonts.load('400 40px Nunito');
      } catch (e) {}

      this.logo = await loadImage(d('logo'));
      this.still = await loadImage(d('stillMomo'));

      /* ---- the one live decoder ---- */
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
      this.vid = { el, url: d('srcMomo'), attached: false, armed: false, failed: false, seekPending: false };
      el.addEventListener('error', () => {
        const er = el.error;
        this.vid.failed = true;
        console.warn('[momo-ad-stage] video decode failed; drawing the baked still', er && er.code, er && er.message);
        this.dispatchEvent(new CustomEvent('momo-state', {
          bubbles: true, detail: { playing: this.playing, t: this.t, mediaFallback: 'reveal' }
        }));
      });

      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(this);
      this.syncViewport(true);

      this.ready = true;
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.dispatchEvent(new CustomEvent('momo-ready', { bubbles: true, detail: { reduced: this.reduced } }));

      if (this.reduced) this.seek(this.poster);
      else { this.seek(0); this.play(); }
      this.loop();
    }

    syncViewport(force) {
      const w = this.clientWidth || 960;
      const h = this.clientHeight || Math.round(w * 9 / 16);
      if (!force && w === this._vw && h === this._vh) return false;
      this._vw = w; this._vh = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.portrait = (w / h) < 1;
      const root = this.closest('[data-momo-root]') || this;
      root.style.setProperty('--momo-fw', w + 'px');
      return true;
    }
    resize() { if (this.syncViewport(true)) this.draw(); }

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
    posterFrame() { this.pause(); this.seek(this.poster); }
    seek(t) {
      this.t = Math.min(DUR, Math.max(0, t));
      this._wall = performance.now();
      this.syncVideo(this.t, true);
      this.draw();
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
      if (this.playing) {
        const now = performance.now();
        const dt = Math.min(0.1, (now - this._wall) / 1000);
        this._wall = now;
        this.t += dt;
        if (this.t >= DUR) { this.t = DUR; this.pause(); }
        this.syncVideo(this.t, false);
        this.cueScore(this.t);
        this.emitTick(false);
      }
      this.syncViewport(false);
      this.draw();
    }

    /* ---------- the single decoder ----------
       Attached once and retained: stripping src and calling load() aborts the
       pending load and leaves the element in an error state, which is what
       raises a native media error. Outside the window it is simply paused. */
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
        const fin = () => { v.el.removeEventListener('seeked', fin); v.seekPending = false; res(); };
        if (v.el.readyState < 1) { fin(); return; }
        v.el.addEventListener('seeked', fin);
        setTimeout(fin, 2500);
        try { v.el.currentTime = target; } catch (e) { fin(); }
      }));
    }

    syncVideo(t, hard) {
      const v = this.vid;
      if (!v) return;
      const win = this.vidWindow;
      const tin = win[0], tout = win[1], span = win[2];
      const live = t >= tin - 0.5 && t <= tout;
      const local = clamp01((t - tin) / Math.max(0.001, tout - tin));
      const target = this.vidStart + local * span;
      const natural = span / (tout - tin);

      if (!live || v.failed) { this.releaseSrc(); return; }
      this.ensureSrc();

      if (hard || !this.playing) {
        if (!v.el.paused) v.el.pause();
        v.armed = false;
        if (v.el.readyState >= 1 && Math.abs(v.el.currentTime - target) > 0.04) this.enqueueSeek(target);
      } else if (!v.armed) {
        if (!v.el.paused) v.el.pause();
        if (Math.abs(v.el.currentTime - target) > 0.12) this.enqueueSeek(target);
        else if (!v.seekPending && v.el.readyState >= 2) {
          v.armed = true;
          v.el.playbackRate = natural;
          const p = v.el.play(); if (p && p.catch) p.catch(() => {});
        }
      } else {
        if (v.el.paused) { const p = v.el.play(); if (p && p.catch) p.catch(() => {}); }
        /* drift trimmed by rate, never by seeking a playing 1080p element */
        const drift = target - v.el.currentTime;
        let rate = natural * (1 + Math.min(0.3, Math.max(-0.3, drift * 0.6)));
        rate = Math.min(2, Math.max(0.25, rate));
        if (Math.abs(v.el.playbackRate - rate) > 0.01) v.el.playbackRate = rate;
        if (!v.el.seeking && Math.abs(drift) > 1.6) this.enqueueSeek(target);
      }
    }

    cueScore(t) {
      if (!this.score.on) return;
      const s = this.spec;
      if (s) { if (s.cueScore) s.cueScore(t, this.score); return; }
      NOISE.forEach((n, i) => { if (t > n.cut) this.score.strike('s' + i); });
      if (t > CONCEDE[0]) this.score.tone('concede', 174.6);
      if (t > HERO[0]) this.score.tone('hero', 220);
      if (t > END[0]) this.score.tone('end', 293.7);
    }

    /* ---------- beats: one source of truth for the drawn frame ---------- */
    beats(t) {
      const s = this.spec;
      if (s) return s.beats(t);
      const band = (a, b, c, d) => {
        if (t < a || t > d) return 0;
        if (t < b) return OUT(clamp01((t - a) / (b - a)));
        if (t > c) return 1 - HARD(clamp01((t - c) / (d - c)));
        return 1;
      };
      const noise = NOISE.map(n => ({
        text: n.text,
        /* stamps in hard, then holds; the whole stack wipes together */
        on: t < n.in ? 0 : (t > NOISE_CLEAR ? 1 - HARD(clamp01((t - NOISE_CLEAR) / (NOISE_GONE - NOISE_CLEAR))) : 1),
        /* the strike draws left to right on the Momentum curve */
        cut: HARD(clamp01((t - n.cut) / 0.34))
      }));
      return {
        noise,
        concede: band(CONCEDE[0], CONCEDE[0] + 0.75, CONCEDE[1] - 0.15, CONCEDE[1] + 0.55),
        hero: band(HERO[0], HERO[0] + 0.85, HERO[1] - 0.35, HERO[1] + 0.50),
        heroReveal: HARD(clamp01((t - HERO[0]) / 0.85)),
        momo: band(MOMO[0], MOMO[0] + 0.60, MOMO[1] - 0.35, MOMO[1] + 0.40),
        end: band(END[0], END[0] + 0.85, DUR, DUR + 0.1),
        endLift: 1 - OUT(clamp01((t - END[0]) / 1.40))
      };
    }

    /* ---------- draw ---------- */
    wrapMeasure(cx, words, maxW) {
      const lines = [];
      let line = '';
      for (const w of words.split(' ')) {
        const probe = line ? line + ' ' + w : w;
        if (cx.measureText(probe).width > maxW && line) { lines.push(line); line = w; }
        else line = probe;
      }
      if (line) lines.push(line);
      return lines;
    }

    tracked(cx, text, x, y, sp) {
      let mx = x;
      for (const ch of text) { cx.fillText(ch, mx, y); mx += cx.measureText(ch).width + sp; }
      return mx - x;
    }
    trackedWidth(cx, text, sp) {
      let w = 0;
      for (const ch of text) w += cx.measureText(ch).width + sp;
      return w - sp;
    }

    draw() {
      const cx = this.cx;
      if (!cx) return;
      const W = this.canvas.width, H = this.canvas.height;
      if (!W || !H) return;
      const P = !!this.portrait;
      /* one scale unit: 1920-wide master in landscape, 1080-wide in portrait */
      const u = P ? W / 1080 : W / 1920;
      const B = this.beats(this.t);

      cx.save();
      cx.fillStyle = C.night;
      cx.fillRect(0, 0, W, H);

      const pad = W * (P ? 0.085 : 0.075);

      /* an ad spec owns its own frame; the built-in film falls through below */
      const spec = this.spec;
      if (spec) {
        const momoSrc = (this.vid && !this.vid.failed && this.vid.el.readyState >= 2) ? this.vid.el : this.still;
        spec.draw(cx, { W, H, u, P, B, pad, logo: this.logo, momoSrc, t: this.t });
        cx.restore();
        return;
      }

      /* --- the noise stack, struck through --- */
      const anyNoise = B.noise.some(n => n.on > 0.004);
      if (anyNoise) {
        const size = (P ? 76 : 104) * u;
        const gap = size * 1.42;
        const top = H / 2 - (gap * (B.noise.length - 1)) / 2;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        cx.textAlign = 'left';
        cx.textBaseline = 'alphabetic';
        for (let i = 0; i < B.noise.length; i++) {
          const n = B.noise[i];
          if (n.on <= 0.004) continue;
          const y = top + gap * i;
          const w = cx.measureText(n.text).width;
          /* the claim itself: muted, unimportant */
          cx.globalAlpha = n.on;
          cx.fillStyle = C.muted;
          cx.fillText(n.text, pad, y);
          /* the strike: action blue line art, drawn left to right */
          if (n.cut > 0.001) {
            cx.globalAlpha = n.on;
            cx.strokeStyle = C.blue;
            cx.lineWidth = Math.max(2, 7 * u);
            cx.lineCap = 'butt';
            cx.beginPath();
            cx.moveTo(pad, y - size * 0.30);
            cx.lineTo(pad + w * n.cut, y - size * 0.30);
            cx.stroke();
          }
          cx.globalAlpha = 1;
        }
      }

      /* --- the concession: quiet, small, warm --- */
      if (B.concede > 0.004) {
        cx.globalAlpha = B.concede;
        const size = (P ? 40 : 52) * u;
        cx.font = '400 ' + size.toFixed(1) + 'px Nunito, sans-serif';
        cx.fillStyle = C.pale;
        cx.textAlign = 'left';
        cx.fillText('Everyone has access to AI.', pad, H / 2);
        cx.globalAlpha = 1;
      }

      /* --- the line that stands --- */
      if (B.hero > 0.004) {
        /* 124 not 132: at 132 the widest line left only 2% slack inside the
           measure, which font-load variance can eat */
        const size = (P ? 92 : 124) * u;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        const lines = P ? HERO_TALL : HERO_TEXT;
        const lead = size * 1.07;
        const blockH = lead * lines.length;
        let y = H / 2 - blockH / 2 + size * 0.82;
        cx.save();
        /* the 0.8s clip-path arrival, the system's identity moment */
        cx.beginPath();
        cx.rect(0, 0, W * B.heroReveal, H);
        cx.clip();
        cx.globalAlpha = B.hero;
        cx.textAlign = 'left';
        for (let i = 0; i < lines.length; i++) {
          cx.fillStyle = C.paper;
          cx.fillText(lines[i], pad, y);
          if (i === lines.length - 1) {
            const w = cx.measureText(lines[i]).width;
            cx.fillStyle = C.gold;
            cx.fillText('.', pad + w, y);
          }
          y += lead;
        }
        cx.restore();
        cx.globalAlpha = 1;
      }

      /* --- Momo, once, late, as relief --- */
      if (B.momo > 0.004) {
        const src = (this.vid && !this.vid.failed && this.vid.el.readyState >= 2) ? this.vid.el : this.still;
        if (src) {
          const sw = src.videoWidth || src.naturalWidth || 16;
          const sh = src.videoHeight || src.naturalHeight || 9;
          /* contained on midnight, so the full ceramic form and the chest
             emblem survive — never cropped to fill */
          const boxW = W * (P ? 0.84 : 0.52), boxH = H * (P ? 0.42 : 0.62);
          const sc = Math.min(boxW / sw, boxH / sh);
          const dw = sw * sc, dh = sh * sc;
          cx.globalAlpha = B.momo;
          cx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
          cx.globalAlpha = 1;
        }
      }

      /* --- the end mark: exact logo, launch stamp --- */
      if (B.end > 0.004) {
        cx.globalAlpha = B.end * 0.94;
        cx.fillStyle = C.night;
        cx.fillRect(0, 0, W, H);
        cx.globalAlpha = B.end;
        cx.save();
        cx.translate(0, 22 * u * B.endLift);

        let cy = H * (P ? 0.40 : 0.42);
        if (this.logo) {
          const lw = Math.min(W * (P ? 0.50 : 0.20), 340 * u);
          const lh = lw * (this.logo.naturalHeight / this.logo.naturalWidth);
          const bw = lw + 52 * u, bh = lh + 36 * u;
          const bx = (W - bw) / 2, by = cy - bh;
          const r = 14 * u;
          cx.beginPath();
          cx.moveTo(bx + r, by); cx.arcTo(bx + bw, by, bx + bw, by + bh, r);
          cx.arcTo(bx + bw, by + bh, bx, by + bh, r); cx.arcTo(bx, by + bh, bx, by, r);
          cx.arcTo(bx, by, bx + bw, by, r); cx.closePath();
          cx.fillStyle = C.paper; cx.fill();
          cx.drawImage(this.logo, bx + 26 * u, by + 18 * u, lw, lh);
        }

        const size = (P ? 62 : 76) * u;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        cx.textAlign = 'center';
        const stamp = P ? ['Someday just lost', 'its excuse'] : ['Someday just lost its excuse'];
        let sy = cy + size * 1.5;
        for (let i = 0; i < stamp.length; i++) {
          cx.fillStyle = C.paper;
          cx.fillText(stamp[i], W / 2, sy);
          if (i === stamp.length - 1) {
            const w = cx.measureText(stamp[i]).width;
            cx.fillStyle = C.gold;
            cx.fillText('.', W / 2 + w / 2, sy);
          }
          sy += size * 1.07;
        }

        /* the one uppercase register in the system */
        const ms = 26 * u;
        cx.font = '800 ' + ms.toFixed(1) + 'px Nunito, sans-serif';
        cx.fillStyle = C.pale;
        cx.textAlign = 'left';
        const label = 'MOMENTUM AI · NOW OPEN';
        const lwid = this.trackedWidth(cx, label, 2.6 * u);
        this.tracked(cx, label, (W - lwid) / 2, sy + ms * 1.9, 2.6 * u);
        cx.restore();
        cx.globalAlpha = 1;
      }

      cx.restore();
    }

    /* Bounded: a hard ceiling so a stalled decoder cannot hang an export run. */
    async renderFrameAt(t) {
      this.playing = false;
      this.t = Math.min(DUR, Math.max(0, t));
      this.syncViewport(false);
      this.syncVideo(this.t, true);
      const deadline = Date.now() + 2500;
      for (let pass = 0; pass < 3; pass++) {
        await Promise.race([
          (this._q || Promise.resolve()),
          new Promise(r => setTimeout(r, Math.max(0, deadline - Date.now())))
        ]);
        this.syncVideo(this.t, true);
        if (!this.vid || !this.vid.seekPending || Date.now() > deadline) break;
      }
      this.draw();
      this.emitTick(true);
      this.emitState();
      return true;
    }

    /* The drawn frame IS the captured frame — no separate compositing path that
       could drift from what is on screen. */
    record(onDone) {
      if (this._rec) return;
      const stream = this.canvas.captureStream(FPS);
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
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.slug + '-' + (this.aspect === '9:16' ? '9x16' : '16x9') + '.webm';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        onDone && onDone({ bytes: blob.size, mime });
      };
      this._rec = rec;
      this.score.reset();
      this.seek(0);
      this.play();
      rec.start(250);
      const stop = () => {
        if (this.t >= DUR - 0.05 || !this.playing) { rec.stop(); return; }
        requestAnimationFrame(stop);
      };
      requestAnimationFrame(stop);
    }
  }

  customElements.define(TAG, MomoAdStage);
})();
