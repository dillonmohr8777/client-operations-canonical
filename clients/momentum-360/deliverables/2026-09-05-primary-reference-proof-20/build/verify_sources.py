"""Verify reviewed identities, source bytes and prior-build exclusions before release."""
import hashlib
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def name_key(name):
    value = re.sub(r'^the\s+', '', name.lower()).replace('&', 'and')
    value = re.sub(r'\b(llc|inc|ltd|corporation|corp|co)\b\.?', '', value)
    return re.sub(r'[^a-z0-9]', '', value)

def host(url):
    url = url or ''
    return (urlparse(url if '://' in url else 'https://' + url).hostname or '').lower().removeprefix('www.')

def verify(records):
    history = json.loads((ROOT/'sources/prior-build-inventory.json').read_text())
    names = {name_key(x['name']) for x in history['rows']}
    domains = {host(x.get('official', '')) for x in history['rows']} - {''}
    prior_slugs = {x.get('slug') for x in history['rows']} - {None, ''}
    for x in history['rows']:
        match = re.search(r'/sites/([^/]+)', x.get('live_site', ''))
        if match: prior_slugs.add(match.group(1))
    reviews = json.loads((ROOT/'sources/logo-review.json').read_text())
    reviewed = {r['slug']:r for r in reviews['records']}
    evidence, seen = [], set()
    for r in records:
        assert name_key(r['name']) not in names, f'Previously built name: {r["name"]}'
        assert host(r['website']) not in domains, f'Previously built domain: {r["website"]}'
        assert r['slug'] not in prior_slugs, f'Previously built slug: {r["slug"]}'
        assert host(r['website']) not in seen, 'Duplicate official domain'
        seen.add(host(r['website']))
        p = (ROOT/r['logo_local']).resolve()
        assert p.is_relative_to((ROOT/'sources').resolve())
        review = reviewed[r['slug']]
        assert hashlib.sha256(p.read_bytes()).hexdigest() == review['source_sha256'] == r['logo_sha256'], 'Logo changed after review'
        assert p.stat().st_size == review['bytes']
        if review['image_format'] != 'svg':
            im = Image.open(p)
            assert list(im.size) == [review['width'], review['height']]
            assert im.convert('RGBA').getchannel('A').getextrema()[0] < 255, 'Opaque logo'
        else:
            assert not re.search(r'<script|<foreignObject|\bon\w+\s*=|javascript:', p.read_text(encoding='utf-8-sig'), re.I)
        capture = json.loads((ROOT/'sources'/r['slug']/'capture.json').read_text())
        assert capture['status'] == 'fetched' and host(capture['official_url']) == host(r['website']), r['slug']
        assert hashlib.sha256((ROOT/'sources'/r['slug']/'homepage.html').read_bytes()).hexdigest() == capture['page_sha256']
        evidence.append({'website':r['website'], 'business_name':r['name'], 'logo_eligibility':review})
    result = subprocess.run(['node', str(ROOT/'build/logo-eligibility.cjs')], input=json.dumps(evidence), text=True, capture_output=True, check=True)
    decisions = json.loads(result.stdout)
    assert len(decisions) == len(records)
    assert all(x['eligible'] for x in decisions), [(r['name'],d) for r,d in zip(records,decisions) if not d['eligible']]
    return {'count':len(records), 'prior_history_rows':len(history['rows']), 'logo_sha256_verified':True,
            'raster_transparency_verified':True, 'logo_eligibility':[{'slug':r['slug'],**d} for r,d in zip(records,decisions)]}

if __name__ == '__main__':
    result = verify(json.loads((ROOT/'sources/manifest.json').read_text())['records'])
    (ROOT/'sources/source-verification.json').write_text(json.dumps(result,indent=2))
    print(json.dumps({k:v for k,v in result.items() if k!='logo_eligibility'}))
