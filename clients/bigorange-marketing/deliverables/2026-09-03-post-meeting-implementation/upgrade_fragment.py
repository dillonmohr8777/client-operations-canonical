"""Bring a plain review-draft fragment up to the finished-article standard.

The two existing private WordPress Draft source files (5550, 5552) carry a scoped
design system, a direct-answer block, a contents index, heading anchors and JSON-LD.
The 19 release fragments carry none of it - they are clean prose with real citations,
but no design and no AEO instrumentation.

This lifts the 5550 design system onto a fragment and adds structure that is DERIVED
from the fragment's own content. It does not invent facts:

  - hero          <- the existing h1 plus the first paragraph as summary
  - direct answer <- the existing opening paragraph, labelled
  - contents      <- the existing h2 set, slugified
  - anchors       <- slugified from existing heading text
  - Article JSON-LD <- headline/description from existing h1 and lead
  - FAQPage JSON-LD <- ONLY where question-form headings already exist

Anything it cannot derive is reported as a gap rather than fabricated.
"""
from __future__ import annotations
import json
import re
import sys
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

SITE = "https://bigorange.marketing"
DONOR = "5550-must-include-upgraded.html"   # source of the design system

# The authority-package sources live in the earlier deliverable and are treated as
# immutable evidence here. Apply narrowly scoped, first-party reference corrections
# during derivation so every generated copy stays current without mutating that
# earlier package.
SOURCE_CORRECTIONS = {
    "https://www.ftc.gov/business-guidance/blog/2023/02/keep-your-ai-claims-check":
        "https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business",
    "https://knowledge.hubspot.com/privacy-and-consent/set-up-email-subscription-types":
        "https://knowledge.hubspot.com/marketing-email/set-up-email-subscription-types",
    "https://www.ftc.gov/business-guidance/resources/final-rule-banning-fake-reviews-testimonials":
        "https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers",
}

SOURCE_TEXT_CORRECTIONS = {
    (
        "The FTC has also warned businesses that claims about AI-powered products "
        "must be truthful and supported"
    ): (
        "The FTC's advertising guidance says objective advertising claims need a "
        "reasonable basis supported by evidence"
    ),
    (
        "The FTC's final rule on consumer reviews and testimonials prohibits "
        "practices including fake reviews and certain conditioned incentives"
    ): (
        "The FTC's Consumer Reviews and Testimonials Rule addresses fake or false "
        "reviews and testimonials, conditioned incentives, and related deceptive practices"
    ),
    (
        "The FTC&#39;s final rule on consumer reviews and testimonials prohibits "
        "practices including fake reviews and certain conditioned incentives"
    ): (
        "The FTC&#39;s Consumer Reviews and Testimonials Rule addresses fake or false "
        "reviews and testimonials, conditioned incentives, and related deceptive practices"
    ),
    "FTC, Keep your AI claims in check": "FTC, Advertising FAQs",
    "FTC: Final rule banning fake reviews and testimonials":
        "FTC: Consumer reviews and testimonials rule Q&amp;A",
}

# Extra rules so the shell works without a hero photo and keeps the donor look.
EXTRA_CSS = """
#{aid} .bom-article-hero.is-copy-only {{ grid-template-columns: minmax(0,1fr); }}
#{aid} .bom-editorial-note {{ border-left: 4px solid var(--orange); background: #fff8f1;
  margin: 1.6rem 0; padding: .85rem 1.1rem; font-size: .93rem; color: var(--muted); }}
#{aid} .bom-editorial-note strong {{ color: var(--orange-deep); }}
"""


def slugify(text: str) -> str:
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    t = re.sub(r"[^\w\s-]", "", t).strip().lower()
    t = re.sub(r"[\s_-]+", "-", t)
    return t[:70].strip("-") or "section"


def bounded_sentence_summary(text: str, limit: int = 300) -> str:
    """Return the longest whole-sentence prefix within ``limit`` characters.

    Schema descriptions must not be sliced in the middle of a word or sentence. A
    source whose first sentence exceeds the bound is a content error that needs an
    editorial rewrite, not a reason to emit a misleading fragment.
    """
    normalized = re.sub(r"\s+", " ", text or "").strip()
    if not normalized:
        raise ValueError("cannot summarize an empty lead")
    boundaries = [
        match.end()
        for match in re.finditer(r"[.!?](?=[\"'”’)]?(?:\s|$))", normalized)
        if match.end() <= limit
    ]
    if not boundaries:
        raise ValueError(f"first sentence exceeds {limit} characters or lacks terminal punctuation")
    summary = normalized[: boundaries[-1]].strip()
    if len(summary) > limit or not re.search(r"[.!?][\"'”’)]?$", summary):
        raise ValueError("sentence summary failed its terminal-boundary invariant")
    if summary.endswith((",", ";", ":", "-", "–", "—")):
        raise ValueError("sentence summary ended with dangling punctuation")
    return summary


