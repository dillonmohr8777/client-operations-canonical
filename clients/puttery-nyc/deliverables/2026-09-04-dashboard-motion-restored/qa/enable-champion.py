from pathlib import Path
import json,shutil
root=Path(__file__).resolve().parents[1]
video=root/'assets/puttery-champion-intro.mp4'
poster=root/'assets/puttery-champion-intro.jpg'
if not video.is_file() or not poster.is_file():
 raise SystemExit('Not enabled: parent must verify champion MP4 and JPG in assets first.')
cfg={'champion':{'src':'assets/'+video.name,'poster':'assets/'+poster.name,'strikeTime':2.7,'revealEnd':4.0,'logoX':64,'logoY':48,'settleMs':650}}
loop=root/'assets/puttery-golf-loop.mp4'
if loop.is_file():
 cfg['loop']={'src':'assets/'+loop.name}
 if (root/'assets/puttery-golf-loop.jpg').is_file():cfg['loop']['poster']='assets/puttery-golf-loop.jpg'
(root/'media.js').write_text('window.PUTTERY_INTRO_MEDIA = '+json.dumps(cfg,indent=2)+';\n',encoding='utf-8')
shutil.copy2(root/'qa/champion-intro.draft.js',root/'champion-intro.js')
css=(root/'styles.css').read_text(encoding='utf-8')
marker='/* One new user-directed focal sequence; the original full page motion remains. */'
if marker not in css:
 css+='\n'+(root/'qa/champion-intro.draft.css').read_text(encoding='utf-8')
 (root/'styles.css').write_text(css,encoding='utf-8')
h=(root/'index.html').read_text(encoding='utf-8')
if '<script src="champion-intro.js"></script>' not in h:
 h=h.replace('  </head>','    <script src="media.js"></script>\n    <script src="champion-intro.js"></script>\n  </head>')
 h=h.replace('window.playPutteryIntro = function (force) {','''window.playPutteryIntro = function (force, bypassChampion) {
        if (!bypassChampion && window.PUTTERY_INTRO_MEDIA?.champion && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
          var championKey = "putteryChampionIntroSeen20260904";
          try { if (!force && localStorage.getItem(championKey) === "1") return; } catch (_) {}
          var started = window.playPutteryChampionIntro({
            onStarted: function () { try { localStorage.setItem(championKey, "1"); } catch (_) {} },
            onFallback: function () { window.playPutteryIntro(true, true); }
          });
          if (started) return;
        }''')
 (root/'index.html').write_text(h,encoding='utf-8')
print('Champion wiring enabled in root only. Review actual video timing, then package the verified asset and new JS files.')
