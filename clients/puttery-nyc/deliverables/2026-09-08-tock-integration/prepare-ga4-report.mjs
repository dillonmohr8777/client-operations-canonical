import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const expectedFilter={or_group:{expressions:[{and_group:{expressions:[{filter:{field_name:'hostName',string_filter:{match_type:1,value:'www.puttery.com'}}},{filter:{field_name:'pagePath',string_filter:{match_type:5,value:'^/locations/new-york-city(/.*)?$',case_sensitive:true}}}]}},{and_group:{expressions:[{filter:{field_name:'hostName',string_filter:{match_type:1,value:'www.exploretock.com'}}},{filter:{field_name:'pagePath',string_filter:{match_type:5,value:'^/puttery-new-york(/.*)?$',case_sensitive:true}}}]}}]}};
export function prepare(input){
  assert.equal(input.propertyId,'276233773');assert.equal(input.streamId,'2658813519');assert.equal(input.measurementId,'G-STZ72WP326');
  const output={schemaVersion:1,businessId:'37824',propertyId:input.propertyId,streamId:input.streamId,measurementId:input.measurementId,timeZone:'America/Chicago',refreshMode:'published-extract',reports:{}};
  for(const [key,dimensions,metrics] of [['events',['hostName','eventName'],['eventCount']],['channels',['hostName','sessionDefaultChannelGroup'],['screenPageViews','totalUsers']],['daily',['date','hostName'],['screenPageViews','totalUsers']]]){
    const {query,checkedAt,data}=input.reports[key];
    assert.equal(String(query.property_id),input.propertyId);assert.deepEqual(query.dimension_filter,expectedFilter);
    assert.deepEqual(query.dimensions,dimensions);assert.deepEqual(query.metrics,metrics);
    assert.deepEqual(data.dimension_headers.map(x=>x.name),dimensions);assert.deepEqual(data.metric_headers.map(x=>x.name),metrics);
    assert.equal(data.metadata.time_zone,output.timeZone);assert.equal(data.rows.length,data.row_count);assert.ok(data.rows.length<=10000);
    assert.ok(Number.isFinite(Date.parse(checkedAt))&&Date.parse(checkedAt)<=Date.now()+60000);
    const period=query.date_ranges[0];assert.equal(query.date_ranges.length,1);
    for(const date of [period.start_date,period.end_date])assert.match(date,/^\d{4}-\d{2}-\d{2}$/);
    assert.ok(period.start_date<=period.end_date);
    if(output.start)assert.deepEqual([period.start_date,period.end_date],[output.start,output.end]);
    output.start=period.start_date;output.end=period.end_date;
    const rows=data.rows.map(row=>{
      const result={};
      dimensions.forEach((name,i)=>{const value=row.dimension_values[i].value;assert.ok(typeof value==='string'&&value.length<=100);if(name==='hostName')assert.ok(['www.puttery.com','www.exploretock.com'].includes(value));if(name==='date')assert.match(value,/^\d{8}$/);result[name]=value;});
      metrics.forEach((name,i)=>{const value=Number(row.metric_values[i].value);assert.ok(Number.isSafeInteger(value)&&value>=0);result[name]=value;});return result;
    });
    output.reports[key]={checkedAt,rows,metadata:{sampling:data.metadata.sampling_metadatas?.length>0,otherRowLoss:data.metadata.data_loss_from_other_row===true,thresholded:data.metadata.subject_to_thresholding===true}};
  }
  for(const host of ['www.puttery.com','www.exploretock.com']){
    const views=output.reports.events.rows.find(x=>x.hostName===host&&x.eventName==='page_view')?.eventCount??0;
    for(const key of ['channels','daily'])assert.equal(output.reports[key].rows.filter(x=>x.hostName===host).reduce((n,x)=>n+x.screenPageViews,0),views);
  }
  output.checkedAt=Object.values(output.reports).map(r=>r.checkedAt).sort()[0];
  output.definitions='NYC page-scoped GA4 activity, not a joined funnel. Website includes /locations/new-york-city and descendants; Tock includes /puttery-new-york and descendants, each on its exact production hostname. Event counts are not unique bookings, completed visits or reconciled revenue. Do not add purchase and reservation events. Users overlap across channels, dates and hosts; do not sum them. GA4 uses Central event dates; Tock uses Eastern service dates. The service-period selector does not change this independently dated extract. Latest days can be revised by GA4 processing.';
  return output;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const output=prepare(JSON.parse(readFileSync(new URL('./ga4-report-input.json',import.meta.url))));
  writeFileSync(new URL('../2026-09-04-dashboard-motion-restored/public/ga4-summary.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({prepared:true,checkedAt:output.checkedAt,rows:Object.fromEntries(Object.entries(output.reports).map(([k,v])=>[k,v.rows.length]))}));
}
