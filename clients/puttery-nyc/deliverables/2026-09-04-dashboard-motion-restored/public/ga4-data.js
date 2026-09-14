(() => {
  'use strict';
  const text=(id,value)=>{document.getElementById(id).textContent=value;};
  const fmt=n=>Number.isSafeInteger(n)&&n>=0?n.toLocaleString('en-US'):'Unavailable';
  function table(id,rows,columns){
    const body=document.getElementById(id);body.replaceChildren();
    for(const row of rows){const tr=document.createElement('tr');columns.forEach((key,i)=>{const cell=document.createElement(i?'td':'th');if(!i)cell.scope='row';cell.textContent=typeof row[key]==='number'?fmt(row[key]):row[key];tr.append(cell);});body.append(tr);}
  }
  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const response=await fetch('ga4-summary.json',{cache:'no-store'});if(!response.ok)throw new Error();const d=await response.json();
      if(d.schemaVersion!==1||d.businessId!=='37824'||d.propertyId!=='276233773'||d.streamId!=='2658813519'||d.timeZone!=='America/Chicago'||!Number.isFinite(Date.parse(d.checkedAt))||Date.parse(d.checkedAt)>Date.now()+60000)throw new Error();
      for(const r of Object.values(d.reports)){
        if(!Array.isArray(r.rows)||r.rows.length>10000)throw new Error();
        for(const row of r.rows){if(!['www.puttery.com','www.exploretock.com'].includes(row.hostName))throw new Error();for(const [k,v] of Object.entries(row))if(['eventCount','screenPageViews','totalUsers'].includes(k)&&(!Number.isSafeInteger(v)||v<0))throw new Error();}
      }
      const stale=Date.now()-Date.parse(d.checkedAt)>36*3600000;
      text('ga4-freshness',`${stale?'Stale extract':'Published extract'} · ${d.start} through ${d.end} · ${d.timeZone}. Retrieved ${d.checkedAt}. Not an automatic GA4 feed.`);
      text('ga4-binding',`Property ${d.propertyId} · Stream ${d.streamId} · ${d.measurementId}`);text('ga4-definitions',d.definitions);
      const events=d.reports.events.rows;
      text('ga4-web-views',fmt(events.find(r=>r.hostName==='www.puttery.com'&&r.eventName==='page_view')?.eventCount));
      text('ga4-tock-views',fmt(events.find(r=>r.hostName==='www.exploretock.com'&&r.eventName==='page_view')?.eventCount));
      text('ga4-purchases',fmt(events.find(r=>r.hostName==='www.exploretock.com'&&r.eventName==='purchase')?.eventCount));
      table('ga4-channels',d.reports.channels.rows,['hostName','sessionDefaultChannelGroup','screenPageViews','totalUsers']);
      table('ga4-events',events,['hostName','eventName','eventCount']);
      table('ga4-daily',d.reports.daily.rows.toSorted((a,b)=>a.date.localeCompare(b.date)||a.hostName.localeCompare(b.hostName)),['date','hostName','screenPageViews','totalUsers']);
      const warnings=Object.entries(d.reports).filter(([,r])=>Object.values(r.metadata).some(Boolean)).map(([k])=>k);
      text('ga4-quality',warnings.length?`GA4 quality flags present: ${warnings.join(', ')}. Interpret counts with caution.`:'GA4 returned complete row sets with no reported sampling, thresholding or other-row loss flags.');
      const link=document.getElementById('ga4-download');link.href='ga4-summary.json';link.hidden=false;
      link.addEventListener('click',event=>{
        event.preventDefault();
        const url=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)+'\n'],{type:'application/json'}));
        const anchor=document.createElement('a');anchor.href=url;anchor.download='puttery-nyc-ga4-aggregate.json';document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      });
    }catch{text('ga4-freshness','GA4 extract unavailable or invalid. No substitute counts are shown.');}
  });
})();
