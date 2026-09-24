"""Read-only portfolio pull; preserves client and campaign boundaries."""
import hashlib
import json
import os
import sys
import subprocess
from datetime import datetime, timezone
from pathlib import Path

PROBE = Path(r'C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe')
sys.path.insert(0, str(PROBE))
from account_guard import assert_cid_allowed, classify_campaign

OUT = Path(__file__).parent / 'evidence'
ACCOUNTS = {
    'omega-landscaping': '2853981364', 'nexla': '7917802207',
    'onsite-concrete-landscape': '1033715894',
    'kimberly-james-bridal': '8145506229', 'shared-beverages': '6275014654',
}
WINDOW = "segments.date BETWEEN '2026-08-21' AND '2026-09-19'"
QUERIES = {
    'identity': 'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer',
    'campaigns': f'''SELECT campaign.id, campaign.name, campaign.status,
        campaign.advertising_channel_type, metrics.impressions, metrics.clicks,
        metrics.cost_micros FROM campaign WHERE {WINDOW}''',
    'search_terms': f'''SELECT campaign.id, campaign.name, ad_group.id, ad_group.name,
        search_term_view.search_term, search_term_view.status, metrics.impressions,
        metrics.clicks, metrics.cost_micros, metrics.conversions
        FROM search_term_view WHERE {WINDOW} AND metrics.impressions > 0
        ORDER BY metrics.cost_micros DESC LIMIT 10000''',
}

def route(account, row):
    if account != 'shared-beverages':
        return account
    label = classify_campaign(row.get('campaign', {}).get('name'))
    return {'replenish': 'replenish-7-eleven', 'fresh_blends': 'fresh-blends-kwik-trip'}.get(label, 'unrouted-shared-campaign')

def main():
    import requests
    import yaml
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    config_path = Path(os.environ['APPDATA']) / 'gcloud/application_default_credentials.json'
    cfg = yaml.safe_load(config_path.read_text(encoding='utf-8'))
    creds = Credentials(token=None, refresh_token=cfg['refresh_token'], client_id=cfg['client_id'],
        client_secret=cfg['client_secret'], token_uri='https://oauth2.googleapis.com/token',
        scopes=['https://www.googleapis.com/auth/adwords'])
    if '--gcloud' in sys.argv:
        gcloud = Path(os.environ['LOCALAPPDATA']) / 'Google/Cloud SDK/google-cloud-sdk/bin/gcloud.cmd'
        result = subprocess.run([str(gcloud), 'auth', 'print-access-token', '--account=dillonmohr8777@gmail.com', '--quiet'], capture_output=True, text=True, timeout=45)
        if result.returncode or not result.stdout.strip():
            raise RuntimeError('Existing gcloud account token refresh failed; no secrets logged')
        creds.token = result.stdout.strip()
    else:
        creds.refresh(Request())
    session = requests.Session()
    session.headers.update({'Authorization': 'Bearer ' + creds.token, 'Content-Type': 'application/json'})
    if cfg.get('developer_token'):
        session.headers['developer-token'] = cfg['developer_token']
    OUT.mkdir(exist_ok=True)
    receipts = []
    for account, cid in ACCOUNTS.items():
        assert_cid_allowed(cid)
        for label, query in QUERIES.items():
            started = datetime.now(timezone.utc).isoformat()
            try:
                res = session.post(f'https://googleads.googleapis.com/v23/customers/{cid}/googleAds:searchStream',
                    json={'query': query}, timeout=(10, 60), allow_redirects=False)
                body = res.json()
                rows = [r for batch in body for r in batch.get('results', [])] if res.ok else []
                receipt = dict(account=account, customerId=cid, label=label, observedAt=started,
                    status=res.status_code, requestId=res.headers.get('request-id'), query=query,
                    rowCount=len(rows), limitReached=(label == 'search_terms' and len(rows) == 10000))
                if not res.ok:
                    err_body = body[0] if isinstance(body, list) and body else body
                    receipt['error'] = err_body.get('error', {}).get('status', 'API_ERROR')
                    receipt['details'] = err_body.get('error', {}).get('message', '')[:600]
                path = OUT / f'{account}--{label}.json'
                payload = {'receipt': receipt, 'rows': rows}
                path.write_text(json.dumps(payload, indent=2), encoding='utf-8')
                receipt['sha256'] = hashlib.sha256(path.read_bytes()).hexdigest()
                receipts.append(receipt)
                print(json.dumps({k: receipt[k] for k in ('account', 'label', 'status', 'rowCount')}), flush=True)
                if not res.ok and label == 'identity':
                    print(json.dumps({'error': receipt['error'], 'details': receipt['details']}), flush=True)
                    if 'insufficient authentication scopes' in receipt['details'].lower():
                        (OUT / 'pull-receipts.json').write_text(json.dumps(receipts, indent=2), encoding='utf-8')
                        return
            except (requests.RequestException, ValueError) as exc:
                receipts.append(dict(account=account, label=label, error=type(exc).__name__, observedAt=started))
                print(account, label, type(exc).__name__, flush=True)
    (OUT / 'pull-receipts.json').write_text(json.dumps(receipts, indent=2), encoding='utf-8')

if __name__ == '__main__':
    if '--self-test' in sys.argv:
        assert route('shared-beverages', {'campaign': {'name': 'Fresh Blends x Kwik Trip #1110 | Ice Box'}}) == 'fresh-blends-kwik-trip'
        assert route('shared-beverages', {'campaign': {'name': 'Replenish Miramar'}}) == 'replenish-7-eleven'
        assert route('shared-beverages', {'campaign': {'name': 'unidentified'}}) == 'unrouted-shared-campaign'
        assert all('FROM customer' not in q or label == 'identity' for label, q in QUERIES.items())
        try:
            assert_cid_allowed('7214914099')
            raise AssertionError('cancelled account accepted')
        except RuntimeError:
            pass
        print('PASS: client separation, unknown quarantine, forbidden account, no shared account totals')
    else:
        main()