def donor_css(donor_path: Path, aid: str) -> str:
    """Reuse the finished article's scoped stylesheet, re-pointed at this article id."""
    raw = donor_path.read_text(encoding="utf-8")
    m = re.search(r"<style[^>]*>(.*?)</style>", raw, re.S)
    if not m:
        raise SystemExit("donor stylesheet not found")
    css = m.group(1)
    css = css.replace("bom-article-5550-styles", f"{aid}-styles")
    css = css.replace("bom-article-5550", aid)
    return css + EXTRA_CSS.format(aid=aid)


def is_question(text: str) -> bool:
    t = text.strip()
    if t.endswith("?"):
        return True
    return bool(re.match(r"^(what|why|how|when|where|who|which|do|does|should|can|is|are)\b", t, re.I))


def upgrade(src: Path, donor: Path, slug: str) -> tuple[str, dict]:
    source_html = src.read_text(encoding="utf-8")
    for old, new in SOURCE_CORRECTIONS.items():
        source_html = source_html.replace(old, new)
    for old, new in SOURCE_TEXT_CORRECTIONS.items():
        source_html = source_html.replace(old, new)
    soup = BeautifulSoup(source_html, "html.parser")
    aid = f"bom-article-{slug}"
    gaps: list[str] = []

    h1 = soup.find("h1")
    title = h1.get_text(strip=True) if h1 else src.stem
    if h1:
        h1.decompose()

    # Lead paragraph doubles as hero summary and direct-answer body.
    lead = soup.find("p")
    lead_html = lead.decode_contents() if lead else ""
    lead_text = lead.get_text(strip=True) if lead else ""
    if lead:
        lead.decompose()
    if not lead_text:
        gaps.append("no lead paragraph found - direct-answer block omitted")
    description = bounded_sentence_summary(lead_text, 300) if lead_text else ""
    hero_summary = bounded_sentence_summary(lead_text, 280) if lead_text else ""

    # Anchors on every heading; collect h2s for the contents index.
    toc: list[tuple[str, str]] = []
    for h in soup.find_all(["h2", "h3"]):
        txt = h.get_text(strip=True)
        if not txt:
            continue
        anchor = slugify(txt)
        h["id"] = anchor
        if h.name == "h2":
            toc.append((anchor, txt))

    # Editorial image notes -> visible flags, not silent blockquotes.
    img_notes = 0
    for bq in soup.find_all("blockquote"):
        if "image placement" in bq.get_text().lower():
            note = soup.new_tag("div")
            note["class"] = ["bom-editorial-note"]
            note.append(BeautifulSoup(bq.decode_contents(), "html.parser"))
            bq.replace_with(note)
            img_notes += 1
    if img_notes:
        gaps.append(f"{img_notes} image placement note(s) still need approved artwork")

    for t in soup.find_all("table"):
        t["class"] = list(set(t.get("class", []) + ["bom-decision-table"]))

    # FAQ schema only where question-form headings genuinely exist. Use one
    # substantive visible paragraph as the accepted answer. Concatenating
    # separated paragraphs while skipping intervening lists creates schema text
    # that is not actually present as a visible answer on the page.
    faqs = []
    for h in soup.find_all(["h2", "h3"]):
        q = h.get_text(strip=True)
        if not is_question(q):
            continue
        candidates = []
        for sib in h.next_siblings:
            if isinstance(sib, Tag):
                if sib.name in ("h2", "h3"):
                    break
                if sib.name == "p":
                    text = sib.get_text(" ", strip=True)
                    if text:
                        candidates.append(text)
        if candidates:
            answer = next((text for text in candidates if len(text) >= 60), candidates[0])
            faqs.append((q, answer[:600]))
    if not faqs:
        gaps.append("no question-form headings - FAQPage schema omitted, needs editorial FAQ set")

    url = f"{SITE}/{slug}/"
    graph = [{
        "@type": "Article",
        "@id": f"{url}#article",
        "headline": title,
        "description": description,
        "inLanguage": "en-US",
        "isPartOf": {"@id": f"{SITE}/marketing-agency-for-builders/#webpage"},
        "publisher": {"@type": "Organization", "name": "BigOrange Marketing", "url": SITE},
    }]
    if faqs:
        graph.append({
            "@type": "FAQPage",
            "@id": f"{url}#faq",
            "mainEntity": [
                {"@type": "Question", "name": q,
                 "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in faqs
            ],
        })
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, indent=2)

    toc_html = "".join(f'<li><a href="#{a}">{t}</a></li>' for a, t in toc)
    answer_html = (
        f'<div id="direct-answer" class="bom-answer-block">'
        f'<strong class="bom-aeo-label">Direct answer</strong><p>{lead_html}</p></div>'
        if lead_html else ""
    )

    html = f"""<!-- wp:html -->
<style id="{aid}-styles">{donor_css(donor, aid)}</style>
<script type="application/ld+json">{ld}</script>
<article id="{aid}" class="bom-branded-article">
  <header class="bom-article-hero is-copy-only">
    <div class="bom-article-hero-copy">
      <img class="bom-article-logo" src="{SITE}/wp-content/uploads/2026/08/bigorange-logo-orange.png" alt="BigOrange Marketing" width="180" height="40">
      <h1 id="{aid}-title">{title}</h1>
      <p class="bom-article-summary">{hero_summary}</p>
      <div class="bom-article-meta"><div>Review draft</div><div>BigOrange Marketing</div></div>
    </div>
  </header>
  <div class="bom-article-layout">
    <nav class="bom-article-index" aria-label="Contents">
      <strong>On this page</strong>
      <ol>{toc_html}</ol>
    </nav>
    <div class="bom-article-body">
      {answer_html}
      {soup.decode()}
    </div>
  </div>
</article>
<!-- /wp:html -->
"""
    return html, {"title": title, "toc": len(toc), "faqs": len(faqs),
                  "img_notes": img_notes, "gaps": gaps}


