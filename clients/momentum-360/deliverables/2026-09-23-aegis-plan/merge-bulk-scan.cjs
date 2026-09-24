const fs = require('node:fs');
const path = require('node:path');
const dir = __dirname;
function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'scriptSrc').map(([k,v])=>[k,sanitize(v)]));
  if (typeof value === 'string') return value.replace(/([?&](?:api[_-]?key|access[_-]?token|token|secret|password|_wpnonce|nonce)=)[^&#\s]*/gi, '$1[redacted]');
  return value;
}
const files = ['bulk-scan-pages.json', ...fs.readdirSync(dir).filter(n=>/^bulk-scan-part-\d+b?\.json$/.test(n)).sort()];
const merged = new Map();
for (const name of files) {
  const file = path.join(dir,name);
  const rows = sanitize(JSON.parse(fs.readFileSync(file,'utf8')));
  fs.writeFileSync(file, JSON.stringify(rows,null,2)+'\n');
  for (const row of rows) {
    const key = row.url || row.requestedUrl;
    if (key && (!merged.has(key) || (row.title && !merged.get(key).title))) merged.set(key,row);
  }
}
const rows = [...merged.values()];
fs.writeFileSync(path.join(dir,'bulk-scan-merged.json'),JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify({sourceFiles:files.length,uniqueFinalUrls:rows.filter(r=>r.url&&r.title).length,blockedOrIncomplete:rows.filter(r=>!r.url||!r.title||r.blocked).length,output:'bulk-scan-merged.json',unusedScriptSourcesRemoved:true}));
