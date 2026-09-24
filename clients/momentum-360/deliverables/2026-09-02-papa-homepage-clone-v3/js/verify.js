/* Measurement harness - dev only, loaded by verify.html, never by index.html.
   Re-measures the same things the live desktop spec measured, against the clone
   rendered in a real 1440x900 iframe viewport, and prints the result into
   #verify-out so it can be read back without a JS console. */
(function () {
  'use strict';
  var W = window.__vw || window, D = W.document;
  var out = document.getElementById('verify-out');
  var R = {},
      sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },
      // rAF can be throttled when the pane is not painting; always race a timer
      // so the harness cannot wedge.
      raf = function () { return new Promise(function (r) { W.requestAnimationFrame(r); setTimeout(r, 40); }); };
  function step(s) { out.textContent = 'step: ' + s; }

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
  function txOf(el) { return +(new DOMMatrixReadOnly(W.getComputedStyle(el).transform)).m41.toFixed(1); }
  function opOf(el) { return +W.getComputedStyle(el).opacity; }

  (async function run() {
    step('fonts');
    if (D.fonts && D.fonts.ready) await Promise.race([D.fonts.ready, sleep(5000)]);
    step('settle');
    await sleep(2000);                        // owl init + lottie mount + CDN images
    await raf(); await raf();
    step('measuring');

    R.viewport = { innerWidth: W.innerWidth, innerHeight: W.innerHeight,
                   clientWidth: D.documentElement.clientWidth, dpr: W.devicePixelRatio };
    R.scrollHeight = D.documentElement.scrollHeight;

    R.header = { box: box('.header'),
                 css: cs('.header', ['position', 'height', 'background-color', 'box-shadow', 'z-index']) };
    R.logo = box('.logo');
    R.logo_caption = { box: box('.logo_caption'),
                       h4: cs('.logo_caption h4', ['font-family', 'font-size', 'line-height', 'color']),
                       transition: cs('.logo_caption', ['transition'])['transition'] };
    R.logo_mark_anchor = { box: box('.logo > a'), css: cs('.logo > a', ['width', 'transition', 'opacity', 'transform']) };
    R.logo_mark_svg = box(null, D.querySelector('.logo > a svg'));
    R.container_content_x = box('.header .col-md-12').x;

    R.hero_figure = box('.homeslider_wrapper .home_logo figure');
    R.hero_section = box('.homevideo_box');
    R.hero_css = cs('.homevideo_box', ['margin-top', 'margin-bottom']);
    R.video_man_svg = box(null, D.querySelector('.video_man svg'));

    R.statement_p = { box: box('.aboutinfo_box p'),
                      css: cs('.aboutinfo_box p', ['font-size', 'line-height', 'color', 'font-weight', 'margin-bottom', 'text-transform']) };
    R.learn_more_btn = { box: box('.aboutinfo_box .btn'),
                         css: cs('.aboutinfo_box .btn', ['height', 'border-radius', 'background-color', 'padding-left', 'font-size', 'font-weight']) };
    R.design = { left: box('.design_left'), middle: box('.design_middle'), right: box('.design_right'),
                 left_svg: box(null, D.querySelector('.design_left svg')),
                 middle_svg: box(null, D.querySelector('.design_middle svg')),
                 right_svg: box(null, D.querySelector('.design_right svg')) };
    R.aboutinfo_box = box('.aboutinfo_box');

    R.recent_section = box('.recent_work_wrapper');
    R.recent_h2 = { box: box('.recent_work_wrapper h2'),
                    css: cs('.recent_work_wrapper h2', ['font-size', 'line-height', 'color', 'text-transform', 'padding-bottom', 'font-family']),
                    charSpans: D.querySelectorAll('.recent_work_wrapper h2 .ch').length };
    R.work_imgs = [].map.call(D.querySelectorAll('.recent_work figure img'), function (i) { return box(null, i); });
    R.work_gap_h = +(R.work_imgs[1].x - (R.work_imgs[0].x + R.work_imgs[0].w)).toFixed(2);
    R.work_gap_v = +(R.work_imgs[3].y - (R.work_imgs[0].y + R.work_imgs[0].h)).toFixed(2);
    R.work_imgs_loaded = [].filter.call(D.querySelectorAll('.recent_work figure img'), function (i) { return i.naturalWidth > 0; }).length;
    R.view_more_btn = box('.recent_work_wrapper .text-center .btn');
    R.recent_man = { div: box('.recent_man'), svg: box(null, D.querySelector('.recent_man svg')) };

    R.client_wrapper = box('.client_wrapper');
    R.client_carousel = box('.client_carousel');
    var oi = D.querySelector('.owl-item');
    R.owl_item = { box: box(null, oi), css: cs(oi, ['width', 'margin-right']),
                   count: D.querySelectorAll('.owl-item').length,
                   originals: D.querySelectorAll('.owl-item:not(.cloned)').length,
                   imgs: D.querySelectorAll('.client_carousel img').length,
                   imgs_loaded: [].filter.call(D.querySelectorAll('.client_carousel img'), function (i) { return i.naturalWidth > 0; }).length };
    R.owl_pitch = +(D.querySelectorAll('.owl-item')[1].getBoundingClientRect().x -
                    oi.getBoundingClientRect().x).toFixed(2);
    R.owl_item_inner = { item: box('.client_carousel .item'), figure: box('.client_carousel figure'),
                         img: box('.client_carousel figure img'),
                         figure_css: cs('.client_carousel figure', ['max-width', 'height']),
                         img_css: cs('.client_carousel figure img', ['filter', 'opacity', 'transition']) };
    R.carousel_before = cs('.client_carousel', ['background-color', 'width', 'height', 'left', 'top', 'z-index'], '::before');

    step('owl slide');
    if (W.jQuery) W.jQuery('.client_carousel').trigger('next.owl.carousel');
    await raf(); await raf();
    R.owl_stage = { transition: cs('.owl-stage', ['transition'])['transition'],
                    longhand: cs('.owl-stage', ['transition-property', 'transition-duration', 'transition-timing-function']),
                    inline: D.querySelector('.owl-stage').getAttribute('style') };

    R.services_section = box('.our_services_wrapper');
    R.services_h2 = { box: box('.our_services_wrapper h2'),
                      css: cs('.our_services_wrapper h2', ['font-size', 'line-height', 'color', 'padding-bottom']),
                      markup: D.querySelector('.our_services_wrapper h2').innerHTML.replace(/<span class="ch"[^>]*>|<\/span>/g, '').slice(0, 120),
                      strike_out: !!D.querySelector('.our_services_wrapper .strike_out'),
                      strike_replace_text: (D.querySelector('.strike_replace') || {}).textContent,
                      strike_replace_css: cs('.strike_replace', ['font-family', 'font-size', 'color']) };
    R.services_col_left = box('.our_services_wrapper .content');
    R.services_p = box('.our_services_wrapper .content p');
    R.services_btn = box('.our_services_wrapper .content .btn');
    R.accordion = { box: box('.accordion'),
                    buttons: [].map.call(D.querySelectorAll('.accordion-button'), function (b) { return box(null, b); }),
                    btn_css: cs('.accordion-button', ['height', 'padding-left', 'display', 'font-size', 'font-weight', 'color', 'text-transform']) };
    R.accordion.pitch = +(R.accordion.buttons[1].y - R.accordion.buttons[0].y).toFixed(2);

    R.footer = { box: box('.footer'), bg: cs('.footer', ['background-image'])['background-image'] };
    R.footer_mark_svg = box(null, D.querySelector('.footer .content figure svg'));
    R.footer_h3 = { box: box('.footer h3'),
                    css: cs('.footer h3', ['font-family', 'font-size', 'line-height', 'letter-spacing', 'text-transform', 'color']) };
    R.footer_h2 = { box: box('.footer .content h2'),
                    css: cs('.footer .content h2', ['font-size', 'line-height', 'color', 'font-family']) };
    R.footer_p = box('.footer .content p');
    R.start_today_btn = { box: box('.footer .btn'), css: cs('.footer .btn', ['height', 'border-radius', 'background-color', 'font-size', 'padding-left']) };
    R.footer_man = { div: box('.footer_man'), svg: box(null, D.querySelector('.footer_man svg')) };
    R.copyright = box('.copyright_box p');
    R.mainnav = { box: box('.mainnav_wrapper'),
                  css: cs('.mainnav_wrapper', ['width', 'display', 'background-color', 'position', 'height']),
                  items: [].map.call(D.querySelectorAll('.mainnav_wrapper nav a'), function (a) { return a.textContent.trim(); }) };

    /* ---------------- header swap: trigger point, then the curve ----------------
       The pane throttles rAF when it is not painting, which freezes both GSAP's
       ticker and CSS transitions. Both are therefore driven deterministically:
       ScrollTrigger.update() forces a synchronous scroll evaluation, and the
       transition curve is read by seeking the CSSTransition's currentTime rather
       than by sampling wall-clock frames. */
    step('swap trigger search');
    D.documentElement.style.scrollBehavior = 'auto';
    var header = D.querySelector('.header'), ST = W.ScrollTrigger;
    function isOn(y) { W.scrollTo(0, y); ST.update(); return header.classList.contains('animated'); }
    var lo = 0, hi = 1400;
    isOn(0);
    if (!isOn(hi)) { R.trigger_search_note = 'never fired up to ' + hi; }
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (isOn(mid)) hi = mid; else lo = mid; }
    R.header_swap_trigger_scrollY = { last_off: lo, first_on: hi };
    R.trigger_geometry = { figure_doc_bottom: +(box('.homeslider_wrapper .home_logo figure').y +
                                                box('.homeslider_wrapper .home_logo figure').h).toFixed(2) };

    step('curve seek');
    W.scrollTo(0, 0); ST.update();
    var cap = D.querySelector('.logo_caption'), markEl = D.querySelector('.logo > a');
    R.pre_swap = { capOpacity: opOf(cap), capX: txOf(cap), markOpacity: opOf(markEl), markX: txOf(markEl) };
    W.scrollTo(0, 600); ST.update();          // fires onEnter -> header.animated
    var anims = cap.getAnimations().concat(markEl.getAnimations());
    R.transitions_started = anims.map(function (a) {
      return (a.transitionProperty || '?') + ' ' + (a.effect.getTiming().duration) + 'ms ' +
             (a.effect.getTiming().easing || W.getComputedStyle(cap).transitionTimingFunction);
    });
    var TS = [18, 146, 245, 313, 344, 381, 413, 444, 478, 513, 579, 646, 800];
    R.header_swap_samples = TS.map(function (t) {
      anims.forEach(function (a) { a.pause(); a.currentTime = t; });
      return { t: t, capOpacity: +opOf(cap).toFixed(3), capX: txOf(cap),
               markOpacity: +opOf(markEl).toFixed(3), markX: txOf(markEl) };
    });
    /* The spec table was captured by a rAF sampler whose t0 is the frame on which it
       first saw .animated - one frame before the transition's own start. Re-reading at
       (spec_t - 13ms) removes that sampler lag and should reproduce the table. */
    R.header_swap_samples_lag_adjusted = TS.map(function (t) {
      anims.forEach(function (a) { a.pause(); a.currentTime = Math.max(0, t - 13); });
      return { spec_t: t, capOpacity: +opOf(cap).toFixed(3), capX: txOf(cap),
               markOpacity: +opOf(markEl).toFixed(3), markX: txOf(markEl) };
    });
    anims.forEach(function (a) { try { a.finish(); } catch (e) {} });
    R.header_mark_after_swap = { anchor: box('.logo > a'), svg: box(null, D.querySelector('.logo > a svg')) };
    R.header_mark_viewport_y = +D.querySelector('.logo > a svg').getBoundingClientRect().y.toFixed(2);
    R.header_mark_viewport_x = +D.querySelector('.logo > a svg').getBoundingClientRect().x.toFixed(2);
    R.lottie_svgs = [].map.call(D.querySelectorAll('.wpbdmv-animation svg'), function (sv) {
      return { id: sv.parentNode.id, viewBox: sv.getAttribute('viewBox'),
               w: +sv.getBoundingClientRect().width.toFixed(2), h: +sv.getBoundingClientRect().height.toFixed(2) };
    });

    W.scrollTo(0, 0);
    out.textContent = '=== VERIFY BEGIN ===\n' + JSON.stringify(R, null, 1) + '\n=== VERIFY END ===';
    document.title = 'VERIFY DONE';
  })().catch(function (e) { out.textContent = 'VERIFY ERROR: ' + e + '\n' + (e && e.stack); });
})();
