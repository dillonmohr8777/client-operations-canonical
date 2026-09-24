"""Build only source-complete prospects through the inherited Fable page contract.

python build/build.py --manifest sources/manifest.json [--base /proof/2026-09-05]
Original logo and photograph files are copied byte-for-byte. No placeholder path.
"""
import argparse
import hashlib
import html
import json
import re
import shutil
from pathlib import Path
from urllib.parse import urlparse

import reference as ref
import palettes as pal
import spatial_art as art
import service_icons
import longform
from verify_sources import verify

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SOURCES = ROOT / 'sources'
E = ref.e
CONTRACT = '''<!-- THESIS: Each real business owns a complete, source-grounded page inside the approved Fable structure.
OWN-WORLD: Original logo colors, calm full-field identity, condensed display, handwritten header, wide source photographs.
STORY: Recognize the business, understand its services, inspect its real work, and use its official contact route.
FIRST VIEWPORT: Exact transparent logo in a stable 100px header; unique dimensional editorial artwork, headline and official action.
FORM: Primary reference typography and spatial art, adapted to mobile with readable services and compact closing; no centered logo bounce or moving type strip.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->'''


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')


def safe_url(url):
    p = urlparse(url)
    assert p.scheme in ('https', 'http') and p.hostname and not p.username, f'Invalid public URL: {url}'
    return url


def file_input(value):
    p = Path(value)
    if not p.is_absolute():
        p = ROOT / p if value.replace('\\', '/').startswith('sources/') else SOURCES / p
    p = p.resolve()
    assert p.is_relative_to(SOURCES.resolve()) and p.is_file(), f'Asset outside verified sources: {p}'
    return p


def asset(value, slug, kind, base):
    p = file_input(value)
    assert p.suffix.lower() in ('.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'), p
    if p.suffix.lower() == '.svg':
        body = p.read_text(encoding='utf-8-sig')
        assert not re.search(r'<script|<foreignObject|\bon\w+\s*=|javascript:', body, re.I), 'Active SVG rejected'
    target = DIST / 'assets' / 'prospects' / slug / (kind + p.suffix.lower())
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(p, target)
    digest = hashlib.sha256(p.read_bytes()).hexdigest()
    assert hashlib.sha256(target.read_bytes()).hexdigest() == digest
    return base + '/' + target.relative_to(DIST).as_posix(), digest


def theme(r):
    color = r.get('brand_color') or '#354b52'
    assert re.fullmatch(r'#[0-9a-fA-F]{6}', color), f'Invalid brand color {color}'
    # The source hue stays intact; background and text variants are measured.
    dark = pal.mix(color, '#111819', 10)
    header = '#fffefa' if r.get('logo_surface') == 'light' else ('#747a7d' if r.get('logo_surface') == 'mid' else dark)
    brand = pal.deepen(color, target=5)
    base = pal.mix(brand, '#111819', 70)
    return dict(brand=brand, brand_lt=brand, brand_dp=base, hero=color,
                accent=color, header=header, script=pal.on(header), logo='svg',
                source=r.get('logo_source_page') or r['website'])


def img(photo, cls='', eager=False):
    return '<img class="%s" src="%s" alt="%s" loading="%s" decoding="async">' % (
        cls, E(photo['src']), E(photo['alt']), 'eager' if eager else 'lazy')


def logo(r, cls='markbox'):
    return '<span class="%s" data-logo-kind="%s"><img src="%s" alt="%s logo" width="%d" height="%d"></span>' % (
        cls, E(r.get('logo_format','raster')), E(r['logo_src']), E(r['name']), r['logo_width'], r['logo_height'])


def shared(r, base):
    home = base + '/sites/' + r['slug'] + '/'
    nav = [('Overview', '#about'), ('Services', '#work'), ('Contact', '#contact')]
    cdn = ref.CDN.replace('/css/site.css?v=20260903-logo-clarity', base + '/css/site.css')
    cdn += '<link rel="stylesheet" href="%s/css/proof.css">' % base
    site = dict(slug=r['slug'], name=r['name'], home=home, title=E(r['name'] + ' | ' + r['headline']),
                desc=E(r['about'][:160]), cdn=cdn, defs='', scripts='<script src="%s/js/proof.js" defer></script>' % base)
    site['header'] = ref.header_html(site, logo(r), r.get('tagline') or r['location'], nav, None)
    site['foot_links'] = ''.join('<li><a href="%s">%s</a></li>' % (E(h), E(t)) for t, h in nav)
    return site


