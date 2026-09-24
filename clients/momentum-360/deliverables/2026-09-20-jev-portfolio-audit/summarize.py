"""Build local draft review files from completed model receipts; no network or mutations."""
import csv, json, statistics
from pathlib import Path

BASE=Path(__file__).parent
E=BASE/'evidence'
def load(name): return json.loads((E/name).read_text(encoding='utf-8-sig'))
def lines(name): return [json.loads(x) for x in (E/name).read_text(encoding='utf-8-sig').splitlines() if x.strip()]
data=load('benchmark-input.json')['rows']
results=lines('benchmark-results.jsonl')
index={(x['id'],x['model']):x for x in results}
assert len(index)==len(results)==400, 'Incomplete or duplicated benchmark'
assert len({x['id'] for x in data})==200
models=['typesafe-ai/jev','openai/gpt-5.6-luna']
summary={}
for model in models:
    rows=[x for x in results if x['model']==model]
    summary[model]={'rows':len(rows),'valid':sum(x.get('valid',False) for x in rows),'median_ms':statistics.median(x['elapsedMs'] for x in rows),'serial_seconds':sum(x['elapsedMs'] for x in rows)/1000,'billed_usd':sum(float(x['costUsd']) for x in rows)}
disagreements=[]
review=[]
for d in data:
    j,l=[index[d['id'],m] for m in models]
    same=j['label']==l['label']
    if not same: disagreements.append({**d,'jev':j['label'],'probability':j['probability'],'luna':l['label']})
    # No model label directly authorizes an exclusion. Historical exclusion status prevents duplicate work.
    if d['status']=='EXCLUDED': disposition='already_excluded; no_duplicate_change'
    elif not j['valid'] or not l['valid'] or not same or j['probability']<0.9: disposition='review_required'
    elif j['label']=='buyer': disposition='retain_candidate'
    else: disposition='review_required'
    review.append({**d,'jev':j['label'],'jev_probability':j['probability'],'luna':l['label'],'disposition':disposition,'apply':False})
assert not any(r['apply'] for r in review)
assert all(r['disposition'].startswith('already_excluded') for r in review if r['status']=='EXCLUDED')
initial=lines('benchmark-initial-token-limit.jsonl')
initial_luna=[r for r in initial if r['model']==models[1]]
summary.update({'agreement_count':200-len(disagreements),'agreement_fraction':(200-len(disagreements))/200,'median_speed_ratio_luna_over_jev':summary[models[1]]['median_ms']/summary[models[0]]['median_ms'],'initial_luna_configuration':{'maxOutputTokens':20,'attempts':len(initial_luna),'invalid_outputs':sum(not r.get('valid',False) for r in initial_luna),'billed_usd':sum(float(r.get('costUsd') or 0) for r in initial_luna)},'total_trial_billed_usd_including_initial_attempts':sum(float(r['costUsd']) for r in results)+sum(float(r.get('costUsd') or 0) for r in initial_luna),'limits':'Single serial run. Nonrandom top-cost historical rows. Agreement is not accuracy. Jev probability is not calibrated accuracy. Jev gateway cost reported 0; no general free-price or production-throughput claim. Luna final control used maxOutputTokens 512 and reasoningEffort none. Initial short token limit produced incomplete labels; preserved separately and excluded from quality/speed comparison.'})
(E/'benchmark-summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
(E/'disagreements.json').write_text(json.dumps(disagreements,indent=2),encoding='utf-8')
with (BASE/'search-term-review.csv').open('w',newline='',encoding='utf-8-sig') as f:
    writer=csv.DictWriter(f,fieldnames=list(review[0]));writer.writeheader();writer.writerows(review)
print(json.dumps(summary,indent=2))
print(json.dumps(disagreements,indent=2))
