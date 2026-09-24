/* Momentum AI launch ads 02–04 :: canvas 2D typographic stages
   Three more ads in the same restrained register as "Ask About", each with a
   genuinely different motion language:

     02 sold-separately  additive — a spec sheet ticks itself off in gold until
                         one line arrives with no tick
     03 ideas-called     accumulating time — a log of shelved ideas stacks up
                         with a climbing counter, then clears
     04 ask-anyone       a blinking wait — a question types itself, then three
                         seconds of dead air before an answer that isn't you

   Registered on window.MOMO_AD_SPECS and picked up by <momo-ad-stage data-ad>.
   Every beat is a pure function of t; one live decoder per film; Momo appears
   once, late, as relief.
*/
(function () {
  function install() {
    if (window.MOMO_AD_SPECS && window.MOMO_AD_SPECS['sold-separately']) return;
    const K = window.MomoAd;
    const { C, HARD, OUT, clamp01 } = K;

    const DUR = 20;

    /* ---------- shared drawing helpers ---------- */
    function tracked(cx, text, x, y, sp) {
      let mx = x;
      for (const ch of text) { cx.fillText(ch, mx, y); mx += cx.measureText(ch).width + sp; }
      return mx - x;
    }
    function trackedWidth(cx, text, sp) {
      let w = 0;
      for (const ch of text) w += cx.measureText(ch).width + sp;
      return w - sp;
    }
    function band(t, a, b, c, d) {
      if (t < a || t > d) return 0;
      if (t < b) return OUT(clamp01((t - a) / (b - a)));
      if (t > c) return 1 - HARD(clamp01((t - c) / (d - c)));
      return 1;
    }
    /* the gold tick, authored in the system's own 24-viewBox round-cap style */
    function tick(cx, x, y, s, extent, color) {
      if (extent <= 0.001) return;
      cx.save();
      cx.strokeStyle = color;
      cx.lineWidth = Math.max(2, s * 0.14);
      cx.lineCap = 'round';
      cx.lineJoin = 'round';
      const p = [[x, y + s * 0.52], [x + s * 0.36, y + s * 0.86], [x + s, y + s * 0.16]];
      cx.beginPath();
      cx.moveTo(p[0][0], p[0][1]);
      if (extent < 0.5) {
        const u = extent / 0.5;
        cx.lineTo(p[0][0] + (p[1][0] - p[0][0]) * u, p[0][1] + (p[1][1] - p[0][1]) * u);
      } else {
        cx.lineTo(p[1][0], p[1][1]);
        const u = (extent - 0.5) / 0.5;
        cx.lineTo(p[1][0] + (p[2][0] - p[1][0]) * u, p[1][1] + (p[2][1] - p[1][1]) * u);
      }
      cx.stroke();
      cx.restore();
    }
    /* the hero line: arrives once on the 0.8s Momentum curve, then holds */
    function heroBlock(cx, o) {
      const { W, H, u, pad, lines, size, reveal, alpha } = o;
      cx.save();
      cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
      const lead = size * 1.07;
      let y = H / 2 - (lead * lines.length) / 2 + size * 0.82;
      cx.beginPath();
      cx.rect(0, 0, W * reveal, H);
      cx.clip();
      cx.globalAlpha = alpha;
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
    }
    /* Momo, contained on midnight so the full ceramic form and the chest
       emblem survive — never cropped to fill */
    function momoBeat(cx, o) {
      const { W, H, P, src, alpha } = o;
      if (!src || alpha <= 0.004) return;
      const sw = src.videoWidth || src.naturalWidth || 16;
      const sh = src.videoHeight || src.naturalHeight || 9;
      const boxW = W * (P ? 0.84 : 0.52), boxH = H * (P ? 0.42 : 0.62);
      const sc = Math.min(boxW / sw, boxH / sh);
      const dw = sw * sc, dh = sh * sc;
      cx.save();
      cx.globalAlpha = alpha;
      cx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
      cx.restore();
    }
    /* the end mark: exact logo on a white plate, launch stamp, meta line */
    function endMark(cx, o) {
      const { W, H, u, P, logo, alpha, lift, stamp, stampTall, label } = o;
      if (alpha <= 0.004) return;
      cx.save();
      cx.globalAlpha = alpha * 0.94;
      cx.fillStyle = C.night;
      cx.fillRect(0, 0, W, H);
      cx.globalAlpha = alpha;
      cx.translate(0, 22 * u * lift);
      let cy = H * (P ? 0.40 : 0.42);
      if (logo) {
        const lw = Math.min(W * (P ? 0.50 : 0.20), 340 * u);
        const lh = lw * (logo.naturalHeight / logo.naturalWidth);
        const bw = lw + 52 * u, bh = lh + 36 * u;
        const bx = (W - bw) / 2, by = cy - bh;
        const r = 14 * u;
        cx.beginPath();
        cx.moveTo(bx + r, by); cx.arcTo(bx + bw, by, bx + bw, by + bh, r);
        cx.arcTo(bx + bw, by + bh, bx, by + bh, r); cx.arcTo(bx, by + bh, bx, by, r);
        cx.arcTo(bx, by, bx + bw, by, r); cx.closePath();
        cx.fillStyle = C.paper; cx.fill();
        cx.drawImage(logo, bx + 26 * u, by + 18 * u, lw, lh);
      }
      const size = (P ? 58 : 72) * u;
      cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
      cx.textAlign = 'center';
      const rows = P ? stampTall : stamp;
      let sy = cy + size * 1.5;
      for (let i = 0; i < rows.length; i++) {
        cx.fillStyle = C.paper;
        cx.fillText(rows[i], W / 2, sy);
        if (i === rows.length - 1) {
          const w = cx.measureText(rows[i]).width;
          cx.fillStyle = C.gold;
          cx.fillText('.', W / 2 + w / 2, sy);
        }
        sy += size * 1.07;
      }
      const ms = 26 * u;
      cx.font = '800 ' + ms.toFixed(1) + 'px Nunito, sans-serif';
      cx.fillStyle = C.pale;
      cx.textAlign = 'left';
      const lw2 = trackedWidth(cx, label, 2.6 * u);
      tracked(cx, label, (W - lw2) / 2, sy + ms * 1.9, 2.6 * u);
      cx.restore();
    }

    const LABEL = 'MOMENTUM AI · NOW OPEN';

    /* ================= 02 — Ambition Sold Separately ================= */
    /* Additive: the sheet ticks itself off until one line gets no tick. */
    const SS_ROWS = [
      { label: 'AI access', value: 'Included', in: 1.20 },
      { label: 'The same models', value: 'Included', in: 2.10 },
      { label: 'The same tools', value: 'Included', in: 3.00 },
      { label: 'The same templates', value: 'Included', in: 3.90 },
      { label: 'The same advice', value: 'Included', in: 4.80 }
    ];
    const SS_LAST = { label: 'Ambition', value: 'Sold separately', in: 6.60 };
    const SS_HERO = [9.60, 14.10];
    const SS_MOMO = [14.40, 16.30];
    const SS_END = [16.60, DUR];

    window.MOMO_AD_SPECS = window.MOMO_AD_SPECS || {};
    window.MOMO_AD_SPECS['sold-separately'] = {
      slug: 'momentum-ai-sold-separately',
      title: 'Ambition sold separately',
      duration: DUR,
      poster: 11.6,
      motion: 'additive — a spec sheet ticks itself off in gold until one line arrives with no tick',
      video: { window: [SS_MOMO[0] - 0.30, SS_MOMO[1], 2.10], clipStart: 3.40 },
      cueScore(t, score) {
        SS_ROWS.forEach((r, i) => { if (t > r.in + 0.42) score.strike('r' + i); });
        if (t > SS_LAST.in) score.tone('last', 146.8);
        if (t > SS_HERO[0]) score.tone('hero', 220);
        if (t > SS_END[0]) score.tone('end', 293.7);
      },
      beats(t) {
        return {
          rows: SS_ROWS.map(r => ({
            on: band(t, r.in, r.in + 0.34, 5.90, 6.30),
            tick: HARD(clamp01((t - r.in - 0.28) / 0.34))
          })),
          last: band(t, SS_LAST.in, SS_LAST.in + 0.55, 8.40, 8.95),
          hero: band(t, SS_HERO[0], SS_HERO[0] + 0.85, SS_HERO[1] - 0.35, SS_HERO[1] + 0.5),
          heroReveal: HARD(clamp01((t - SS_HERO[0]) / 0.85)),
          momo: band(t, SS_MOMO[0], SS_MOMO[0] + 0.6, SS_MOMO[1] - 0.35, SS_MOMO[1] + 0.4),
          end: band(t, SS_END[0], SS_END[0] + 0.85, DUR, DUR + 0.1),
          endLift: 1 - OUT(clamp01((t - SS_END[0]) / 1.4))
        };
      },
      draw(cx, o) {
        const { W, H, u, P, B, pad, logo, momoSrc } = o;
        const size = (P ? 44 : 56) * u;
        const gap = size * 1.92;
        const anyRow = B.rows.some(r => r.on > 0.004) || B.last > 0.004;

        if (anyRow) {
          const top = H / 2 - (gap * (SS_ROWS.length - 1)) / 2 - gap * 0.30;
          cx.textAlign = 'left';
          for (let i = 0; i < SS_ROWS.length; i++) {
            const b = B.rows[i];
            if (b.on <= 0.004) continue;
            const y = top + gap * i;
            cx.save();
            cx.globalAlpha = b.on;
            /* hairline structure, the only structure in the system */
            cx.fillStyle = C.navy;
            cx.fillRect(pad, y + size * 0.52, W - pad * 2, Math.max(1, 1.5 * u));
            cx.font = '400 ' + size.toFixed(1) + 'px Nunito, sans-serif';
            cx.fillStyle = C.pale;
            cx.fillText(SS_ROWS[i].label, pad + size * 1.9, y);
            /* the value, right-aligned, quiet */
            cx.font = '800 ' + (size * 0.74).toFixed(1) + 'px Nunito, sans-serif';
            /* reversed copy on a dark field is --pale, not secondary ink:
               #52677C on midnight is only 3.08:1, which fails body scale */
            cx.fillStyle = C.pale;
            cx.textAlign = 'right';
            cx.fillText(SS_ROWS[i].value, W - pad, y);
            cx.textAlign = 'left';
            cx.restore();
            /* gold tick: selected-state detail, one of its shipped roles */
            cx.save();
            cx.globalAlpha = b.on;
            tick(cx, pad, y - size * 0.72, size, b.tick, C.gold);
            cx.restore();
          }
          /* the line that gets no tick */
          if (B.last > 0.004) {
            const y = top + gap * SS_ROWS.length + gap * 0.24;
            cx.save();
            cx.globalAlpha = B.last;
            cx.fillStyle = C.gold;
            cx.fillRect(pad, y + size * 0.52, W - pad * 2, Math.max(2, 3 * u));
            cx.font = '900 ' + (size * 1.30).toFixed(1) + 'px Archivo, sans-serif';
            cx.fillStyle = C.paper;
            cx.fillText(SS_LAST.label, pad + size * 1.9, y);
            cx.font = '800 ' + (size * 0.86).toFixed(1) + 'px Nunito, sans-serif';
            cx.fillStyle = C.gold;
            cx.textAlign = 'right';
            cx.fillText(SS_LAST.value, W - pad, y);
            cx.textAlign = 'left';
            cx.restore();
          }
        }

        if (B.hero > 0.004) {
          heroBlock(cx, {
            W, H, u, pad, alpha: B.hero, reveal: B.heroReveal,
            size: (P ? 88 : 118) * u,
            lines: P ? ['Everyone has', 'access to AI.', 'Not everyone', 'has a plan']
                     : ['Everyone has access to AI.', 'Not everyone has a plan']
          });
        }
        momoBeat(cx, { W, H, P, src: momoSrc, alpha: B.momo });
        endMark(cx, {
          W, H, u, P, logo, alpha: B.end, lift: B.endLift,
          stamp: ['Ambition sold separately'],
          stampTall: ['Ambition sold', 'separately'],
          label: LABEL
        });
      }
    };

    /* ================= 03 — Your Ideas Called ================= */
    /* Accumulating time: a log of shelved ideas stacks up with a climbing
       counter, then clears. Every entry is generic and labelled illustrative. */
    const IC_ROWS = [
      { what: 'The website redo', when: 'Left a message last year', in: 1.10 },
      { what: 'The follow-up system', when: 'Left a message in the spring', in: 2.05 },
      { what: 'The review requests', when: 'Left a message in the summer', in: 3.00 },
      { what: 'The quoting process', when: 'Left a message last month', in: 3.95 },
      { what: 'The one you had in the truck', when: 'Left a message this morning', in: 4.90 }
    ];
    const IC_CLEAR = 6.10;
    const IC_GONE = 6.80;
    const IC_HERO = [8.20, 13.60];
    const IC_MOMO = [13.90, 15.90];
    const IC_END = [16.30, DUR];

    window.MOMO_AD_SPECS['ideas-called'] = {
      slug: 'momentum-ai-ideas-called',
      title: 'Your ideas called',
      duration: DUR,
      poster: 11.0,
      motion: 'accumulating time — a log of shelved ideas stacks up with a climbing counter, then clears',
      video: { window: [IC_MOMO[0] - 0.30, IC_MOMO[1], 2.10], clipStart: 3.40 },
      cueScore(t, score) {
        IC_ROWS.forEach((r, i) => { if (t > r.in) score.strike('m' + i); });
        if (t > IC_HERO[0]) score.tone('hero', 220);
        if (t > IC_END[0]) score.tone('end', 293.7);
      },
      beats(t) {
        const rows = IC_ROWS.map(r => ({
          on: t < r.in ? 0 : (t > IC_CLEAR ? 1 - HARD(clamp01((t - IC_CLEAR) / (IC_GONE - IC_CLEAR))) : OUT(clamp01((t - r.in) / 0.34))),
          slide: OUT(clamp01((t - r.in) / 0.44))
        }));
        const count = IC_ROWS.reduce((n, r) => n + (t >= r.in ? 1 : 0), 0);
        return {
          rows, count,
          counter: band(t, 0.85, 1.35, IC_CLEAR, IC_GONE),
          hero: band(t, IC_HERO[0], IC_HERO[0] + 0.85, IC_HERO[1] - 0.35, IC_HERO[1] + 0.5),
          heroReveal: HARD(clamp01((t - IC_HERO[0]) / 0.85)),
          momo: band(t, IC_MOMO[0], IC_MOMO[0] + 0.6, IC_MOMO[1] - 0.35, IC_MOMO[1] + 0.4),
          end: band(t, IC_END[0], IC_END[0] + 0.85, DUR, DUR + 0.1),
          endLift: 1 - OUT(clamp01((t - IC_END[0]) / 1.4))
        };
      },
      draw(cx, o) {
        const { W, H, u, P, B, pad, logo, momoSrc } = o;

        /* the counter, in the system's single uppercase register */
        if (B.counter > 0.004) {
          cx.save();
          cx.globalAlpha = B.counter;
          const ms = (P ? 24 : 26) * u;
          cx.font = '800 ' + ms.toFixed(1) + 'px Nunito, sans-serif';
          /* the honesty disclosure must be the most legible small text in the
             film, not the least — --pale at 13.89:1, never secondary ink */
          cx.fillStyle = C.pale;
          tracked(cx, B.count + ' WAITING · ILLUSTRATIVE', pad, H * 0.13, 2.6 * u);
          cx.restore();
        }

        const anyRow = B.rows.some(r => r.on > 0.004);
        if (anyRow) {
          const size = (P ? 40 : 52) * u;
          const gap = size * 2.10;
          const top = H / 2 - (gap * (IC_ROWS.length - 1)) / 2;
          cx.textAlign = 'left';
          for (let i = 0; i < IC_ROWS.length; i++) {
            const b = B.rows[i];
            if (b.on <= 0.004) continue;
            const y = top + gap * i;
            /* each entry slides in from a short offset — the only movement */
            const dx = (1 - b.slide) * size * 0.9;
            cx.save();
            cx.globalAlpha = b.on;
            cx.fillStyle = C.navy;
            cx.fillRect(pad, y + size * 0.60, W - pad * 2, Math.max(1, 1.5 * u));
            /* action-blue caret: the system's own arrow glyph, abbreviated */
            cx.strokeStyle = C.blue;
            cx.lineWidth = Math.max(1.5, 2.4 * u);
            cx.lineCap = 'round';
            cx.beginPath();
            cx.moveTo(pad + dx, y - size * 0.34);
            cx.lineTo(pad + size * 0.34 + dx, y - size * 0.14);
            cx.lineTo(pad + dx, y + size * 0.06);
            cx.stroke();
            cx.font = '900 ' + (size * 0.98).toFixed(1) + 'px Nunito, sans-serif';
            cx.fillStyle = C.pale;
            cx.fillText(IC_ROWS[i].what, pad + size * 0.78 + dx, y);
            cx.font = '400 ' + (size * 0.68).toFixed(1) + 'px Nunito, sans-serif';
            /* body scale on a dark field: --pale */
            cx.fillStyle = C.pale;
            if (P) {
              cx.fillText(IC_ROWS[i].when, pad + size * 0.78 + dx, y + size * 0.86);
            } else {
              cx.textAlign = 'right';
              cx.fillText(IC_ROWS[i].when, W - pad, y);
              cx.textAlign = 'left';
            }
            cx.restore();
          }
        }

        if (B.hero > 0.004) {
          heroBlock(cx, {
            W, H, u, pad, alpha: B.hero, reveal: B.heroReveal,
            size: (P ? 90 : 122) * u,
            lines: P ? ['Your ideas', 'called.', "They're tired", 'of waiting']
                     : ['Your ideas called.', "They're tired of waiting"]
          });
        }
        momoBeat(cx, { W, H, P, src: momoSrc, alpha: B.momo });
        endMark(cx, {
          W, H, u, P, logo, alpha: B.end, lift: B.endLift,
          stamp: ['Someday just lost its excuse'],
          stampTall: ['Someday just', 'lost its excuse'],
          label: LABEL
        });
      }
    };

    /* ================= 04 — Ask Anyone ================= */
    /* A blinking wait. The question types itself, then three seconds of dead
       air — the longest silence in the campaign — then an answer that isn't you. */
    const AA_Q = "who's the best in philadelphia for this?";
    const AA_TYPE = [1.00, 3.60];      /* character-by-character */
    const AA_WAIT = [3.60, 6.60];      /* the caret blinks into nothing */
    const AA_ANSWER = [6.60, 10.40];   /* an answer returns */
    const AA_HERO = [11.00, 15.10];
    const AA_MOMO = [15.40, 17.10];
    const AA_END = [17.30, DUR];

    window.MOMO_AD_SPECS['ask-anyone'] = {
      slug: 'momentum-ai-ask-anyone',
      title: 'Ask anyone',
      duration: DUR,
      poster: 13.0,
      motion: 'a blinking wait — the question types itself, then three seconds of dead air before an answer that is not you',
      video: { window: [AA_MOMO[0] - 0.30, AA_MOMO[1], 1.90], clipStart: 3.40 },
      cueScore(t, score) {
        if (t > AA_TYPE[1]) score.strike('typed');
        if (t > AA_ANSWER[0]) score.tone('answer', 146.8);
        if (t > AA_HERO[0]) score.tone('hero', 220);
        if (t > AA_END[0]) score.tone('end', 293.7);
      },
      beats(t) {
        const typed = Math.floor(AA_Q.length * clamp01((t - AA_TYPE[0]) / (AA_TYPE[1] - AA_TYPE[0])));
        /* the caret blinks only while nothing is happening */
        const waiting = t >= AA_TYPE[1] && t < AA_ANSWER[0];
        return {
          q: band(t, AA_TYPE[0], AA_TYPE[0] + 0.3, AA_ANSWER[1] - 0.4, AA_ANSWER[1] + 0.4),
          typed,
          caret: (t >= AA_TYPE[0] && t < AA_ANSWER[0]) ? (Math.floor(t * 1.6) % 2 === 0 ? 1 : 0) : 0,
          waiting,
          answer: band(t, AA_ANSWER[0], AA_ANSWER[0] + 0.5, AA_ANSWER[1] - 0.4, AA_ANSWER[1] + 0.4),
          hero: band(t, AA_HERO[0], AA_HERO[0] + 0.85, AA_HERO[1] - 0.35, AA_HERO[1] + 0.5),
          heroReveal: HARD(clamp01((t - AA_HERO[0]) / 0.85)),
          momo: band(t, AA_MOMO[0], AA_MOMO[0] + 0.6, AA_MOMO[1] - 0.35, AA_MOMO[1] + 0.4),
          end: band(t, AA_END[0], AA_END[0] + 0.85, DUR, DUR + 0.1),
          endLift: 1 - OUT(clamp01((t - AA_END[0]) / 1.4))
        };
      },
      draw(cx, o) {
        const { W, H, u, P, B, pad, logo, momoSrc } = o;

        if (B.q > 0.004) {
          const size = (P ? 38 : 46) * u;
          cx.save();
          cx.globalAlpha = B.q;
          cx.font = '400 ' + size.toFixed(1) + 'px Nunito, sans-serif';
          cx.textAlign = 'left';
          const shown = AA_Q.slice(0, B.typed);
          const maxW = W - pad * 2;
          /* wrap the question rather than letting it run off the measure */
          const words = shown.split(' ');
          const lines = [];
          let line = '';
          for (const w of words) {
            const probe = line ? line + ' ' + w : w;
            if (cx.measureText(probe).width > maxW && line) { lines.push(line); line = w; }
            else line = probe;
          }
          if (line) lines.push(line);
          const lead = size * 1.5;
          const qy = H * (P ? 0.30 : 0.34) - (lines.length - 1) * lead;
          cx.fillStyle = C.pale;
          for (let i = 0; i < lines.length; i++) cx.fillText(lines[i], pad, qy + lead * i);
          if (B.caret) {
            const lastW = cx.measureText(lines[lines.length - 1] || '').width;
            cx.fillStyle = C.gold;
            cx.fillRect(pad + lastW + size * 0.12, qy + lead * (lines.length - 1) - size * 0.74, Math.max(2, size * 0.07), size * 0.94);
          }
          cx.restore();
        }

        /* the answer: a name that is not theirs, never a real business */
        if (B.answer > 0.004) {
          const size = (P ? 54 : 68) * u;
          cx.save();
          cx.globalAlpha = B.answer;
          cx.textAlign = 'left';
          const ay = H * (P ? 0.56 : 0.58);
          cx.font = '800 ' + (24 * u).toFixed(1) + 'px Nunito, sans-serif';
          /* meta scale on a dark field: --pale */
          cx.fillStyle = C.pale;
          tracked(cx, 'THE ANSWER IT GAVE', pad, ay - size * 1.30, 2.6 * u);
          cx.fillStyle = C.navy;
          cx.fillRect(pad, ay - size * 1.02, W - pad * 2, Math.max(1, 1.5 * u));
          cx.font = '900 ' + size.toFixed(1) + 'px Archivo, sans-serif';
          cx.fillStyle = C.muted;
          cx.fillText('Somebody else', pad, ay);
          cx.restore();
        }

        if (B.hero > 0.004) {
          heroBlock(cx, {
            W, H, u, pad, alpha: B.hero, reveal: B.heroReveal,
            size: (P ? 96 : 128) * u,
            lines: P ? ['Be the name', 'it says'] : ['Be the name it says']
          });
        }
        momoBeat(cx, { W, H, P, src: momoSrc, alpha: B.momo });
        endMark(cx, {
          W, H, u, P, logo, alpha: B.end, lift: B.endLift,
          stamp: ['Give your competition', 'something to ask AI about'],
          stampTall: ['Give your', 'competition', 'something to', 'ask AI about'],
          label: LABEL
        });
      }
    };
  }

  if (window.MomoAd) install();
  else (window.MOMO_AD_QUEUE = window.MOMO_AD_QUEUE || []).push(install);
})();
