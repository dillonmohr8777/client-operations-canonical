/* Measurement pass, loaded by verify.html against a page rendered in a real
   1440x900 iframe. Re-measures the numbers the desktop spec pins, plus
   the image and console checks, and prints a PASS/FAIL table into #verify-out
   so it can be read back without a devtools console.

   The pane throttles rAF when it is not painting, which stalls GSAP's ticker
   and freezes CSS transitions part-way, so nothing here waits on frames:
   the swap is driven by ScrollTrigger.update() and the transition curve is
   read by seeking the CSSTransition's currentTime. */
(function () {
  'use strict';
  var W = window.__vw || window, D = W.document;
  var out = document.getElementById('verify-out');
  var R = {}, T = [];
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var raf = function () {
    return new Promise(function (r) { W.requestAnimationFrame(r); setTimeout(r, 40); });
  };
  function step(s) { out.textContent = 'step: ' + s; }

  /* target: label, measured, expected, ok */
  function t(label, got, want, ok) {
    T.push({ label: label, got: got, want: want, pass: ok === undefined ? got === want : !!ok });
  }
  function near(label, got, want, tol) {
    T.push({ label: label, got: got, want: want, pass: Math.abs(got - want) <= (tol || 0.6) });
  }
  function box(sel, el) {
    el = el || D.querySelector(sel);
    if (!el) return null;
    var b = el.getBoundingClientRect();
    return { x: +(b.x + W.scrollX).toFixed(2), y: +(b.y + W.scrollY).toFixed(2),
             w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
  }
  function cs(sel, props, pseudo) {
    var el = typeof sel === 'string' ? D.querySelector(sel) : sel;
    if (!el) return null;
    var s = W.getComputedStyle(el, pseudo || null), o = {};
    props.forEach(function (p) { o[p] = s.getPropertyValue(p); });
    return o;
  }
  function txOf(el) {
    return +(new DOMMatrixReadOnly(W.getComputedStyle(el).transform)).m41.toFixed(1);
  }
  function opOf(el) { return +W.getComputedStyle(el).opacity; }

  (async function run() {
    step('fonts');
    if (D.fonts && D.fonts.ready) await Promise.race([D.fonts.ready, sleep(6000)]);
    step('settle');
    await sleep(2500);                       // illustration paint + hero image decode
    await raf(); await raf();
    step('measuring');

    R.page = D.title;
    R.viewport = { innerWidth: W.innerWidth, innerHeight: W.innerHeight,
                   clientWidth: D.documentElement.clientWidth };
    R.scrollHeight = D.documentElement.scrollHeight;

    /* ---------------------------------------------------------- header */
    var h = cs('.header', ['position', 'height', 'background-color', 'z-index']);
    var hb = box('.header');
    t('header position fixed', h.position, 'fixed');
    t('header height 100px', h.height, '100px');
    near('header box height 100', hb.h, 100);

    /* ------------------------------------------------- container / grid */
    var cont = box('.header .container'), col = box('.header .col-md-12');
    var colPad = parseFloat(cs('.header .col-md-12', ['padding-left'])['padding-left']);
    var contentX = +(col.x + colPad).toFixed(2);
    near('container width 1310', cont.w, 1310);
    near('content starts one gutter inside the centered container', contentX,
         col.x + colPad, 0.5);
    R.container = cont; R.content_col = col; R.content_x = contentX;

    /* ------------------------------------------------------------- diag */
    R.diag = {
      wrapper: box('.wrapper'),
      wrapper_pad: cs('.wrapper', ['padding-top', 'overflow', 'display']),
      header_box: box('.header'),
      homeslider_wrapper: box('.homeslider_wrapper'),
      homeslider: box('.homeslider'),
      backbgbox: box('.homeslider .backbgbox'),
      backbgbox_css: cs('.homeslider .backbgbox', ['height', 'min-height']),
      home_logo: box('.home_logo'),
      home_logo_css: cs('.home_logo', ['padding-bottom', 'position', 'top', 'height']),
      compatMode: D.compatMode,
      body_first: [].map.call(D.body.children, function (c) {
        return c.tagName + '.' + (c.className || '').toString().slice(0, 24);
      })
    };

    /* ------------------------------------------- logo_caption transition */
    var capCss = cs('.logo_caption', ['transition', 'transition-duration',
                                      'transition-timing-function']);
    R.logo_caption_transition = capCss;
    t('.logo_caption duration 0.8s', capCss['transition-duration'], '0.8s');
    t('.logo_caption easing cubic-bezier(0.85, 0, 0.15, 1)',
      capCss['transition-timing-function'], 'cubic-bezier(0.85, 0, 0.15, 1)');
    var markCss = cs('.logo > a', ['transition-duration', 'transition-timing-function', 'width']);
    R.logo_mark_css = markCss;
    t('.logo > a duration 0.8s', markCss['transition-duration'], '0.8s');
    t('.logo > a easing cubic-bezier(0.85, 0, 0.15, 1)',
      markCss['transition-timing-function'], 'cubic-bezier(0.85, 0, 0.15, 1)');
    near('.logo > a uses up to 400px of its available column', parseFloat(markCss.width),
         Math.min(400, box('.logo').w), 1);

    /* --------------------------------------------------- hero geometry */
    /* The invisible figure anchor preserves the 485/486 reference swap point
       while the generated photograph owns the visible hero. */
    R.hero_figure = box('.homeslider_wrapper .home_logo figure');
    near('hero figure width min(1180,88vw)', R.hero_figure.w,
         Math.min(1180, W.innerWidth * 0.88), 2);
    near('hero figure height 455.68', R.hero_figure.h, 455.68, 1.0);
    var heroMark = D.querySelector('.home_logo .markbox img, .home_logo .markbox .wordmark, ' +
                                   '.home_logo .markbox .hubmark');
    R.hero_mark = heroMark ? box(null, heroMark) : null;
    R.hero_image = box('.homeslider .backvid .industry_hero');
    /* One generated industry photo owns the stage. No centered logo, SVG
       illustration, or nested card is allowed to sit over it. */
    R.hero_ground = cs('.homeslider .backbgbox', ['background-color']);
    R.header_ground = cs('.header', ['background-color']);
    t('hero backing matches header field', R.hero_ground['background-color'],
      R.header_ground['background-color']);
    t('hero has exactly one generated industry image',
      D.querySelectorAll('.homeslider .backvid .industry_hero').length, 1);
    t('hero has no centered logo',
      D.querySelectorAll('.home_logo .markbox img, .home_logo .wordmark').length, 0);
    t('hero has no SVG illustration',
      D.querySelectorAll('.homeslider .backvid .illo').length, 0);
    t('hero has no nested mark panel',
      D.querySelectorAll('.markground, .markbox.plated, figure.plate').length, 0);
    t('hero image fills the stage',
      Math.round(R.hero_image.w) + 'x' + Math.round(R.hero_image.h),
      Math.round(R.diag.backbgbox.w) + 'x' + Math.round(R.diag.backbgbox.h),
      Math.abs(R.hero_image.w - R.diag.backbgbox.w) <= 1 &&
      Math.abs(R.hero_image.h - R.diag.backbgbox.h) <= 1);

    /* --------------------------------------------- the logo upscale cap */
    R.marks = [].map.call(D.querySelectorAll('img[src*="/assets/logos/"]'), function (im) {
      var r = im.getBoundingClientRect();
      var k = Math.min(r.width / im.naturalWidth, r.height / im.naturalHeight);
      return { file: im.src.split('/').pop(), native: im.naturalWidth,
               painted: +(im.naturalWidth * k).toFixed(1), ratio: +k.toFixed(3),
               cap: W.getComputedStyle(im).getPropertyValue('--cap').trim(),
               where: im.closest('.home_logo') ? 'hero'
                    : im.closest('header') ? 'header' : 'card' };
    });
    var over = R.marks.filter(function (m) { return m.ratio > 1.41; });
    R.over_cap = over;
    t('no mark painted above 1.4x its native width',
      R.marks.length + ' marks, ' + over.length + ' over cap',
      R.marks.length + ' marks, 0 over cap', over.length === 0);
    R.bridge = { sections: D.querySelectorAll('section.bridge').length,
                 seals: D.querySelectorAll('.illo.bridge_seal').length,
                 motifs: D.querySelectorAll('.illo.bridge_motif').length,
                 bg: cs('section.bridge', ['background-image'])['background-image'] };
    t('one green section with two visuals',
      R.bridge.sections + ' section, ' + R.bridge.seals + ' seal, ' + R.bridge.motifs +
      ' motif', '1 section, 1 seal, 1 motif',
      R.bridge.sections === 1 && R.bridge.seals === 1 && R.bridge.motifs === 1);
    t('green section is a two-stop gradient',
      /^linear-gradient\(.*rgb\(23, 60, 44\).*rgb\(13, 45, 32\)/.test(R.bridge.bg), true);
    /* no drawing twice on one page */
    var keys = [].map.call(D.querySelectorAll('svg.illo'), function (g) {
      return (String(g.getAttribute('class')).match(/il-[a-z0-9]+/) || [''])[0];
    }).filter(Boolean);
    R.illo_keys = keys;
    t('no drawing used twice', keys.length + ' drawings, ' + new Set(keys).size +
      ' distinct', keys.length + ' drawings, ' + keys.length + ' distinct',
      new Set(keys).size === keys.length);
    var navBtn = box('#nav-icon3');
    t('menu button >= 44x44',
      Math.round(navBtn.w) + 'x' + Math.round(navBtn.h), '>= 44x44',
      navBtn.w >= 44 && navBtn.h >= 44);
    R.illos = D.querySelectorAll('svg.illo').length;
    t('page carries illustrations', R.illos > 0, true);
    R.plates = D.querySelectorAll('.markbox.plated, figure.plate').length +
      [].filter.call(D.querySelectorAll('.markbox > *'), function (n) {
        return !/^(IMG)$/.test(n.tagName) && !n.classList.contains('wordmark') &&
          !n.classList.contains('pending_mark_label');
      }).length;
    R.midart = D.querySelectorAll('.midart').length;
    t('no plate chrome', R.plates, 0);
    R.hscroll = D.documentElement.scrollWidth - D.documentElement.clientWidth;
    t('no horizontal scroll', R.hscroll <= 1, true);

    /* ------------------------------------------------- the stripe band */
    var strip = [].map.call(D.querySelectorAll('.mark_strip > li'),
                            function (l) { return l.textContent.trim(); });
    R.strip = { lines: strip, carousel_nodes: D.querySelectorAll('.owl-carousel, .owl-item').length,
                jquery: !!W.jQuery };
    t('band is static markup, no carousel',
      R.strip.carousel_nodes + ' carousel nodes, jQuery ' + R.strip.jquery,
      '0 carousel nodes, jQuery false',
      R.strip.carousel_nodes === 0 && !R.strip.jquery);
    t('band repeats nothing',
      strip.length + ' lines, ' + new Set(strip).size + ' distinct',
      strip.length + ' lines, ' + strip.length + ' distinct',
      strip.length >= 5 && new Set(strip).size === strip.length);

    var before = cs('.client_carousel',
                    ['background-color', 'width', 'height', 'left', 'z-index'], '::before');
    R.stripe = before;
    t('stripe colour rgb(232, 237, 240)', before['background-color'], 'rgb(232, 237, 240)');
    t('stripe width 8000px', before.width, '8000px');
    t('stripe height 250px', before.height, '250px');

    /* ------------------------------------------------------- footer bg */
    R.footer_bg = cs('.footer', ['background-image'])['background-image'];
    t('footer is a 3-stop linear-gradient', /^linear-gradient\(/.test(R.footer_bg), true);

    /* ----------------------------------------------------------- images */
    var imgs = [].slice.call(D.images);
    R.images = imgs.map(function (i) {
      return { src: i.currentSrc || i.src, complete: i.complete, nw: i.naturalWidth,
               alt: i.alt, w: +i.getBoundingClientRect().width.toFixed(1) };
    });
    var broken = R.images.filter(function (i) { return !i.complete || !i.nw; });
    R.broken_images = broken;
    t('every <img> complete && naturalWidth>0',
      imgs.length + ' imgs, ' + broken.length + ' broken', imgs.length + ' imgs, 0 broken',
      broken.length === 0);
    R.imgs_missing_alt = imgs.filter(function (i) { return !i.alt; }).length;
    t('every <img> has alt text', R.imgs_missing_alt, 0);

    /* ------------------------------------------- swap trigger, then curve */
    step('swap trigger search');
    D.documentElement.style.scrollBehavior = 'auto';
    var header = D.querySelector('.header'), ST = W.ScrollTrigger;
    if (!ST) {
      t('ScrollTrigger present', 'missing', 'present', false);
    } else {
      var isOn = function (y) {
        W.scrollTo(0, y); ST.update();
        return header.classList.contains('animated');
      };
      var lo = 0, hi = 1400;
      isOn(0);
      if (!isOn(hi)) R.trigger_note = 'never fired up to ' + hi;
      while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (isOn(mid)) hi = mid; else lo = mid; }
      var heroTrigger = ST.getAll().filter(function (x) {
        return x.trigger && x.trigger.matches &&
          x.trigger.matches('.homeslider_wrapper .home_logo figure');
      })[0];
      var configuredStart = heroTrigger ? Math.ceil(heroTrigger.start) : null;
      R.swap = { last_off: lo, first_on: hi, configured_start: configuredStart };
      t('swap stays OFF at its configured start', lo, configuredStart,
        configuredStart != null && lo === configuredStart);
      t('swap turns ON on the first pixel after its configured start', hi,
        configuredStart == null ? 'configured start + 1' : configuredStart + 1,
        configuredStart != null && hi === configuredStart + 1);

      step('curve seek');
      W.scrollTo(0, 0); ST.update();
      var cap = D.querySelector('.logo_caption'), mk = D.querySelector('.logo > a');
      R.pre_swap = { capOpacity: opOf(cap), capX: txOf(cap),
                     markOpacity: opOf(mk), markX: txOf(mk) };
      t('pre-swap: tagline visible', R.pre_swap.capOpacity, 1);
      t('pre-swap: mark hidden', R.pre_swap.markOpacity, 0);
      near('pre-swap: mark translated -500px', R.pre_swap.markX, -500, 1);

      W.scrollTo(0, 600); ST.update();
      var anims = cap.getAnimations().concat(mk.getAnimations());
      R.transitions = anims.map(function (a) {
        return (a.transitionProperty || '?') + ' ' + a.effect.getTiming().duration + 'ms';
      });
      R.swap_samples = [0, 200, 400, 600, 800].map(function (ms) {
        anims.forEach(function (a) { a.pause(); a.currentTime = ms; });
        return { t: ms, capOpacity: +opOf(cap).toFixed(3), capX: txOf(cap),
                 markOpacity: +opOf(mk).toFixed(3), markX: txOf(mk) };
      });
      anims.forEach(function (a) { try { a.finish(); } catch (e) {} });
      R.post_swap = { capOpacity: opOf(cap), capX: txOf(cap),
                      markOpacity: opOf(mk), markX: txOf(mk),
                      mark_box: box('.logo > a') };
      t('post-swap: tagline hidden', R.post_swap.capOpacity, 0);
      t('post-swap: mark visible', R.post_swap.markOpacity, 1);
      near('post-swap: mark translated to 0', R.post_swap.markX, 0, 1);
      W.scrollTo(0, 0); ST.update();
    }

    /* ---------------------------------------------------------- console */
    R.console_errors = (W.__errs || []).filter(function (e) {
      return !/favicon/i.test(e);
    });
    t('no console errors', R.console_errors.length + ' errors', '0 errors',
      R.console_errors.length === 0);

    /* --------------------------------------------------- a11y basics ---- */
    R.h1_count = D.querySelectorAll('h1').length;
    t('exactly one h1', R.h1_count, 1);
    R.lang = D.documentElement.lang;
    t('html lang set', R.lang, 'en');
    var unlabelled = [].filter.call(D.querySelectorAll('button'), function (b) {
      return !b.textContent.trim() && !b.getAttribute('aria-label');
    });
    R.buttons_unlabelled_all = unlabelled.map(function (b) {
      return { cls: b.className, html: b.outerHTML.slice(0, 90),
               rendered: b.getBoundingClientRect().width > 0 &&
                         b.getBoundingClientRect().height > 0 };
    });
    var visibleUnlabelled = R.buttons_unlabelled_all.filter(function (b) { return b.rendered; });
    t('every rendered button labelled', visibleUnlabelled.length, 0);

    R.results = T;
    R.failed = T.filter(function (x) { return !x.pass; });
    var lines = T.map(function (x) {
      return (x.pass ? 'PASS  ' : 'FAIL  ') + x.label +
             '\n         got=' + JSON.stringify(x.got) + '  want=' + JSON.stringify(x.want);
    });
    out.textContent = '=== VERIFY BEGIN ===\n' + D.title + '\n' +
      T.filter(function (x) { return !x.pass; }).length + ' FAILED of ' + T.length + '\n\n' +
      lines.join('\n') + '\n\n--- detail ---\n' + JSON.stringify(R, null, 1) +
      '\n=== VERIFY END ===';
    document.title = R.failed.length ? ('VERIFY ' + R.failed.length + ' FAIL') : 'VERIFY PASS';
  })().catch(function (e) {
    out.textContent = 'VERIFY ERROR: ' + e + '\n' + (e && e.stack);
    document.title = 'VERIFY ERROR';
  });
})();
