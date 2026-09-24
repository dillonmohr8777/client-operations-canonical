"""Small offline acceptance check and CSV export; no network access."""
import csv, hashlib, json
from pathlib import Path

root=Path(__file__).parent
def read(path): return json.loads((root/path).read_text(encoding='utf-8-sig'))
portfolio=read('portfolio-actions.json')['rows']
registry=json.loads(Path('C:/Users/dillo/Documents/Codex/projects/client-operations/registry/clients.json').read_text(encoding='utf-8-sig'))['clients']
ids=[r['client_id'] for r in portfolio]
assert len(ids)==len(set(ids))==35
assert {r['id'] for r in registry}.issubset(ids), 'Canonical route omitted'
assert all(r['execution_state']=='DRAFT_REVIEW_ONLY' and r['next_action'] and r['acceptance'] and r['source'] for r in portfolio)
assert {r['client_id'] for r in portfolio if r['priority']=='SEPARATE'}=={'align-hcm','bigorange-marketing'}
coverage=read('evidence/slack-coverage.json')['channels']
assert len(coverage)==len({c['id'] for c in coverage})==371
assert all(c['paginationExhausted'] for c in coverage)
assert sum(c['mode']=='channel_history' for c in coverage)==68
assert sum(c.get('messageTimestampOccurrences',0) for c in coverage)==4410
summary=read('evidence/benchmark-summary.json')
assert summary['typesafe-ai/jev']['rows']==summary['openai/gpt-5.6-luna']['rows']==200
assert summary['typesafe-ai/jev']['valid']==summary['openai/gpt-5.6-luna']['valid']==200
assert summary['agreement_count']==156
search=list(csv.DictReader((root/'search-term-review.csv').open(encoding='utf-8-sig')))
assert len(search)==200 and all(r['apply']=='False' for r in search)
assert sum(r['status']=='EXCLUDED' for r in search)==20
assert all(r['disposition'].startswith('already_excluded') for r in search if r['status']=='EXCLUDED')
def safe_cell(v):
    text=str(v)
    return "'"+text if text.lstrip().startswith(('=','+','-','@')) else text
assert safe_cell('=1+1')=="'=1+1" and safe_cell('buyer')=='buyer'
with (root/'portfolio-actions.csv').open('w',newline='',encoding='utf-8-sig') as f:
    writer=csv.DictWriter(f,fieldnames=list(portfolio[0]));writer.writeheader()
    writer.writerows({k:safe_cell(v) for k,v in r.items()} for r in portfolio)
onsite=read('evidence/onsite-live-readback.json')
assert [c['campaign_id'] for c in onsite['campaigns'] if c['status']=='Enabled']==['22454241769']
capsule=read('evidence/capsule-sheet-readback.json')
assert capsule['nonempty_submission_timestamps']==21 and len(capsule['september_timestamps'])==4 and capsule['september_2_or_13_rows']==0
arithmetic={'source':'https://momentum3d.slack.com/archives/C0B3T401W77/p1789910287661309','spend':72.82,'impressions':1061,'leads':2,'reported_avg_cpa':11.14,'reported_avg_cpm':61.52,'derived_account_cpl':round(72.82/2,2),'derived_account_cpm':round(72.82/1061*1000,2),'state':'DEFINITION_RECONCILIATION_REQUIRED','limit':'Average ratios may legitimately differ from ratios of totals. Native metric definitions, attribution and windows not independently verified. Not evidence of lost leads or wasted spend.'}
assert arithmetic['derived_account_cpl']==36.41 and arithmetic['derived_account_cpm']==68.63
(root/'evidence/reporting-definition-check.json').write_text(json.dumps(arithmetic,indent=2),encoding='utf-8')
files=[p for p in root.rglob('*') if p.is_file() and p.suffix in {'.md','.json','.jsonl','.csv','.py','.mjs'} and p.name not in {'validation.json','manifest.json'}]
manifest=[{'file':str(p.relative_to(root)).replace('\\','/'),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
(root/'evidence/manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
result={'state':'PASS','canonical_routes':len(registry),'portfolio_rows':len(portfolio),'known_channels':len(coverage),'benchmark_rows':len(search),'model_calls_final':400,'external_changes':0,'checks':'Complete canonical route coverage, unique IDs, source/acceptance fields, channel cursor completion, exact benchmark counts, excluded-row guards, no auto-apply, live readback values, CSV injection guard and file hashes.'}
(root/'evidence/validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
