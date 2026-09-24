const fs=require('node:fs');const path=require('node:path');
const sharp=require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 for(const aspect of ['16x9','9x16']){
  const width=aspect==='16x9'?384:180, height=aspect==='16x9'?216:320;
  const layers=[];
  const id='ai04-'+aspect;
  for(const [col,frame]of [42,165,282,390,539].entries()){
   const input=await sharp(path.join(__dirname,'qa',id,'navy_'+frame+'.png')).resize(width,height).toBuffer();
   layers.push({input,left:col*width,top:0});
  }
  const svg=Buffer.from(`<svg width="${width*5}" height="26"><rect width="100%" height="100%" fill="#fff"/><text x="8" y="18" font-size="14" fill="#072d53">AI 04: 1.4s / 5.5s / 9.4s / 13s / 17.97s</text></svg>`);
  layers.push({input:svg,left:0,top:height});
  await sharp({create:{width:width*5,height:height+26,channels:3,background:'#fff'}}).composite(layers).png().toFile(path.join(__dirname,'qa',aspect+'-contact.png'));
 }
})().catch(e=>{console.error(e);process.exitCode=1});
