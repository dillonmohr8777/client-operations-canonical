import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const html=readFileSync(new URL('../2026-09-04-dashboard-motion-restored/public/index.html',import.meta.url),'utf8');
const script=html.match(/<script>\s*(window\.playPutteryIntro[\s\S]*?)<\/script>/)[1];
for(const seen of [null,'1'])for(const reduced of [false,true]){
  let starts=0;
  const window={PUTTERY_INTRO_MEDIA:{champion:{}},playPutteryChampionIntro(){starts++;return true;}};
  const context={window,matchMedia:()=>({matches:reduced}),localStorage:{getItem:()=>seen,setItem(){}}};
  runInNewContext(script,context);
  assert.equal(starts,reduced?0:1,`initial load seen=${seen} reduced=${reduced}`);
  window.playPutteryIntro(false);
  assert.equal(starts,reduced?0:2,'returning load must not skip');
}
console.log('PASS: fresh and returning intro startup; reduced motion skips both.');
