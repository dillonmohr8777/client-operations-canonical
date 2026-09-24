#!/usr/bin/env python3
"""Pick the next N un-built prospects from the live Prospect Radar.

Deterministic and side-effect free apart from writing today's batch file.
Source of truth is the deployed radar; the registry records what we've built
so a slug is never built twice.
"""
import json, os, re, sys, urllib.request, datetime, subprocess
from pathlib import Path

RADAR = "https://momentum-prospect-radar.netlify.app/"
HERE = os.path.dirname(os.path.abspath(__file__))
REGISTRY = os.path.join(HERE, "built-registry.json")
PRIOR_BUILDS = os.path.join(HERE, "prior-build-index.json")
BATCHES = os.path.join(HERE, "batches")
LOGO_VALIDATOR = os.environ.get("RADAR_LOGO_VALIDATOR", str(
    Path.home() / "repos/dillon-os/_os/automation/lib/logo-eligibility.js"))

# radar record fields we care about (the payload uses short keys)
F = {"d": "domain", "n": "name", "w": "website", "c": "city", "a": "county",
     "v": "vertical_raw", "g": "vertical", "p": "priority", "r": "verdict",
     "l": "lifecycle", "of": "worst_fault"}


def fetch_records(url=RADAR):
    with urllib.request.urlopen(url, timeout=60) as r:
        html = r.read().decode("utf-8", "replace")
    island = re.search(r'<script\b[^>]*\bid=["\']radar-rows["\'][^>]*>([\s\S]*?)</script>', html)
    if island:
        return json.loads(island.group(1))["rows"]
    best = None
    for m in re.finditer(r'\[\s*\{"', html):
        i, depth = m.start(), 0
        j = i
        for j in range(i, min(len(html), i + 2_000_000)):
            ch = html[j]
            if ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    j += 1
                    break
        frag = html[i:j]
        if best is None or len(frag) > len(best):
            best = frag
    if not best:
        raise SystemExit("radar: no data array found — page structure changed")
    return json.loads(best)


def slugify(name):
    s = re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)[:60]


def load_registry():
    if os.path.exists(REGISTRY):
        return json.load(open(REGISTRY, encoding="utf-8"))
    return {"built": {}, "schema": 1}


def logo_decisions(records):
    """Use the producer's exact contract; a missing validator fails closed."""
    if not os.path.isfile(LOGO_VALIDATOR):
        raise RuntimeError(f"Exact-logo validator is unavailable: {LOGO_VALIDATOR}")
    rows = [{"website": r.get("w"), "business_name": r.get("n"),
             "logo_eligibility": r.get("le")} for r in records]
    result = subprocess.run(["node", LOGO_VALIDATOR], input=json.dumps(rows),
                            text=True, capture_output=True, check=True, timeout=30)
    decisions = json.loads(result.stdout)
    if len(decisions) != len(records):
        raise RuntimeError("Exact-logo validator returned incomplete results")
    return decisions


def identity_keys(record):
    name = record.get("n") or record.get("name") or ""
    normalized = re.sub(r"^the\s+", "", name.lower()).replace("&", "and")
    normalized = re.sub(r"\b(llc|inc|ltd|corporation|corp|co)\b\.?", "", normalized)
    business = re.sub(r"[^a-z0-9]", "", normalized)
    url = record.get("w") or record.get("website") or record.get("d") or record.get("domain") or ""
    from urllib.parse import urlparse
    domain = (urlparse(url if "://" in url else "https://" + url).hostname or "").lower().removeprefix("www.")
    slug = record.get("slug") or slugify(name)
    return {f"{kind}:{value}" for kind, value in (("domain", domain), ("business", business), ("slug", slug)) if value}


def select(n=12, county=None, vertical=None):
    recs = fetch_records()
    reg = load_registry()
    done = set(reg["built"])
    decisions = logo_decisions(recs)
    rejected = [{"domain": r.get("d"), "name": r.get("n"), "reason": d.get("reason")}
                for r, d in zip(recs, decisions) if not d.get("eligible")]
    pool = [r for r, d in zip(recs, decisions)
            if r.get("l") == "queued_build" and r.get("ra") == 1 and d.get("eligible") is True]
    if county:
        pool = [r for r in pool if r.get("a") == county]
    if vertical:
        pool = [r for r in pool if r.get("g") == vertical]
    seen = {f"slug:{slug}" for slug in done}
    for slug, row in reg["built"].items():
        seen.update(identity_keys({**row, "slug": slug}))
    with open(PRIOR_BUILDS, encoding="utf-8") as source:
        prior = json.load(source)
    if prior.get("schema") != 1 or not isinstance(prior.get("entries"), list) or not prior["entries"]:
        raise RuntimeError("Full prior-build history is unavailable; refusing selection")
    for row in prior["entries"]:
        seen.update(identity_keys(row))
    fresh = []
    for r in sorted(pool, key=lambda r: (-(r.get("p") or 0), r.get("n") or "")):
        keys = identity_keys(r)
        if not slugify(r.get("n")) or keys & seen:
            rejected.append({"domain": r.get("d"), "name": r.get("n"), "reason": "duplicate_or_missing_identity"})
            continue
        fresh.append(r)
        seen.update(keys)
    picked = fresh[:n]
    out = []
    for r in picked:
        out.append({F.get(k, k): v for k, v in r.items() if k in F} |
                   {"slug": slugify(r.get("n")), "logo_eligibility": r["le"]})
    return {
        "date": datetime.date.today().isoformat(),
        "requested": n,
        "selected": len(out),
        "queue_total": len(pool),
        "queue_remaining_after": max(0, len(fresh) - len(out)),
        "radar_total": len(recs),
        "already_built": len(done),
        "prior_history_rows": len(prior["entries"]),
        "excluded": rejected,
        "batch": out,
    }


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 12
    res = select(n)
    os.makedirs(BATCHES, exist_ok=True)
    path = os.path.join(BATCHES, f"{res['date']}.json")
    # Dated batches, including rejected batches, are immutable evidence.
    with open(path, "x", encoding="utf-8") as output:
        json.dump(res, output, indent=1, ensure_ascii=False)
    print(json.dumps({k: v for k, v in res.items() if k != "batch"}, indent=1))
    print(f"\nwrote {path}")
    for b in res["batch"]:
        print(f"  {b['slug']:38} {b.get('county','?'):20} p={b.get('priority')} {b.get('vertical')}")
    if res["queue_remaining_after"] < n * 3:
        print(f"\n!! QUEUE LOW: {res['queue_remaining_after']} left "
              f"(~{res['queue_remaining_after']//max(n,1)} days). Radar needs refilling.")