def demo():
    """Self-check on a minimal fragment: structure derived, nothing invented."""
    import tempfile
    d = Path(tempfile.gettempdir())
    donor = d / "_donor.html"
    donor.write_text('<style id="bom-article-5550-styles">#bom-article-5550{color:red}</style>',
                     encoding="utf-8")
    frag = d / "_frag.html"
    frag.write_text(
        "<h1>Test Title</h1><p>Lead sentence here.</p>"
        "<h2>Why does this matter?</h2><p>Because of reasons.</p>"
        "<h2>Plain section</h2><p>Body.</p>"
        "<blockquote><p>Image placement note: put art here.</p></blockquote>"
        "<table><tr><td>x</td></tr></table>", encoding="utf-8")
    html, st = upgrade(frag, donor, "test-slug")
    assert st["title"] == "Test Title", st
    assert st["toc"] == 2, st
    assert st["faqs"] == 1, st                        # only the question-form heading
    assert st["img_notes"] == 1, st
    assert 'id="why-does-this-matter"' in html         # anchors added
    assert "bom-answer-block" in html                  # direct answer built from lead
    assert "FAQPage" in html and "bom-decision-table" in html
    assert "bom-article-test-slug" in html             # css re-scoped
    assert "Lead sentence here." in html
    assert bounded_sentence_summary("One complete sentence. Another complete sentence.", 24) == "One complete sentence."
    try:
        bounded_sentence_summary("This lead has no terminal punctuation", 300)
    except ValueError:
        pass
    else:
        raise AssertionError("unterminated lead should fail rather than be sliced")
    for f in (donor, frag):
        f.unlink()
    print("demo: OK - structure derived, FAQ only from question headings, gaps reported")


if __name__ == "__main__":
    if sys.argv[1:2] == ["--demo"]:
        demo(); raise SystemExit
    donor = Path(sys.argv[1])
    outdir = Path(sys.argv[-1]); outdir.mkdir(parents=True, exist_ok=True)
    rows = []
    for s in [Path(p) for p in sys.argv[2:-1]]:
        slug = re.sub(r"^[A-Z]+-\d+-", "", s.stem)
        html, st = upgrade(s, donor, slug)
        (outdir / f"{s.stem}.upgraded.html").write_text(html, encoding="utf-8")
        rows.append((s.stem, st))
        print(f"{s.stem[:44]:46s} toc={st['toc']:2d} faq={st['faqs']:2d} imgnotes={st['img_notes']}"
              + ("  GAPS: " + "; ".join(st["gaps"]) if st["gaps"] else ""))
    print(f"\n{len(rows)} fragments upgraded")