def prospect(r, base):
    s = shared(r, base)
    action = E(r['cta_url'])
    label = E(r['cta_label'])
    services = r['services']
    photos = r['photos']
    features=[]
    for i,v in enumerate(services):
        drawing=service_icons.svg(v['title'],r['illustration'])
        features.append('<article class="service-feature"><figure class="illustrated-service">'+drawing+'</figure><div><h3 class="illustration-title">'+E(v['title'])+'</h3><p class="service-copy">'+E(longform.expanded_service(r,i))+'</p></div></article>')
    service_grid = '<div class="service-grid">' + ''.join(
        '<article class="service-item"><h3>%s</h3><p class="service-copy">%s</p></article>' % (E(v['title']), E(v['body']))
        for v in services) + '</div>'
    bridge = longform.render(r)
    details = [('Visit ' + r['name'], r['location'] + '. ' + r.get('contact_copy', 'Use the official website for current details and enquiries.'), '')]
    band = ref.strip_html([v['title'] for v in services])
    band += ''.join('<li aria-hidden="true">%s</li>' % E(v['title']) for v in services)
    s.update(hero_art='',
             hero_mark='',
             frame='<div class="editorial-hero"><div class="hero-copy"><h1>'+E(r['headline'])+'</h1><p class="service-copy">'+E(r['location'])+'</p><a class="btn btn-warning" href="'+action+'">'+label+'</a></div><figure class="hero-art"><img src="'+E(r.get('hero_src',photos[0]['src']))+'" alt="'+E(r.get('hero_alt',photos[0]['alt']))+'" fetchpriority="high" decoding="async"></figure></div>',
             statement='<p>%s</p>' % E(r.get('intro') or r['about']), dl='', dm='', dr='',
             work_h2=E(r.get('services_heading') or 'What we do'), cards='\n'.join(features), tiles='',
             work_cta=label, work_cta_href=action, bridge=bridge, proof='', band_label=E(r['name'] + ' services'), band=band,
             acc_h2='The details', acc_p=E(r.get('contact_copy') or ('Explore ' + r['name'] + ' through the services and information on its official website.')),
             acc_cta=label, acc_cta_href=action, accordion=ref.accordion_html(details), foot_script=E(r['location']),
             foot_h2=E(r.get('cta_heading') or ('Discover ' + r['name'])), foot_p=E(r.get('cta_copy') or 'Visit the official website for current information and enquiries.'),
             addr='', foot_cta=label, foot_cta_href=action, footer_art='',
             copyright='%s. Unaffiliated design concept for Momentum 360. <a class="source-link" href="%s">Official source</a>' % (E(r['name']), E(r['website'])))
    page = ref.page(s).replace('<body class="home no-touch">', '<body class="home no-touch revised-proof expanded-proof">\n' + CONTRACT)
    page = re.sub(r'  <div class="homeslider_wrapper">.*?(?=  <section class="homevideo_box")', '', page, flags=re.S)
    page = re.sub(r'  <section class="client_wrapper">.*?</section>', '', page, flags=re.S)
    page = re.sub(r'  <section class="our_services_wrapper".*?</section>', '', page, flags=re.S)
    sticky='<aside class="context-action" aria-label="Contact '+E(r['name'])+'" hidden><a href="'+action+'">'+label+'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg></a></aside>'
    page=page.replace('</body>',sticky+'</body>')
    page = page.replace('<div class="text-center">\n            <a class="btn btn-warning" href="'+action+'">'+label+'</a>\n          </div>', '')
    return page


