'use strict';
function unpack(result) {
  if (!result || result.isError) throw Error('Connector response failed');
  return JSON.parse(result.content[0].text);
}
function parseChannel(result) {
  const {messages,pagination_info}=unpack(result);
  const blocks=messages.split(/(?=^=== Message from )/m).filter(s=>s.startsWith('=== Message from '));
  return {more:pagination_info.includes('cursor'),records:blocks.map(b=>{
    const h=b.match(/^=== Message from (.*?) at (.*?) ===[ \t]*\nMessage TS: ([0-9.]+)\n/);
    if(!h)throw Error('Unrecognized channel message header');
    return {ts:h[3],author:h[1],display_time:h[2],body:b.slice(h[0].length).replace(/\n(?:Reactions:|Thread:)[^\n]*/g,'').trim(),reply_count:Number(b.match(/^Thread: (\d+) replies/m)?.[1]||0)};
  })};
}
function parseThread(result) {
  const {messages,pagination_info}=unpack(result);
  const re=/^From: (.*?)\nTime: (.*?)\nMessage TS: ([0-9.]+)\n([\s\S]*?)(?=^--- Reply |^=== THREAD REPLIES|\s*$)/gm;
  // Boundaries use explicit thread delimiters, not empty lines in a message.
  const chunks=messages.split(/(?:^=== THREAD PARENT MESSAGE ===\s*\n|^=== THREAD REPLIES[^\n]*\n|^--- Reply [^\n]*---\s*\n)/m);
  const records=[];
  for(const b of chunks) {
    const h=b.match(/^\s*From: (.*?)\nTime: (.*?)\nMessage TS: ([0-9.]+)\n/);
    if(h)records.push({ts:h[3],author:h[1],display_time:h[2],body:b.slice(h[0].length).replace(/\nReactions:[^\n]*/g,'').trim(),reply_count:0});
  }
  if(!records.length && /Message TS:/.test(messages))throw Error('Unrecognized thread format');
  return {more:pagination_info.includes('cursor'),records};
}
function sensitive(text) {
  return /password|passwd|passcode|\bpwd\b|\botp\b|verification code|authentication code|one.time code|recovery code|backup code|api[ _-]?key|client[ _-]?secret|access[ _-]?token|auth[ _-]?token|private[ _-]?key|credentials|(?:wp|wordpress|admin|account).{0,12}login|\blogin.{0,12}(?:detail|info)|\bssn\b|social security|credit.card.number|-----BEGIN|\bxox[baprs]-|\bsk-[A-Za-z0-9]/i.test(text)
    || (/^\S{12,150}$/.test(text.trim()) && /[a-z]/.test(text) && /[A-Z]/.test(text) && /\d/.test(text));
}
function sanitize(text) {
  if(sensitive(text))return {text:'[Message withheld: authentication, secret-like, or highly sensitive content. Consult the original Slack source with authorized access.]',withheld:true};
  let output=text.replace(/<@([^>|]+)(?:\|([^>]+))?>/g,(_,id,name)=>name||'Slack user '+id)
    .replace(/<#([^>|]+)(?:\|([^>]+))?>/g,(_,id,name)=>'#'+(name||id))
    .replace(/<![^>]+>/g,'[channel mention]')
    .replace(/<((?:https?:\/\/)[^>|]+)(?:\|([^>]+))?>/g,(_,url,label)=>(label?label+' ': '')+url);
  output=output.replace(/https?:\/\/[^\s<>]+/g,u=>{
    try {const x=new URL(u); if(x.username||x.password)return '[credential-bearing URL removed]';x.search='';x.hash='';return x.toString();}catch{return '[malformed URL removed]';}
  }).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email redacted]')
    .replace(/(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g,'[phone redacted]')
    .replace(/\b\d{10,15}\b/g,'[long number redacted]')
    .replace(/\b(?:sk|pk)[-_][A-Za-z0-9_-]{16,}|\bAIza[A-Za-z0-9_-]{20,}|\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[token redacted]')
    .replace(/[A-Za-z0-9+/=_-]{28,}/g,(s)=>/[A-Z]/.test(s)&&/[a-z]/.test(s)&&/\d/.test(s)?'[opaque identifier redacted]':s)
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return {text:output,withheld:false};
}
module.exports={unpack,parseChannel,parseThread,sensitive,sanitize};
if(typeof require!=='undefined'&&require.main===module) {
 const assert=require('node:assert/strict');
 assert(sanitize('password: example-fixture-only').withheld);
 assert(sanitize('One-time code 123456').withheld);
 assert.equal(sanitize('Email person@example.org or (555) 123-4567').text,'Email [email redacted] or [phone redacted]');
 assert.equal(sanitize('See https://example.org/page?token=secret').text,'See https://example.org/page');
 assert.equal(sanitize('pause ads on 2026-09-16').withheld,false);
 const fake=s=>({content:[{text:JSON.stringify({messages:s,pagination_info:'There are no more messages.'})}]});
 assert.equal(parseChannel(fake('=== Message from Test at 2026-09-20 10:00:00 EDT === \nMessage TS: 1.000001\nOne\n\nTwo\nThread: 1 replies\n')).records[0].body,'One\n\nTwo');
 assert.equal(parseThread(fake('=== THREAD PARENT MESSAGE ===\nFrom: Test\nTime: Today\nMessage TS: 1.000001\nFirst\n\n=== THREAD REPLIES (1 total) ===\n\n--- Reply 1 of 1 ---\nFrom: Other\nTime: Today\nMessage TS: 1.000002\nSecond\n\nParagraph')).records.length,2);
 console.log('feed_transform checks PASS');
}
