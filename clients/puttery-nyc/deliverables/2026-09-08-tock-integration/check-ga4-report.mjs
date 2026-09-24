import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepare} from './prepare-ga4-report.mjs';
const input=JSON.parse(readFileSync(new URL('./ga4-report-input.json',import.meta.url)));
const good=prepare(input);assert.equal(good.reports.daily.rows.length,60);
for(const change of [x=>x.propertyId='999',x=>x.reports.events.query.dimension_filter={},x=>x.reports.events.data.row_count++,x=>x.reports.events.data.rows[0].metric_values[0].value='-1',x=>x.reports.daily.data.metadata.time_zone='UTC',x=>x.reports.channels.data.rows[0].metric_values[0].value='1']){
  const bad=structuredClone(input);change(bad);assert.throws(()=>prepare(bad));
}
assert.equal(JSON.stringify(good).includes('dimension_filter'),false);
console.log(JSON.stringify({passed:true,checks:['exact-NYC-scope','property-stream-binding','complete-pagination','nonnegative-counts','timezone','cross-report-pageview-tie','public-aggregate-only']}));
