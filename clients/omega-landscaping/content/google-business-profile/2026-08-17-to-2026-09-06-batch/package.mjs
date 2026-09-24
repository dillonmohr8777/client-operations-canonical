import { posts } from "./data.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
const root=path.resolve(import.meta.dirname);
const rows=[];
for(const p of posts){
 const file=`omega-gbp-${p.date}-${p.slug}.png`;
 const bytes=await fs.readFile(path.join(root,file));
 rows.push({id:p.id,date:p.date,time:p.time,timezone:p.timezone,topic:p.topic,image:file,caption:p.caption,characters:p.caption.length,hashtags:(p.caption.match(/#[A-Za-z0-9]+/g)||[]),sha256:crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase()});
}
const header=["date","time","timezone","topic","image","caption"];
const esc=v=>`"${String(v).replaceAll('"','""')}"`;
await fs.writeFile(path.join(root,"schedule.csv"),[header.join(','),...rows.map(r=>header.map(k=>esc(r[k])).join(','))].join('\r\n'),'utf8');
await fs.writeFile(path.join(root,"manifest.json"),JSON.stringify({schemaVersion:"omega-gbp-batch/v1",clientId:"omega-landscaping",businessProfile:{name:"Omega Landscaping & Concrete LLC",identifier:"90271358283451967"},cadence:"4 posts per week for 3 weeks",scheduleState:"blocked-manager-access-not-posted",generatedAt:new Date().toISOString(),logo:{file:"assets/omega-logo-official.png",sha256:crypto.createHash("sha256").update(await fs.readFile(path.join(root,"assets/omega-logo-official.png"))).digest("hex").toUpperCase()},posts:rows},null,2),'utf8');
const dates=rows.map(r=>`| ${r.id} | ${r.date} | ${r.time} ${r.timezone} | ${r.topic} | \`${r.image}\` |`).join('\n');
const details=rows.map(r=>`## ${r.id}. ${r.topic}\n\n**Scheduled:** ${r.date} at ${r.time} ${r.timezone}\n\n**Image:** \`${r.image}\`\n\n${r.caption}`).join('\n\n');
await fs.writeFile(path.join(root,"README.md"),`# Omega Google Business Profile: 12-post batch\n\nStatus: Creative complete and verified. Publishing blocked because the available Google accounts do not expose manager controls for business profile 90271358283451967. Nothing in this batch has been posted or scheduled.\n\nCadence: four posts per week for three weeks.\n\n| # | Date | Time | Topic | Asset |\n| --- | --- | --- | --- | --- |\n${dates}\n\n${details}\n`,'utf8');
console.log(JSON.stringify({rows:rows.length,maxCaption:Math.max(...rows.map(r=>r.characters)),minCaption:Math.min(...rows.map(r=>r.characters)),hashes:rows.length},null,2));
