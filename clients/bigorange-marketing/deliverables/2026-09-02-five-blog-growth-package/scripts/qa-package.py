from __future__ import annotations
import json, re, sys
from pathlib import Path

PKG=Path(__file__).resolve().parents[1]
manifest=json.loads((PKG/"blog-manifest.json").read_text(encoding="utf-8"))
errors=[]
for m in manifest:
    md=(PKG/"blogs"/f"{m['asset_id']}.md").read_text(encoding="utf-8")
    html=(PKG/"wordpress"/m["html_file"]).read_text(encoding="utf-8")
    schema=json.loads((PKG/"schema"/f"{m['asset_id']}.schema.json").read_text(encoding="utf-8"))
    checks={
      "word_count": m["word_count"] >= 1100,
      "title_tag": 35 <= len(m["title_tag"]) <= 60,
      "meta_description": 130 <= len(m["meta_description"]) <= 160,
      "primary_query": m["primary_query"].lower() in md.lower(),
      "single_h1": len(re.findall(r"(?m)^# ",md))==1,
      "five_faqs": m["faq_count"]==5 and "Frequently asked questions" in md,
      "direct_answer": "Direct answer:" in md,
      "parent_link": "/marketing-agency-for-builders/" in md,
      "booking_link": "/book-appointment/" in md,
      "no_brand_leak": not re.search(r"IMMOHRTAL|Momentum 360",md,re.I),
      "html_content": m["title"] in html and "application/ld+json" in html,
      "schema_blog": any(x.get("@type")=="BlogPosting" for x in schema.get("@graph",[])),
      "schema_breadcrumb": any(x.get("@type")=="BreadcrumbList" for x in schema.get("@graph",[])),
    }
    bad=[k for k,v in checks.items() if not v]
    if bad: errors.append({m["asset_id"]:bad})
report={"assets":len(manifest),"total_words":sum(m["word_count"] for m in manifest),"errors":errors,"status":"PASS" if not errors else "FAIL"}
(PKG/"qa-report.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
print(json.dumps(report,indent=2))
sys.exit(1 if errors else 0)
