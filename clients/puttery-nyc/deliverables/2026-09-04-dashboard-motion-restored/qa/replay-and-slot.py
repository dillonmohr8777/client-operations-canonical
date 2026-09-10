from pathlib import Path
root=Path(__file__).resolve().parents[1]
h=(root/'index.html').read_text(encoding='utf-8')
h=h.replace('(function () {\n        try {','window.playPutteryIntro = function (force) {\n        try {',1)
h=h.replace('if (localStorage.getItem("putteryIntroSeenMotionRestored20260904") === "1") return;', 'if (!force && localStorage.getItem("putteryIntroSeenMotionRestored20260904") === "1") return;',1)
h=h.replace('        var intro = document.createElement("div");','        var previousIntro = document.querySelector(".pilot-intro");\n        if (previousIntro) previousIntro.remove();\n        var intro = document.createElement("div");',1)
h=h.replace('      })();\n    </script>','      };\n      window.playPutteryIntro(false);\n    </script>',1)
h=h.replace('<button class="action-button secondary" id="motion-toggle"', '<button class="action-button secondary" id="replay-intro" type="button">Replay intro</button>\n        <button class="action-button secondary" id="motion-toggle"',1)
h=h.replace('        <div class="rail-status">', '''        <div class="rail-golf-loop" data-golf-loop-slot aria-hidden="true">
          <div class="rail-golf-fallback"><span class="rail-putt-line"></span><span class="rail-golf-ball"></span><span class="rail-golf-cup"></span></div>
        </div>
        <div class="rail-status">''',1)
(root/'index.html').write_text(h,encoding='utf-8')
j=(root/'app.js').read_text(encoding='utf-8')
j=j.replace('  const control = document.querySelector("#motion-toggle");', '''  const control = document.querySelector("#motion-toggle");
  const replay = document.querySelector("#replay-intro");
  replay.addEventListener("click", () => window.playPutteryIntro(true));
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    replay.disabled = true;
    replay.title = "Intro motion follows your reduced-motion preference.";
  }''',1)
j=j.replace('document.querySelectorAll(".hole-mark").forEach(mark => view.observe(mark));','document.querySelectorAll(".hole-mark,.rail-golf-loop").forEach(mark => view.observe(mark));')
(root/'app.js').write_text(j,encoding='utf-8')
c=(root/'styles.css').read_text(encoding='utf-8')
c+='''
/* Small golf motion reserve. A verified generated loop may replace this
   geometry; original ornaments and choreography remain untouched. */
.topbar-actions{flex-wrap:wrap}
.action-button:disabled{opacity:.6;cursor:not-allowed}
.rail-golf-loop{position:relative;flex:0 0 auto;height:84px;margin-top:26px;overflow:hidden}
.rail-golf-fallback{position:relative;height:100%;width:100%}
.rail-putt-line{position:absolute;left:8px;right:8px;top:50px;height:1px;background:var(--teal);opacity:.65}
.rail-golf-ball{position:absolute;top:34px;left:12px;width:20px;height:20px;border-radius:50%;background:var(--white);border:2px solid var(--black);box-shadow:0 5px 9px rgba(0,0,0,.35);animation:rail-putt 6s var(--ease-course) infinite both}
.rail-golf-cup{position:absolute;right:12px;top:47px;width:24px;height:7px;border:2px solid var(--pink);border-radius:50%;background:var(--black)}
@keyframes rail-putt{0%,20%{transform:translateX(0) rotate(0);opacity:1}72%,84%{transform:translateX(118px) rotate(360deg);opacity:1}92%,100%{transform:translateX(118px) scale(.2);opacity:0}}
.rail-golf-loop.motion-offscreen *{animation-play-state:paused!important}
.rail-golf-loop video{width:100%;height:100%;object-fit:contain;display:block}
@media(max-width:980px){.rail-golf-loop{display:none}}
@media(prefers-reduced-motion:reduce){.rail-golf-ball{animation:none!important;left:48%}}
'''
(root/'styles.css').write_text(c,encoding='utf-8')
print('Original intro now replayable; ancillary release key versioned; decorative side slot ready.')
