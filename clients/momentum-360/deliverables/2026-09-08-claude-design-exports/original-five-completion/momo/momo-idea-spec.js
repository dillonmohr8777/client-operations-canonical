/* One Idea, Everywhere — film spec for <momo-paper-stage data-film="idea">
   20.00s. One paper idea tumbles into a website, a social post, an email and an
   ad around Momo, joined by a visible thread, settling into one coherent set.

   The transformation is real motion, not a cross-fade: each artefact starts as a
   copy of the idea card at the idea's own position, tumbles a full turn on the
   desk (rx 0 -> 2π), and its texture is swapped at the halfway point of that
   tumble — so the paper is genuinely seen to become the new thing. */
(function () {
  /* Load-order independent. This file needs the helpers that momo-paper-stage.js
     publishes as window.MomoPaper, but the two are separate script loads and the
     engine may arrive second (it is fetched lazily by its import). Rather than
     destructuring a global that may not exist yet — which throws, leaves no spec
     registered, and hangs the stage at "booted but never ready" — register the
     installer and let whichever file lands last run it. */
  function install() {
    /* Idempotent, like the engine's customElements guard: a second evaluation of
       this file must not replace a spec whose textures have already been built. */
    if (window.MOMO_FILM_SPECS && window.MOMO_FILM_SPECS.idea) return;
    const M = window.MomoPaper;
    const { C, trackText, paperBase, newCanvas, roundRect, iconTile, footRule, lerp, clamp01, REST } = M;
    const { HARD, OUT, IN, SMOOTH, LIN } = M.ease;

  const DUR = 20;
  const CARD = { w: 3.30, h: 2.20, seg: [40, 56] };

  /* ---------- surfaces ---------- */
  function meta(g, text, pad) {
    g.fillStyle = C.muted;
    g.font = '800 34px Nunito, sans-serif';
    trackText(g, text, pad, pad + 36, 2.8);
  }
  function head(g, text, pad, y, size) {
    g.font = '900 ' + size + 'px Archivo, sans-serif';
    g.fillStyle = C.navy;
    g.fillText(text, pad, y);
    return g.measureText(text).width;
  }
  function period(g, x, y, size) {
    g.font = '900 ' + size + 'px Archivo, sans-serif';
    g.fillStyle = C.gold;
    g.fillText('.', x, y);
  }
  function rows(g, pad, y, W, n, gap) {
    g.fillStyle = C.line;
    for (let i = 0; i < n; i++) g.fillRect(pad, y + i * gap, W - pad * 2 - (i === n - 1 ? 260 : 0), 2);
  }

  function drawIdea() {
    const W = 1536, H = 1024, pad = 104;
    const cv = newCanvas(W, H); const g = cv.getContext('2d');
    paperBase(g, W, H);
    meta(g, 'THE IDEA · ILLUSTRATIVE', pad);
    let w = head(g, 'Make it easy', pad, pad + 214, 132);
    w = head(g, 'to say yes', pad, pad + 214 + 142, 132);
    period(g, pad + w, pad + 214 + 142, 132);
    g.fillStyle = C.line; g.fillRect(pad, pad + 420, W - pad * 2, 2);
    g.fillStyle = C.ink;
    g.font = '400 58px Nunito, sans-serif';
    g.fillText('One thought, written once.', pad, pad + 520);
    footRule(g, W, H, pad, 'MOMENTUM DIGITAL · AI DIVISION');
    return cv;
  }

  function drawSite(icon) {
    const W = 1536, H = 1024, pad = 96;
    const cv = newCanvas(W, H); const g = cv.getContext('2d');
    paperBase(g, W, H);
    /* a browser strip, drawn — no chrome screenshot, no invented brand */
    g.fillStyle = C.field; g.fillRect(0, 0, W, 132);
    g.fillStyle = C.line; g.fillRect(0, 132, W, 2);
    g.fillStyle = C.navy;
    g.font = '900 40px Nunito, sans-serif';
    g.fillText('Momentum', pad, 86);
    g.fillStyle = C.line;
    [0, 1, 2].forEach(i => g.fillRect(W - pad - 420 + i * 150, 74, 96, 4));
    /* meta sits clear of the nav strip, not on its edge */
    g.fillStyle = C.muted;
    g.font = '800 34px Nunito, sans-serif';
    trackText(g, 'WEBSITE · ILLUSTRATIVE', pad, 232, 2.8);
    const w = head(g, 'Book the job', pad, 470, 122);
    period(g, pad + w, 470, 122);
    rows(g, pad, 540, W, 3, 46);
    iconTile(g, icon, W - pad - 300, H - pad - 300, 300);
    g.fillStyle = C.gold;
    roundRect(g, pad, H - pad - 132, 400, 96, 8); g.fill();
    g.fillStyle = C.night;
    g.font = '900 40px Nunito, sans-serif';
    g.fillText('Get a quote', pad + 62, H - pad - 70);
    return cv;
  }

  function drawSocial(icon) {
    const W = 1536, H = 1024, pad = 96;
    const cv = newCanvas(W, H); const g = cv.getContext('2d');
    paperBase(g, W, H);
    meta(g, 'SOCIAL POST · ILLUSTRATIVE', pad);
    iconTile(g, icon, pad, 200, 380);
    const w = head(g, 'Same idea', pad + 440, 330, 116);
    period(g, pad + 440 + w, 330, 116);
    head(g, 'Shorter', pad + 440, 330 + 130, 116);
    g.fillStyle = C.ink;
    g.font = '400 50px Nunito, sans-serif';
    g.fillText('Say it in one line and stop.', pad, 700);
    g.fillStyle = C.line; g.fillRect(pad, 760, W - pad * 2, 2);
    footRule(g, W, H, pad, 'ILLUSTRATIVE POST · NO METRICS SHOWN');
    return cv;
  }

  function drawEmail(icon) {
    const W = 1536, H = 1024, pad = 96;
    const cv = newCanvas(W, H); const g = cv.getContext('2d');
    paperBase(g, W, H);
    meta(g, 'EMAIL · ILLUSTRATIVE', pad);
    g.fillStyle = C.muted;
    g.font = '800 34px Nunito, sans-serif';
    g.fillText('Subject', pad, 250);
    g.fillStyle = C.line; g.fillRect(pad, 282, W - pad * 2, 2);
    const w = head(g, 'The same idea', pad, 400, 104);
    head(g, 'in your inbox', pad, 400 + 116, 104);
    period(g, pad + g.measureText('in your inbox').width, 400 + 116, 104);
    rows(g, pad, 590, W, 4, 44);
    iconTile(g, icon, W - pad - 260, H - pad - 260, 260);
    footRule(g, W, H, pad, 'ILLUSTRATIVE TEMPLATE · NOT SENT');
    return cv;
  }

  function drawAd(icon) {
    const W = 1536, H = 1024, pad = 96;
    const cv = newCanvas(W, H); const g = cv.getContext('2d');
    paperBase(g, W, H);
    meta(g, 'PAID AD · ILLUSTRATIVE', pad);
    let w = head(g, 'Found.', pad, pad + 250, 150);
    w = head(g, 'Chosen.', pad, pad + 250 + 162, 150);
    w = head(g, 'Booked', pad, pad + 250 + 324, 150);
    period(g, pad + w, pad + 250 + 324, 150);
    iconTile(g, icon, W - pad - 300, 220, 300);
    g.fillStyle = C.gold;
    roundRect(g, W - pad - 380, H - pad - 136, 380, 96, 8); g.fill();
    g.fillStyle = C.night;
    g.font = '900 40px Nunito, sans-serif';
    g.fillText('Learn more', W - pad - 318, H - pad - 74);
    footRule(g, W, H, pad, 'ILLUSTRATIVE CREATIVE · NO CLAIMS');
    return cv;
  }

  /* the visible thread: one node, four branches to the orbit slots */
  function drawThread(tall) {
    const W = tall ? 1000 : 1500, H = tall ? 1500 : 1200;
    const cv = newCanvas(W, H); const g = cv.getContext('2d');
    g.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const pts = tall
      ? [[cx - 300, cy + 120], [cx + 300, cy + 120], [cx - 300, cy + 560], [cx + 300, cy + 560]]
      : [[300, 300], [W - 300, 300], [300, H - 300], [W - 300, H - 300]];
    g.strokeStyle = C.blue; g.lineWidth = 5; g.lineCap = 'round';
    for (const [px, py] of pts) {
      g.beginPath();
      g.moveTo(cx, cy);
      g.quadraticCurveTo((px + cx) / 2 + (px < cx ? -60 : 60), (py + cy) / 2, px, py);
      g.stroke();
      g.fillStyle = C.blue;
      g.beginPath(); g.arc(px, py, 12, 0, 6.2832); g.fill();
    }
    g.fillStyle = C.gold;
    g.beginPath(); g.arc(cx, cy, 30, 0, 6.2832); g.fill();
    g.fillStyle = C.paper;
    g.beginPath(); g.arc(cx, cy, 12, 0, 6.2832); g.fill();
    return cv;
  }

  /* ---------- choreography ---------- */
  const KEYS = ['site', 'social', 'email', 'ad'];
  const IN_T = [5.40, 7.30, 9.20, 11.10];
  /* The tumble passes edge-on at rx = π/2 and again at 3π/2; between those the
     card's BACK faces camera, so anything drawn there reads mirrored. The idea
     texture is swapped for the artefact at the first edge-on moment (the honest
     instant of transformation) using a Y-mirrored clone, then for the upright
     clone at the second — so the new artwork is never seen reversed. */
  const SWAP_A = IN_T.map(t => t + 0.26);
  const SWAP_B = IN_T.map(t => t + 0.88);
  const TAU = Math.PI * 2;

  /* landscape: the idea parks upper-left, Momo upper-right, and each artefact
     peels off the parked idea, grows as it tumbles forward, and lands front and
     centre big enough to read */
  const L_IDEA = [-1.85, -0.35];
  const L_IDEA_S = 0.55;
  const L_READ = [0, 1.55];
  const L_SLOT = [[-2.34, -1.58], [2.34, -1.58], [-2.34, 2.18], [2.34, 2.18]];
  /* portrait: the same idea, stacked — read card nearly fills the narrow frame */
  const P_IDEA = [-0.60, -1.15];
  const P_IDEA_S = 0.36;
  const P_READ = [0, 0.85];
  const P_SLOT = [[-1.06, -1.55], [1.06, -1.55], [-1.06, 2.15], [1.06, 2.15]];

  function derive(i, start, startS, read, readS, slot, slotS) {
    const t0 = IN_T[i];
    const spin = (i % 2 ? 1 : -1) * 0.05;
    return [
      { t: 0, x: start[0], y: REST, z: start[1], rx: 0, ry: 0, rz: 0, s: startS, o: 0, curl: 0.04, wave: 0.04 },
      /* held invisible until its own beat — it is stacked on the idea card */
      { t: t0 - 0.02, x: start[0], y: REST, z: start[1], rx: 0, ry: 0, rz: 0, s: startS, o: 0, curl: 0.04, wave: 0.04, ease: LIN },
      { t: t0, x: start[0], y: REST, z: start[1], rx: 0, ry: 0, rz: 0, s: startS, o: 1, curl: 0.05, wave: 0.05, ease: LIN },
      /* peel and tumble, growing as it comes forward */
      { t: t0 + 0.30, x: lerp(start[0], read[0], 0.30), y: 0.72, z: lerp(start[1], read[1], 0.30), rx: TAU * 0.30, ry: spin * 3, rz: 0.05, s: lerp(startS, readS, 0.34), o: 1, curl: 0.62, wave: 0.42, ease: IN },
      { t: t0 + 0.55, x: lerp(start[0], read[0], 0.52), y: 0.94, z: lerp(start[1], read[1], 0.52), rx: Math.PI, ry: spin * 4, rz: 0.06, s: lerp(startS, readS, 0.58), o: 1, curl: 0.74, wave: 0.46, ease: LIN },
      { t: t0 + 0.86, x: lerp(start[0], read[0], 0.78), y: 0.74, z: lerp(start[1], read[1], 0.78), rx: TAU * 0.74, ry: spin * 2, rz: 0.04, s: lerp(startS, readS, 0.84), o: 1, curl: 0.52, wave: 0.36, ease: LIN },
      /* land and hold still to be read */
      { t: t0 + 1.24, x: read[0], y: REST, z: read[1], rx: TAU, ry: spin * 0.6, rz: 0, s: readS, o: 1, curl: 0.09, wave: 0.09, ease: OUT },
      { t: t0 + 1.82, x: read[0], y: REST, z: read[1], rx: TAU, ry: spin * 0.6, rz: 0, s: readS, o: 1, curl: 0.06, wave: 0.06, ease: LIN },
      /* out to its place in the set */
      { t: t0 + 2.46, x: slot[0], y: REST, z: slot[1], rx: TAU, ry: spin, rz: 0, s: slotS, o: 1, curl: 0.16, wave: 0.14, ease: HARD },
      { t: 14.20, x: slot[0], y: REST, z: slot[1], rx: TAU, ry: spin, rz: 0, s: slotS, o: 1, curl: 0.05, wave: 0.05, ease: OUT },
      { t: 15.60, x: slot[0], y: REST, z: slot[1], rx: TAU, ry: spin * 0.5, rz: 0, s: slotS, o: 1, curl: 0.04, wave: 0.04, ease: OUT },
      { t: DUR, x: slot[0], y: REST, z: slot[1], rx: TAU, ry: spin * 0.5, rz: 0, s: slotS, o: 1, curl: 0.03, wave: 0.03, ease: LIN }
    ];
  }

  const tracks = {
    idea: [
      { t: 0.00, x: 2.10, y: 3.50, z: -2.30, rx: 0.60, ry: -0.84, rz: 0.16, s: 1, o: 0, curl: 0.95, wave: 0.85 },
      { t: 0.16, x: 1.90, y: 3.00, z: -1.95, rx: 0.52, ry: -0.76, rz: 0.14, s: 1, o: 1, curl: 0.92, wave: 0.85, ease: LIN },
      { t: 1.00, x: 0.58, y: 0.88, z: -0.44, rx: 0.15, ry: -0.24, rz: 0.05, s: 1, o: 1, curl: 0.52, wave: 0.50, ease: IN },
      { t: 1.58, x: 0.02, y: REST, z: -0.08, rx: 0, ry: -0.03, rz: 0, s: 1, o: 1, curl: 0.10, wave: 0.10, ease: OUT },
      { t: 2.00, x: 0.00, y: REST, z: -0.10, rx: 0, ry: -0.03, rz: 0, s: 1, o: 1, curl: 0.05, wave: 0.05, ease: OUT },
      { t: 3.30, x: -1.34, y: REST, z: -0.16, rx: 0, ry: 0.05, rz: 0, s: 0.94, o: 1, curl: 0.06, wave: 0.06, ease: HARD },
      { t: 5.20, x: L_IDEA[0], y: REST, z: L_IDEA[1], rx: 0, ry: 0.04, rz: 0, s: L_IDEA_S, o: 1, curl: 0.05, wave: 0.05, ease: HARD },
      { t: 13.20, x: L_IDEA[0], y: REST, z: L_IDEA[1], rx: 0, ry: 0.04, rz: 0, s: L_IDEA_S, o: 1, curl: 0.04, wave: 0.04, ease: LIN },
      /* the original steps out once the set exists */
      { t: 14.30, x: L_IDEA[0] - 0.5, y: REST, z: L_IDEA[1] - 0.5, rx: 0, ry: 0, rz: 0, s: 0.48, o: 0, curl: 0.04, wave: 0.04, ease: HARD },
      { t: DUR, x: L_IDEA[0] - 0.5, y: REST, z: L_IDEA[1] - 0.5, rx: 0, ry: 0, rz: 0, s: 0.48, o: 0, curl: 0.03, wave: 0.03, ease: LIN }
    ],
    momo: [
      { t: 0.00, x: -4.40, y: 0.28, z: 1.40, rx: 0.10, ry: 0.58, rz: 0, s: 1, o: 0, curl: 0.40, wave: 0.40 },
      { t: 2.05, x: -4.10, y: 0.24, z: 1.32, rx: 0.09, ry: 0.54, rz: 0, s: 1, o: 0, curl: 0.38, wave: 0.40, ease: LIN },
      { t: 2.80, x: -2.30, y: 0.14, z: 1.06, rx: 0.05, ry: 0.32, rz: 0, s: 1, o: 1, curl: 0.30, wave: 0.30, ease: HARD },
      { t: 3.55, x: 1.42, y: REST, z: -0.20, rx: 0, ry: -0.16, rz: 0, s: 1, o: 1, curl: 0.09, wave: 0.09, ease: OUT },
      { t: 5.00, x: 1.42, y: REST, z: -0.20, rx: 0, ry: -0.16, rz: 0, s: 1, o: 1, curl: 0.05, wave: 0.05, ease: LIN },
      { t: 5.90, x: 1.78, y: REST, z: -0.30, rx: 0, ry: -0.10, rz: 0, s: 0.62, o: 1, curl: 0.05, wave: 0.05, ease: HARD },
      { t: 13.40, x: 1.78, y: REST, z: -0.30, rx: 0, ry: -0.10, rz: 0, s: 0.62, o: 1, curl: 0.04, wave: 0.04, ease: LIN },
      { t: 15.20, x: 0.00, y: REST, z: 0.30, rx: 0, ry: 0.02, rz: 0, s: 0.80, o: 1, curl: 0.06, wave: 0.06, ease: HARD },
      { t: DUR, x: 0.00, y: REST, z: 0.30, rx: 0, ry: 0.02, rz: 0, s: 0.80, o: 1, curl: 0.03, wave: 0.03, ease: LIN }
    ],
    thread: [
      { t: 0.00, x: 0, y: 0.010, z: 0.30, s: 1, o: 0 },
      { t: 13.40, x: 0, y: 0.010, z: 0.30, s: 1, o: 0, ease: LIN },
      { t: 14.60, x: 0, y: 0.010, z: 0.30, s: 1, o: 1, ease: OUT },
      { t: DUR, x: 0, y: 0.010, z: 0.30, s: 1, o: 1, ease: LIN }
    ]
  };

  const tracksP = {
    idea: [
      { t: 0.00, x: 1.40, y: 3.50, z: -2.60, rx: 0.60, ry: -0.84, rz: 0.16, s: 0.84, o: 0, curl: 0.95, wave: 0.85 },
      { t: 0.16, x: 1.26, y: 3.00, z: -2.20, rx: 0.52, ry: -0.76, rz: 0.14, s: 0.84, o: 1, curl: 0.92, wave: 0.85, ease: LIN },
      { t: 1.00, x: 0.40, y: 0.88, z: -0.86, rx: 0.15, ry: -0.24, rz: 0.05, s: 0.84, o: 1, curl: 0.52, wave: 0.50, ease: IN },
      { t: 1.58, x: 0.02, y: REST, z: -0.32, rx: 0, ry: -0.03, rz: 0, s: 0.84, o: 1, curl: 0.10, wave: 0.10, ease: OUT },
      { t: 2.00, x: 0.00, y: REST, z: -0.35, rx: 0, ry: -0.03, rz: 0, s: 0.84, o: 1, curl: 0.05, wave: 0.05, ease: OUT },
      { t: 3.30, x: 0.00, y: REST, z: -1.62, rx: 0, ry: 0.04, rz: 0, s: 0.76, o: 1, curl: 0.06, wave: 0.06, ease: HARD },
      { t: 5.20, x: P_IDEA[0], y: REST, z: P_IDEA[1], rx: 0, ry: 0.02, rz: 0, s: P_IDEA_S, o: 1, curl: 0.05, wave: 0.05, ease: HARD },
      { t: 13.20, x: P_IDEA[0], y: REST, z: P_IDEA[1], rx: 0, ry: 0.02, rz: 0, s: P_IDEA_S, o: 1, curl: 0.04, wave: 0.04, ease: LIN },
      { t: 14.30, x: P_IDEA[0], y: REST, z: P_IDEA[1] - 0.4, rx: 0, ry: 0, rz: 0, s: 0.32, o: 0, curl: 0.04, wave: 0.04, ease: HARD },
      { t: DUR, x: P_IDEA[0], y: REST, z: P_IDEA[1] - 0.4, rx: 0, ry: 0, rz: 0, s: 0.32, o: 0, curl: 0.03, wave: 0.03, ease: LIN }
    ],
    momo: [
      { t: 0.00, x: -2.90, y: 0.28, z: 1.60, rx: 0.10, ry: 0.58, rz: 0, s: 0.86, o: 0, curl: 0.40, wave: 0.40 },
      { t: 2.05, x: -2.70, y: 0.24, z: 1.52, rx: 0.09, ry: 0.54, rz: 0, s: 0.86, o: 0, curl: 0.38, wave: 0.40, ease: LIN },
      { t: 2.80, x: -0.90, y: 0.14, z: 1.44, rx: 0.05, ry: 0.24, rz: 0, s: 0.86, o: 1, curl: 0.30, wave: 0.30, ease: HARD },
      { t: 3.55, x: 0.00, y: REST, z: 1.40, rx: 0, ry: 0.04, rz: 0, s: 0.86, o: 1, curl: 0.09, wave: 0.09, ease: OUT },
      { t: 5.00, x: 0.00, y: REST, z: 1.40, rx: 0, ry: 0.04, rz: 0, s: 0.86, o: 1, curl: 0.05, wave: 0.05, ease: LIN },
      { t: 5.90, x: 0.62, y: REST, z: -1.15, rx: 0, ry: 0.03, rz: 0, s: 0.36, o: 1, curl: 0.05, wave: 0.05, ease: HARD },
      { t: 13.40, x: 0.62, y: REST, z: -1.15, rx: 0, ry: 0.03, rz: 0, s: 0.36, o: 1, curl: 0.04, wave: 0.04, ease: LIN },
      { t: 15.20, x: 0.00, y: REST, z: 0.30, rx: 0, ry: 0.02, rz: 0, s: 0.66, o: 1, curl: 0.06, wave: 0.06, ease: HARD },
      { t: DUR, x: 0.00, y: REST, z: 0.30, rx: 0, ry: 0.02, rz: 0, s: 0.66, o: 1, curl: 0.03, wave: 0.03, ease: LIN }
    ],
    thread: [
      { t: 0.00, x: 0, y: 0.010, z: -0.30, s: 1, o: 0 },
      { t: 13.40, x: 0, y: 0.010, z: -0.30, s: 1, o: 0, ease: LIN },
      { t: 14.60, x: 0, y: 0.010, z: -0.30, s: 1, o: 1, ease: OUT },
      { t: DUR, x: 0, y: 0.010, z: -0.30, s: 1, o: 1, ease: LIN }
    ]
  };

  KEYS.forEach((k, i) => {
    tracks[k] = derive(i, L_IDEA, L_IDEA_S, L_READ, 0.98, L_SLOT[i], 0.62);
    tracksP[k] = derive(i, P_IDEA, P_IDEA_S, P_READ, 0.68, P_SLOT[i], 0.48);
  });

  const camPos = [
    { t: 0.00, x: 0.34, y: 2.46, z: 3.44 },
    { t: 2.00, x: 0.20, y: 2.78, z: 3.80, ease: OUT },
    { t: 3.60, x: -0.12, y: 3.16, z: 4.32, ease: SMOOTH },
    { t: 5.30, x: 0.00, y: 4.30, z: 4.90, ease: SMOOTH },
    { t: 7.20, x: -0.14, y: 4.34, z: 4.94, ease: SMOOTH },
    { t: 9.10, x: 0.14, y: 4.30, z: 4.90, ease: SMOOTH },
    { t: 11.00, x: -0.10, y: 4.36, z: 4.96, ease: SMOOTH },
    { t: 13.60, x: 0.00, y: 5.90, z: 5.60, ease: SMOOTH },
    { t: 15.60, x: 0.00, y: 6.70, z: 6.00, ease: OUT },
    { t: 17.40, x: 0.00, y: 6.50, z: 5.84, ease: OUT },
    { t: DUR, x: 0.00, y: 6.46, z: 5.80, ease: LIN }
  ];
  const camTgt = [
    { t: 0.00, x: 0.10, y: 0, z: -0.05 },
    { t: 2.00, x: 0.00, y: 0, z: -0.08, ease: OUT },
    { t: 3.60, x: 0.32, y: 0, z: 0.02, ease: SMOOTH },
    { t: 5.30, x: 0.00, y: 0, z: 0.90, ease: SMOOTH },
    { t: 13.60, x: 0.00, y: 0, z: 0.60, ease: SMOOTH },
    { t: 15.60, x: 0.00, y: 0, z: 0.30, ease: OUT },
    { t: DUR, x: 0.00, y: 0, z: 0.30, ease: LIN }
  ];
  const camPosP = [
    { t: 0.00, x: 0.22, y: 2.90, z: 3.30 },
    { t: 2.00, x: 0.12, y: 3.30, z: 3.62, ease: OUT },
    { t: 3.60, x: 0.00, y: 3.90, z: 3.60, ease: SMOOTH },
    { t: 5.30, x: 0.00, y: 4.40, z: 3.20, ease: SMOOTH },
    { t: 11.00, x: 0.00, y: 4.44, z: 3.24, ease: SMOOTH },
    { t: 13.60, x: 0.00, y: 6.20, z: 3.80, ease: SMOOTH },
    { t: 15.60, x: 0.00, y: 7.40, z: 4.20, ease: OUT },
    { t: DUR, x: 0.00, y: 7.34, z: 4.16, ease: LIN }
  ];
  const camTgtP = [
    { t: 0.00, x: 0.06, y: 0, z: -0.30 },
    { t: 2.00, x: 0.00, y: 0, z: -0.34, ease: OUT },
    { t: 5.30, x: 0.00, y: 0, z: 0.55, ease: SMOOTH },
    { t: 13.60, x: 0.00, y: 0, z: 0.40, ease: SMOOTH },
    { t: 15.60, x: 0.00, y: 0, z: 0.30, ease: OUT },
    { t: DUR, x: 0.00, y: 0, z: 0.30, ease: LIN }
  ];

  const bloom = [
    { t: 0, s: 0 }, { t: 1.00, s: 0, ease: LIN }, { t: 1.28, s: 1.0, ease: HARD }, { t: 2.05, s: 0, ease: OUT },
    { t: 2.80, s: 0.55, ease: HARD }, { t: 3.60, s: 0, ease: OUT },
    ...IN_T.flatMap(t => [
      { t: t + 0.40, s: 0.62, ease: HARD },
      { t: t + 1.10, s: 0, ease: OUT }
    ]),
    { t: 14.60, s: 0.80, ease: HARD }, { t: 15.80, s: 0, ease: OUT },
    { t: DUR, s: 0, ease: LIN }
  ];
  const dim = [
    { t: 0, s: 0 }, { t: 16.10, s: 0, ease: LIN },
    { t: 17.30, s: 0.44, ease: HARD }, { t: DUR, s: 0.44, ease: LIN }
  ];

  window.MOMO_FILM_SPECS = window.MOMO_FILM_SPECS || {};
  window.MOMO_FILM_SPECS.idea = {
    slug: 'momo-one-idea-everywhere',
    duration: DUR,
    poster: 17.9,
    overlayCount: 5,
    tracks, tracksP, camPos, camTgt, camPosP, camTgtP, bloom, dim,

    async build(ctx) {
      const { data, loadImage, canvasTex } = ctx;
      const icons = await Promise.all([
        loadImage(data('iconBuild')), loadImage(data('iconAudience')),
        loadImage(data('iconPhone')), loadImage(data('iconProof'))
      ]);
      this.ideaTex = canvasTex(drawIdea());
      this.artTex = {
        site: canvasTex(drawSite(icons[0])),
        social: canvasTex(drawSocial(icons[1])),
        email: canvasTex(drawEmail(icons[2])),
        ad: canvasTex(drawAd(icons[3]))
      };
      this.threadWide = canvasTex(drawThread(false), false);
      this.threadTall = canvasTex(drawThread(true), false);
      /* Y-mirrored clones for the back-facing half of each tumble */
      this.artMirror = {};
      KEYS.forEach(k => {
        const m = this.artTex[k].clone();
        m.repeat.y = -1; m.offset.y = 1; m.needsUpdate = true;
        this.artMirror[k] = m;
      });

      const cards = [
        { key: 'thread', tex: this.threadWide, w: 6.60, h: 5.28, seg: [8, 8], radius: 0 },
        { key: 'idea', tex: this.ideaTex, w: CARD.w, h: CARD.h, seg: CARD.seg },
        ...KEYS.map(k => ({ key: k, tex: this.ideaTex, w: CARD.w, h: CARD.h, seg: CARD.seg })),
        { key: 'momo', tex: this.ideaTex, w: 3.42, h: 2.28, seg: [40, 56] }
      ];
      return {
        cards,
        video: {
          card: 'momo', src: data('srcMomo'), still: data('stillMomo'),
          window: [2.05, 5.90, 3.5], clipStart: 0.55
        }
      };
    },

    mapFor(key, t) {
      if (key === 'thread') return null;
      const i = KEYS.indexOf(key);
      if (i < 0) return null;
      if (t < SWAP_A[i]) return this.ideaTex;
      if (t < SWAP_B[i]) return this.artMirror[key];
      return this.artTex[key];
    },
    scaleFor(key, k, P) {
      if (key !== 'thread') return null;
      return P ? [k.s * 0.62, k.s * 1.06, k.s] : [k.s, k.s, k.s];
    },

    beats(t, h) {
      const band = (a, b, c, d) => {
        if (t < a || t > d) return 0;
        if (t < b) return h.OUT(h.clamp01((t - a) / (b - a)));
        if (t > c) return 1 - h.HARD(h.clamp01((t - c) / (d - c)));
        return 1;
      };
      return {
        title: band(2.45, 3.15, 4.60, 5.20),
        titleReveal: h.HARD(h.clamp01((t - 2.45) / 0.7)),
        settled: band(14.70, 15.40, 16.20, 16.80),
        endcard: band(16.90, 17.70, DUR, DUR + 0.1),
        endLift: 1 - h.OUT(h.clamp01((t - 16.90) / 1.5))
      };
    },

    applyOverlays(B, set) {
      set('titlescrim', B.title * 0.92);
      set('title', B.title, { clipPath: 'inset(0 ' + (100 - 100 * B.titleReveal).toFixed(2) + '% 0 0)' });
      set('settled', B.settled);
      set('endscrim', B.endcard * 0.96);
      set('endcard', B.endcard, { transform: 'translateY(' + (26 * B.endLift).toFixed(2) + 'px)' });
    },

    cueScore(t, score) {
      if (!score.on) return;
      if (t > 1.58) score.land('idea');
      if (t > 2.80) score.tone('momo', 220);
      IN_T.forEach((v, i) => { if (t > v + 1.24) score.land('d' + i); });
      if (t > 14.60) score.tone('thread', 293.7);
      if (t > 17.30) score.tone('end', 174.6);
    },

    drawCapture(cx, o) {
      const { W, H, u, B, logo, C: K, trackText: tt, roundRect: rr } = o;
      const pad = 0.052 * W;
      if (B.title > 0.003) {
        cx.save();
        cx.globalAlpha = B.title * 0.92;
        const g = cx.createLinearGradient(0, H, 0, H * 0.40);
        g.addColorStop(0, 'rgba(3,23,46,1)');
        g.addColorStop(0.36, 'rgba(3,23,46,.90)');
        g.addColorStop(1, 'rgba(3,23,46,0)');
        cx.fillStyle = g; cx.fillRect(0, H * 0.40, W, H * 0.60);
        cx.restore();
        cx.save();
        cx.globalAlpha = B.title;
        const size = 96 * u;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        const full = cx.measureText('Everywhere').width;
        cx.beginPath(); cx.rect(pad, H * 0.55, full * B.titleReveal + size, H * 0.42); cx.clip();
        cx.fillStyle = '#ffffff';
        cx.fillText('One idea', pad, H - pad - size * 1.16);
        cx.fillStyle = K.gold;
        cx.fillText('.', pad + cx.measureText('One idea').width, H - pad - size * 1.16);
        cx.fillStyle = '#ffffff';
        cx.fillText('Everywhere', pad, H - pad);
        cx.fillStyle = K.gold;
        cx.fillText('.', pad + cx.measureText('Everywhere').width, H - pad);
        cx.restore();
      }
      if (B.settled > 0.003) {
        cx.save();
        cx.globalAlpha = B.settled;
        cx.font = '800 ' + (26 * u).toFixed(1) + 'px Nunito, sans-serif';
        cx.fillStyle = K.navy;
        tt(cx, 'ONE COHERENT CAMPAIGN · ILLUSTRATIVE', pad, pad + 26 * u, 2.3 * u);
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
        const lw = Math.min(320 * u, W * 0.24);
        let cy = H * 0.40 + lift;
        if (logo && logo.naturalWidth) {
          const lh = lw * (logo.naturalHeight / logo.naturalWidth);
          const pw = lw + 56 * u, ph = lh + 40 * u;
          const px = (W - pw) / 2, py = cy - ph / 2;
          cx.fillStyle = '#ffffff';
          rr(cx, px, py, pw, ph, 14 * u); cx.fill();
          cx.drawImage(logo, (W - lw) / 2, cy - lh / 2, lw, lh);
          cy = py + ph;
        }
        const size = 54 * u;
        cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
        cx.textAlign = 'center';
        cx.fillStyle = '#ffffff';
        cx.fillText('One idea.', W / 2, cy + size * 1.5);
        cx.fillText('Every touchpoint', W / 2, cy + size * 2.66);
        cx.fillStyle = K.gold;
        cx.fillText('.', W / 2 + cx.measureText('Every touchpoint').width / 2, cy + size * 2.66);
        cx.font = '800 ' + (24 * u).toFixed(1) + 'px Nunito, sans-serif';
        cx.fillStyle = K.pale;
        cx.fillText('P R O P O S E D   C O N C E P T', W / 2, cy + size * 3.9);
        cx.restore();
      }
    }
  };
  }

  if (window.MomoPaper) install();
  else (window.MOMO_SPEC_QUEUE = window.MOMO_SPEC_QUEUE || []).push(install);
})();