def hub(records, base):
    n = len(records)
    mock = dict(slug='hub', name='Prospect previews', headline='Real businesses. Finished websites.', about='Source-verified website concepts for Momentum 360.', location='Pennsylvania', logo_src='', logo_width=1, logo_height=1)
    s = shared(mock, base)
    s['header'] = ref.header_html(dict(home=base+'/', name='Prospect previews'), '<span class="markbox"><strong>PROSPECT PREVIEWS</strong></span>', 'Real businesses. Real identities.', [('The websites','#work'), ('Reference','https://primary-website-build-reference.netlify.app/'), ('Evidence',base+'/sources.json')], None)
    cards = []
    for r in records:
        p = pal.derive(theme(r))
        fig = '<figure class="mark" style="--card-surface:%s;--card-ink:%s">%s<small>%s</small></figure>' % (p['header'], p['on_header'], logo(r,'cardmark'), E(r['location']))
        cards.append(ref.card('col-md-6 col-lg-4', fig, r['name'], base+'/sites/'+r['slug']+'/'))
    s.update(title='Source-verified prospect website proof', hero_art='', hero_mark='', frame='<h1>Real businesses.<br>Finished websites.</h1>',
             statement='<p class="batch-summary">%d distinct company concepts, each with its exact logo, verified first-party content and a unique grainy dimensional hero illustration. Explore the mobile layouts, service-specific symbols and purposeful scroll interactions.</p><a class="btn btn-warning" href="#work">Explore the %d websites</a>' % (n,n),
             dl='',dm='',dr='', work_h2='%d complete concepts' % n,cards='\n'.join(cards),tiles='',work_cta='View the original reference',work_cta_href='https://primary-website-build-reference.netlify.app/',
             bridge='',proof='',band_label='Proof requirements',band=ref.strip_html(['Exact original logos','Verified business identities','Dimensional illustrations','First-party facts','Mobile-ready layouts']),
             acc_h2='The proof behind the pages',acc_p='The source manifest records each company, its official source and the exact asset hashes. The original ten-site reference remains available for comparison.',
             acc_cta='Open source evidence',acc_cta_href=base+'/sources.json',accordion=ref.accordion_html([
                 ('Exact identity',f'{n} of {n} companies carry an original logo file from a verified official source. The original file is copied unchanged.',''),
                 ('Complete content','No source-pending panel, invented review, empty service placeholder or fabricated logo is accepted by this build.',''),
                 ('Faithful structure','The original reference supplies the layout and motion language. Each business supplies its own identity, services, source photography and destination.',''),
                 ('Independent concepts','These are unaffiliated design concepts. Links lead to the respective official business; they do not imply a client relationship.','')]),
             foot_script='One structure. Each company itself.',foot_h2='See the difference',foot_p='Compare the source-verified concepts with the original reference.',addr='',foot_cta='Back to the websites',foot_cta_href='#work',
             footer_art='',copyright='Momentum 360 · Internal prospect design review. No outreach has been sent.')
    page=ref.page(s).replace('<body class="home no-touch">','<body class="home no-touch proof-hub">\n'+CONTRACT)
    return re.sub(r'  <section class="client_wrapper">.*?</section>', '', page, flags=re.S)


