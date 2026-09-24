"""AI Search Snapshot - the deterministic half of the free opener.

Given one URL, observe what can be observed from outside and tag every
finding as `verified` (observed now, with the evidence), `pending` (needs
access we do not have: Search Console, analytics, CMS), or `not_observed`.
Nothing is estimated. Nothing is scored. Standard library only.

    python snapshot.py https://example.com [--out runs/example.com]

Writes runs/<host>/snapshot.json. render.py turns that into the report.

Checks (the first-order AEO blockers seen at Fagan Painting, 2026-08-31):
  1. robots.txt: fetchable, parseable, sitemap declared, malformed lines,
     and whether the AI crawlers are allowed, disallowed, or unmentioned.
  2. Fetchability by user agent: a plain browser, Googlebot, GPTBot,
     PerplexityBot, ClaudeBot. Detects bot-challenge pages (SiteGround
     sgcaptcha, Cloudflare) that Google passes and AI crawlers do not.
  3. Homepage HTML: title, description, canonical, lang, viewport, noindex,
     H1 count, JSON-LD entity types, FAQ presence, phone and address presence.
  4. Sitemap: fetchable, URL count.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

HERE = pathlib.Path(__file__).resolve().parent
TIMEOUT = 20

AI_BOTS = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "PerplexityBot", "ClaudeBot",
           "Claude-Web", "anthropic-ai", "Google-Extended", "Applebot-Extended",
           "CCBot", "Bytespider", "Amazonbot", "meta-externalagent"]

# The user agents we fetch with. The AI ones are the strings those crawlers
# actually send; a site that challenges them is invisible to those systems.
AGENTS = {
    "browser": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "googlebot": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "gptbot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "perplexitybot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    "claudebot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
}

CHALLENGE_SIGNS = [
    ("siteground", re.compile(r"sgcaptcha|Robot Challenge Screen", re.I)),
    ("cloudflare", re.compile(r"cf-chl|Just a moment\.\.\.|challenge-platform", re.I)),
    ("generic", re.compile(r"<meta[^>]+http-equiv=[\"']?refresh[\"']?[^>]+captcha", re.I)),
]


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def fetch(url: str, agent: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": agent, "Accept": "text/html,*/*;q=0.8"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            body = r.read(2_000_000)
            text = body.decode("utf-8", errors="replace")
            challenge = next((n for n, rx in CHALLENGE_SIGNS if rx.search(text[:20_000])), None)
            return {"status": r.status, "final_url": r.geturl(), "bytes": len(body),
                    "challenge": challenge, "text": text,
                    "sha256": hashlib.sha256(body).hexdigest()}
    except urllib.error.HTTPError as e:
        body = e.read(200_000) if hasattr(e, "read") else b""
        text = body.decode("utf-8", errors="replace")
        challenge = next((n for n, rx in CHALLENGE_SIGNS if rx.search(text[:20_000])), None)
        return {"status": e.code, "final_url": url, "bytes": len(body), "challenge": challenge,
                "text": text, "sha256": hashlib.sha256(body).hexdigest()}
    except Exception as e:  # DNS, timeout, TLS
        return {"status": None, "final_url": url, "bytes": 0, "challenge": None, "text": "",
                "error": f"{type(e).__name__}: {e}"}


# --- robots ---------------------------------------------------------------
def parse_robots(text: str) -> dict:
    groups, current, sitemaps, malformed = [], None, [], []
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if ":" not in line:
            malformed.append(raw.strip())
            continue
        key, _, val = line.partition(":")
        key, val = key.strip().lower(), val.strip()
        if key == "user-agent":
            if current is None or current["rules"]:
                current = {"agents": [], "rules": []}
                groups.append(current)
            current["agents"].append(val)
        elif key in ("allow", "disallow"):
            if current is None:
                malformed.append(raw.strip())
                continue
            # a Disallow whose path is a bare prefix like "/header" with no
            # slash or wildcard after it is the Fagan truncation pattern
            current["rules"].append({"type": key, "path": val})
        elif key == "sitemap":
            sitemaps.append(val)
        elif key in ("crawl-delay", "host", "clean-param"):
            pass
        else:
            malformed.append(raw.strip())
    return {"groups": groups, "sitemaps": sitemaps, "malformed": malformed}


def ai_bot_policy(robots: dict) -> dict:
    """For each AI crawler: allowed / disallowed / unmentioned, and by which group."""
    out = {}
    for bot in AI_BOTS:
        verdict, via = "unmentioned", None
        for g in robots["groups"]:
            if any(a.lower() == bot.lower() for a in g["agents"]):
                dis = [r for r in g["rules"] if r["type"] == "disallow" and r["path"] in ("/", "/*")]
                verdict = "disallowed" if dis else "allowed"
                via = bot
                break
        if via is None:
            for g in robots["groups"]:
                if "*" in g["agents"]:
                    dis = [r for r in g["rules"] if r["type"] == "disallow" and r["path"] in ("/", "/*")]
                    verdict = "disallowed-by-wildcard" if dis else "unmentioned"
                    via = "*"
                    break
        out[bot] = {"verdict": verdict, "via": via}
    return out


# --- HTML -----------------------------------------------------------------
class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self._in_title = "", False
        self.h1, self._in_h1 = [], False
        self.meta, self.links = {}, []
        self.jsonld, self._in_ld = [], False
        self.lang, self.text_chunks = None, []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.lang = a.get("lang")
        elif tag == "title":
            self._in_title = True
        elif tag == "h1":
            self._in_h1 = True
            self.h1.append("")
        elif tag == "meta":
            name = (a.get("name") or a.get("property") or "").lower()
            if name:
                self.meta[name] = a.get("content", "")
        elif tag == "link":
            self.links.append(a)
        elif tag == "script":
            if (a.get("type") or "").lower() == "application/ld+json":
                self._in_ld = True
                self.jsonld.append("")
            else:
                self._skip += 1
        elif tag == "style":
            self._skip += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self._in_h1 = False
        elif tag == "script":
            if self._in_ld:
                self._in_ld = False
            elif self._skip:
                self._skip -= 1
        elif tag == "style" and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_h1 and self.h1:
            self.h1[-1] += data
        if self._in_ld and self.jsonld:
            self.jsonld[-1] += data
        elif not self._skip:
            self.text_chunks.append(data)


def ld_types(blocks: list[str]) -> list[str]:
    types = []

    def walk(o):
        if isinstance(o, dict):
            t = o.get("@type")
            if isinstance(t, str):
                types.append(t)
            elif isinstance(t, list):
                types.extend(x for x in t if isinstance(x, str))
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)

    for b in blocks:
        try:
            walk(json.loads(b))
        except Exception:
            types.append("(unparseable JSON-LD)")
    return types


PHONE = re.compile(r"(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b")
ADDRESS = re.compile(r"\b\d{1,6}\s+[A-Z][A-Za-z.]+(?:\s+[A-Z][A-Za-z.]+)*\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Pike|Hwy|Highway)\b\.?", re.I)


def analyse_html(text: str, url: str) -> dict:
    p = Page()
    p.feed(text)
    canon = next((l.get("href") for l in p.links if (l.get("rel") or "").lower() == "canonical"), None)
    body = " ".join(" ".join(p.text_chunks).split())
    types = ld_types(p.jsonld)
    robots_meta = (p.meta.get("robots") or "").lower()
    return {
        "title": p.title.strip()[:200],
        "description": (p.meta.get("description") or "")[:300],
        "canonical": canon,
        "canonical_matches_url": (urllib.parse.urlsplit(canon or "").netloc == urllib.parse.urlsplit(url).netloc) if canon else None,
        "lang": p.lang,
        "viewport": p.meta.get("viewport"),
        "noindex": "noindex" in robots_meta,
        "h1_count": len(p.h1),
        "h1": [" ".join(h.split())[:160] for h in p.h1],
        "jsonld_blocks": len(p.jsonld),
        "jsonld_types": sorted(set(types)),
        "faq_signal": bool(re.search(r"\bFAQ|frequently asked", body, re.I)) or "FAQPage" in types,
        "phone_found": bool(PHONE.search(body)),
        "address_found": bool(ADDRESS.search(body)),
        "og_title": p.meta.get("og:title"),
        "text_chars": len(body),
    }



# --- findings -------------------------------------------------------------
BIZ_TYPES = {"LocalBusiness", "Organization", "ProfessionalService", "HomeAndConstructionBusiness",
             "MedicalBusiness", "Dentist", "Restaurant", "Store", "LegalService", "Physician", "Corporation"}


def fetch_findings(f: dict) -> list:
    F = []
    ok = lambda n: f[n]["status"] == 200 and not f[n]["challenge"]
    ai_blocked = [n for n in ("gptbot", "perplexitybot", "claudebot") if not ok(n)]
    browser_ok, goog_ok = ok("browser"), ok("googlebot")
    challenged = sorted({f[n]["challenge"] for n in f if f[n]["challenge"]})
    all_fetches = {n: {"status": f[n]["status"], "challenge": f[n]["challenge"]} for n in f}
    if not browser_ok:
        # Every identity, including a plain browser, is challenged from here.
        # That is an IP-level bot challenge and says nothing about what a real
        # GPTBot request from OpenAI's own address range would see. Record the
        # challenge (observed) and mark AI-crawler access not observed.
        host = challenged[0] if challenged else "unknown"
        F.append(finding("host-challenge", "verified",
                         f"Host bot challenge ({host}) intercepts every identity tested, including a plain browser",
                         all_fetches,
                         "Crawlers that do not run JavaScript never get past a meta-refresh challenge. Confirm in the host's bot-protection settings which AI crawlers are allowlisted, and check server logs for GPTBot, PerplexityBot and ClaudeBot hits and their status codes. Google Search Console is the authority for Googlebot."))
        F.append(finding("fetch-ai", "not_observed",
                         "Whether real AI crawlers can read the homepage cannot be determined from this network",
                         {"reason": "browser identity was challenged too; AI-crawler blocking and IP-level challenge are indistinguishable here"},
                         "Re-run from a second network, or read the host's bot-protection allowlist and server logs."))
    elif ai_blocked:
        F.append(finding("fetch-ai", "verified",
                         f"{len(ai_blocked)} of 3 AI crawlers cannot read the homepage" +
                         (" while Googlebot and a browser can" if goog_ok else " while a browser can"),
                         all_fetches,
                         "Allow the named AI crawlers past the bot challenge at the host or CDN, then re-check. Citation monitoring cannot honestly start until the pages are readable."))
    else:
        F.append(finding("fetch-ai", "verified", "All three tested AI crawlers can read the homepage",
                         {n: f[n]["status"] for n in ("gptbot", "perplexitybot", "claudebot")}, None, "info"))
    return F


def robots_findings(robots: dict) -> list:
    F = []
    if robots.get("groups") is not None:
        pol = robots["ai_bots"]
        mentioned = [b for b, v in pol.items() if v["verdict"] in ("allowed", "disallowed")]
        dis = [b for b, v in pol.items() if v["verdict"].startswith("disallowed")]
        if dis:
            F.append(finding("robots-ai", "verified", f"robots.txt disallows {len(dis)} AI crawler(s): {', '.join(dis)}", pol,
                             "Decide deliberately which AI crawlers may read the site; a blanket disallow removes the site from AI answers."))
        elif not mentioned:
            F.append(finding("robots-ai", "verified", "robots.txt does not mention any AI crawler",
                             {"sitemaps": robots["sitemaps"], "groups": len(robots["groups"])},
                             "Add explicit user-agent groups for GPTBot, PerplexityBot, ClaudeBot and Google-Extended so the policy is a decision, not an accident.", "medium"))
        else:
            F.append(finding("robots-ai", "verified", f"robots.txt explicitly addresses {len(mentioned)} AI crawler(s)", pol, None, "info"))
        if robots["malformed"]:
            F.append(finding("robots-malformed", "verified", f"robots.txt has {len(robots['malformed'])} malformed line(s)",
                             robots["malformed"][:10], "Repair or remove the malformed lines; crawlers ignore or misread them.", "medium"))
        trunc = [r["path"] for g in robots["groups"] for r in g["rules"]
                 if r["type"] == "disallow" and re.fullmatch(r"/[A-Za-z]{2,12}", r["path"] or "")]
        # a bare word like /header is the Fagan truncation; a deliberate prefix
        # such as /sitemap-pt-post-p1- (trailing hyphen, digits) is not
        if trunc:
            F.append(finding("robots-truncated", "verified", f"Disallow rule(s) look truncated: {', '.join(trunc)}", trunc,
                             "A bare Disallow: /word blocks every URL starting with that word. Confirm the intended path.", "medium"))
        if not robots["sitemaps"]:
            F.append(finding("robots-sitemap", "verified", "robots.txt declares no sitemap", None,
                             "Add a Sitemap: line pointing at the XML sitemap index.", "low"))
    elif robots.get("status") == 404:
        F.append(finding("robots-missing", "verified", "No robots.txt (404)", None,
                         "Publish a robots.txt with an explicit AI-crawler policy and a Sitemap line.", "medium"))
    elif robots.get("challenge"):
        F.append(finding("robots-unreadable", "not_observed", f"robots.txt sits behind the {robots['challenge']} challenge from this network (status {robots['status']})",
                         None, "Read it from a browser or a second network; the AI-crawler policy cannot be assessed until then.", "high"))
    else:
        F.append(finding("robots-unreadable", "verified", f"robots.txt not readable (status {robots.get('status')})",
                         None, "Resolve the error before any crawler policy can be trusted.", "high"))
    return F


def sitemap_findings(sm: dict) -> list:
    if sm.get("status") == 200 and not sm.get("challenge"):
        return [finding("sitemap", "verified", f"Sitemap readable: {sm.get('url_count')} <loc> entries" + (" (index)" if sm.get("is_index") else ""),
                        sm, None, "info")]
    if sm.get("challenge"):
        return [finding("sitemap", "not_observed", f"Sitemap sits behind the {sm['challenge']} challenge from this network", sm,
                        "Read it from a browser or a second network.", "medium")]
    return [finding("sitemap", "verified", f"Sitemap not readable at {sm.get('url')} (status {sm.get('status')})", sm,
                    "Publish or unblock the sitemap; it is the cheapest crawl signal there is.", "medium")]


def page_findings(pg: dict) -> list:
    """Fields may be None when the page came from a browser vantage that did
    not capture them; None means not observed, never 'missing'."""
    F = []
    types = pg.get("jsonld_types")
    if types is None:
        F.append(finding("entity-type", "not_observed", "Entity markup not captured", None, None, "info"))
    elif "Product" in types and not (set(types) & BIZ_TYPES):
        F.append(finding("entity-type", "verified", "The homepage is typed as a Product, not as a business",
                         {"jsonld_types": types}, "Replace or add Organization/LocalBusiness JSON-LD that names the business, service area and phone; remove Product markup from a service homepage."))
    elif not types:
        F.append(finding("entity-type", "verified", "No JSON-LD entity on the homepage", {"jsonld_blocks": pg.get("jsonld_blocks")},
                         "Add Organization or LocalBusiness JSON-LD that mirrors the visible page: name, address, phone, service area, sameAs.", "medium"))
    else:
        F.append(finding("entity-type", "verified", f"Entity types present: {', '.join(types)}", {"jsonld_types": types}, None, "info"))
    if pg.get("h1_count") is not None and pg["h1_count"] != 1:
        F.append(finding("h1", "verified", f"{pg['h1_count']} H1 elements (expected one)", pg.get("h1"),
                         "One H1 that names the business and its primary service.", "low"))
    if "canonical" in pg and pg["canonical"] is None:
        F.append(finding("canonical", "verified", "No canonical link on the homepage", None, "Add a self-referencing canonical.", "low"))
    if pg.get("noindex"):
        F.append(finding("noindex", "verified", "Homepage carries a noindex directive", None, "Remove it unless the page is genuinely private."))
    if pg.get("faq_signal") is False:
        F.append(finding("faq", "verified", "No FAQ signal on the homepage", None,
                         "Add answer-shaped content: the five questions buyers actually ask, answered in the first sentence, mirrored in FAQPage JSON-LD.", "medium"))
    if pg.get("phone_found") is False or pg.get("address_found") is False:
        F.append(finding("nap", "verified", "Phone or address not found in visible homepage text",
                         {"phone": pg.get("phone_found"), "address": pg.get("address_found")},
                         "Put name, address and phone in visible HTML, matching the Google Business Profile exactly.", "medium"))
    if "viewport" in pg and pg["viewport"] is None:
        F.append(finding("viewport", "verified", "No viewport meta; mobile rendering is unreliable", None, "Add the standard viewport meta.", "medium"))
    return F


def pending_findings() -> list:
    return [
        finding("gsc", "pending", "Search Console: indexing status, rich-result types, crawl errors", None,
                "Needs Search Console access. Until then this stays pending, not assumed.", "info"),
        finding("engines", "pending", "What ChatGPT, Perplexity or AI Overviews say about the business", None,
                "Human-run 20-question baseline on two named engines, recorded with date, engine, query and citations. Never scraped.", "info"),
        finding("analytics", "pending", "Referral traffic from AI surfaces", None, "Needs analytics access.", "info"),
    ]


def summarise(F: list) -> dict:
    return {
        "verified": sum(1 for x in F if x["state"] == "verified" and x["weight"] != "info"),
        "pending": sum(1 for x in F if x["state"] == "pending"),
        "not_observed": sum(1 for x in F if x["state"] == "not_observed"),
        "high": sum(1 for x in F if x["state"] == "verified" and x["weight"] == "high"),
    }


# --- assembly -------------------------------------------------------------
def finding(id_, state, headline, evidence=None, fix=None, weight="high"):
    return {"id": id_, "state": state, "weight": weight, "headline": headline,
            "evidence": evidence, "fix": fix}


def run(url: str) -> dict:
    if not re.match(r"^https?://", url):
        url = "https://" + url
    split = urllib.parse.urlsplit(url)
    origin = f"{split.scheme}://{split.netloc}"
    t0 = now()
    out = {"schema": "momentum-snapshot/1", "url": url, "origin": origin, "observed_at": t0,
           "method": "outside-in, single fetch per user agent, standard library, no scraping of any engine",
           "fetches": {}, "robots": None, "sitemap": None, "page": None, "findings": []}

    # 1. fetch by agent
    for name, ua in AGENTS.items():
        r = fetch(url, ua)
        out["fetches"][name] = {k: v for k, v in r.items() if k != "text"}
        out["fetches"][name]["_text"] = r.get("text", "")

    # 2. robots
    rb = fetch(origin + "/robots.txt", AGENTS["browser"])
    robots = {"status": rb["status"], "challenge": rb["challenge"]}
    if rb["status"] == 200 and not rb["challenge"]:
        parsed = parse_robots(rb["text"])
        robots.update(parsed)
        robots["ai_bots"] = ai_bot_policy(parsed)
        robots["raw_sha256"] = rb["sha256"]
    out["robots"] = robots

    # 3. sitemap
    sm_url = (robots.get("sitemaps") or [origin + "/sitemap.xml"])[0]
    sm = fetch(sm_url, AGENTS["browser"])
    out["sitemap"] = {"url": sm_url, "status": sm["status"], "challenge": sm["challenge"],
                      "url_count": len(re.findall(r"<loc>", sm["text"])) if sm["status"] == 200 else None,
                      "is_index": "<sitemapindex" in sm["text"]}

    # 4. page analysis on the best readable fetch
    readable = next((n for n in ("browser", "googlebot") if out["fetches"][n]["status"] == 200
                     and not out["fetches"][n]["challenge"]), None)
    if readable:
        out["page"] = analyse_html(out["fetches"][readable]["_text"], url)
        out["page"]["analysed_via"] = readable
    for n in out["fetches"]:
        out["fetches"][n].pop("_text", None)

    # 5. findings
    F = out["findings"]
    F += fetch_findings(out["fetches"])
    F += robots_findings(robots)
    F += sitemap_findings(out["sitemap"])
    if out["page"]:
        F += page_findings(out["page"])
    else:
        F.append(finding("page", "not_observed", "Homepage could not be read by a browser or Googlebot from this vantage point",
                         {n: out["fetches"][n]["status"] for n in out["fetches"]}, "Verify from a second network before concluding anything about the page."))
    F += pending_findings()
    out["summary"] = summarise(F)
    out["completed_at"] = now()
    return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--out")
    ap.add_argument("--browser-vantage", help="JSON captured in a real browser (robots_txt, html) to analyse page-level checks past a host challenge")
    a = ap.parse_args(argv)
    res = run(a.url)
    if a.browser_vantage:
        bv = json.loads(pathlib.Path(a.browser_vantage).read_text(encoding="utf-8"))
        res["browser_vantage"] = {k: v for k, v in bv.items() if k not in ("html",)}
        keep = lambda F, prefixes: [x for x in F if not any(x["id"].startswith(pfx) for pfx in prefixes)]
        if bv.get("html"):
            res["page"] = analyse_html(bv["html"], res["url"])
        elif bv.get("page"):
            res["page"] = dict(bv["page"])
        if bv.get("html") or bv.get("page"):
            res["page"]["analysed_via"] = "browser vantage: a real browser session that had cleared the host challenge"
            res["findings"] = keep(res["findings"], ("page", "entity", "h1", "canonical", "noindex", "faq", "nap", "viewport"))
            res["findings"] += page_findings(res["page"])
        if bv.get("robots_txt"):
            parsed = parse_robots(bv["robots_txt"])
            res["robots"] = {"status": 200, "challenge": None, "via": "browser vantage", **parsed, "ai_bots": ai_bot_policy(parsed)}
            res["findings"] = keep(res["findings"], ("robots",))
            res["findings"] += robots_findings(res["robots"])
        if bv.get("sitemap"):
            res["sitemap"] = {**res["sitemap"], **bv["sitemap"], "status": 200, "challenge": None, "via": "browser vantage"}
            res["findings"] = keep(res["findings"], ("sitemap",))
            res["findings"] += sitemap_findings(res["sitemap"])
        res["summary"] = summarise(res["findings"])
    host = urllib.parse.urlsplit(res["url"]).netloc.replace("www.", "")
    out_dir = pathlib.Path(a.out) if a.out else HERE / "runs" / host
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "snapshot.json").write_text(json.dumps(res, indent=2), encoding="utf-8")
    print(f"{host}: {res['summary']['verified']} verified findings ({res['summary']['high']} high), "
          f"{res['summary']['pending']} pending, {res['summary']['not_observed']} not observed")
    for x in res["findings"]:
        if x["state"] == "verified" and x["weight"] != "info":
            print(f"  [{x['weight']:>6}] {x['headline']}")
    print(f"  -> {out_dir / 'snapshot.json'}")
    return 0


def demo():
    r = parse_robots("User-agent: *\nDisallow: /xmlrpc.php\nDisallow: /header\nSitemap: https://x/s.xml\nbogus line\nUser-agent: GPTBot\nDisallow: /")
    assert r["sitemaps"] == ["https://x/s.xml"]
    assert r["malformed"] == ["bogus line"]
    pol = ai_bot_policy(r)
    assert pol["GPTBot"]["verdict"] == "disallowed" and pol["ClaudeBot"]["verdict"] == "unmentioned"
    pg = analyse_html('<html lang="en"><head><title>T</title><link rel="canonical" href="https://a.b/">'
                      '<script type="application/ld+json">{"@type":"Product"}</script></head>'
                      '<body><h1>Hi</h1><p>Call (215) 555-0100 at 12 Market St</p></body></html>', "https://a.b/")
    assert pg["jsonld_types"] == ["Product"] and pg["h1_count"] == 1 and pg["phone_found"] and pg["address_found"]
    assert pg["canonical_matches_url"] is True
    print("snapshot self-check ok")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        demo()
        raise SystemExit(0)
    raise SystemExit(main())