def main():
    global DIST
    parser = argparse.ArgumentParser()
    parser.add_argument('--manifest', default='sources/manifest.json')
    parser.add_argument('--base', default='')
    parser.add_argument('--output', choices=['dist','release-dist'], default='dist')
    args = parser.parse_args()
    DIST = ROOT / args.output
    base = args.base.rstrip('/')
    assert not base or re.fullmatch(r'/[a-z0-9/-]+',base)
    data = json.loads((ROOT/args.manifest).read_text(encoding='utf-8-sig'))
    rows = data if isinstance(data,list) else data.get('records',data.get('prospects',[]))
    assert rows, 'No verified records; refusing an empty or placeholder build'
    verify(rows)
    records, seen, provenance = [], set(), []
    for raw in rows:
        r = dict(raw)
        assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',r['slug']), r['slug']
        domain = urlparse(safe_url(r['website'])).hostname.lower().removeprefix('www.')
        assert domain not in seen, f'Duplicate company domain: {domain}'
        seen.add(domain)
        assert r.get('eligibility') in ('verified','eligible',True), f'Unverified company: {r["name"]}'
        assert len(r['services']) >= 3 and len(r['about']) > 80 and r['photos'], f'Incomplete content: {r["name"]}'
        safe_url(r['cta_url']); safe_url(r['logo_url']); safe_url(r['logo_source_page'])
        r['logo_src'], logo_hash = asset(r['logo_local'],r['slug'],'logo',base)
        dims = r.get('logo_dimensions') or [r.get('logo_width',600),r.get('logo_height',200)]
        if isinstance(dims,dict): dims=[dims['width'],dims['height']]
        r['logo_width'],r['logo_height']=int(dims[0]),int(dims[1])
        assert min(r['logo_width'],r['logo_height']) > 0
        photos=[]
        for i,p in enumerate(r['photos'][:1]):
            p=dict(p);safe_url(p['url'])
            p['src'],p['sha256']=asset(p['local'],r['slug'],f'photo-{i+1}',base)
            photos.append(p)
        r['photos']=photos
        hero_file = SOURCES / 'generated' / (r['slug'] + '.webp')
        assert hero_file.is_file(), 'Missing finished hero for '+r['slug']
        if hero_file.is_file():
            r['hero_src'], r['hero_sha256'] = asset(str(hero_file),r['slug'],'hero-editorial',base)
            r['hero_alt'] = 'Hand-drawn dimensional '+r['illustration'].replace('_',' ')+' concept for '+r['name']
        r['headline']=r.get('headline') or r.get('category') or r['services'][0]['title']
        records.append(r)
        provenance.append(dict(name=r['name'],slug=r['slug'],website=r['website'],logo_source_page=r['logo_source_page'],logo_url=r['logo_url'],logo_sha256=logo_hash,
                               hero=dict(type='Generated editorial concept',src=r['hero_src'],sha256=r['hero_sha256']),
                               verified_at=r.get('verified_at'),source_urls=r.get('source_urls',[]),
                               photos=[dict(url=p['url'],sha256=p['sha256'],alt=p['alt']) for p in photos]))
    ref.P.clear();ref.P.update({r['slug']:theme(r) for r in records})
    ref.ALL=list(ref.P.items())+[('hub',ref.HUB)]
    css=ref.build_css().replace('url("/assets/','url("'+base+'/assets/')
    css += '\n' + '\n'.join('[data-site=\"%s\"] {--source-logo-width:%dpx;--page-deep:%s;--page-on-deep:%s;}' % (r['slug'],(min(620,r['logo_width']//2) if r['logo_format']!='svg' else 520),pal.derive(theme(r))['brand_dp'],pal.on(pal.derive(theme(r))['brand_dp'])) for r in records)
    write(DIST/'css/site.css',css)
    write(DIST/'css/proof.css',(ROOT/'build/proof.css').read_text())
    write(DIST/'js/proof.js',(ROOT/'build/proof.js').read_text())
    # Decorative marks are authored inline; never write empty stand-ins.
    for r in records:
        page = prospect(r,base)
        # Text arrows become colored emoji on iOS. Interface icons must be SVG.
        assert not re.search(r'[\u2190-\u21ff\u2600-\u27bf\ufe0f\U0001f000-\U0001faff]', html.unescape(page)), 'Emoji-style text glyph in '+r['slug']
        assert 'all previews' not in page.lower() and f'href="{base}/"' not in page, 'Collection link in individual page '+r['slug']
        write(DIST/'sites'/r['slug']/'index.html',page)
    write(DIST/'index.html',hub(records,base))
    write(DIST/'sources.json',json.dumps(dict(records=provenance),indent=2,ensure_ascii=False))
    write(DIST/'_headers','/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n')
    write(ROOT/('release-build-receipt.json' if args.output=='release-dist' else 'build-receipt.json'),json.dumps(dict(count=len(records),slugs=[r['slug'] for r in records],base=base,logos_copied_unchanged=True),indent=2))
    print(json.dumps(dict(built=len(records),logos=len(records),photos=sum(len(r['photos']) for r in records),output=str(DIST))))


if __name__=='__main__':main()
