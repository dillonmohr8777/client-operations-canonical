"""Package the three generated W38 reference graphics into the This Week With BOK PDF.

The graphics come from gpt-image-2.5-sunburst via
_os/automation/weekly-images (week 2026-W38-ref-v2), with BOK's real logo
composited in-process. This script does not generate anything and costs nothing;
it only resizes to the 1080x1350 social spec and builds the packet PDF using the
same page furniture as the July 2026 reference: cover and index, then one
caption-and-graphic page per post.
"""
import pathlib
from PIL import Image

import build_weekly_packet as B

ROOT = pathlib.Path(__file__).resolve().parent
SRC = pathlib.Path(
    r"C:\Users\dillo\repos\dillon-os\_os\automation\weekly-images\out\bok-law-firm\2026-W38-house-v2"
)
GFX = ROOT / "separate-graphics" / "week-of-september-15-2026"
SQUARE = (1080, 1080)  # house template is square, matching the July 2026 reference

DISCLAIMER = "General educational information only. Not legal advice, and every family situation is different."


def cap(*paras):
    return "\n\n".join(paras + (DISCLAIMER,))


PIECES = [
    {
        "type": "social",
        "series": "Wednesday Wisdom",
        "title": "Small Routines Help Children Settle",
        "src": "wednesday-wisdom.png",
        "caption": cap(
            "When a lot is changing at home, the small repeated things do more work than the "
            "big gestures.",
            "A steady wake-up time, meals at roughly the same hours, and one calm step at "
            "bedtime give a child something they can predict. None of it has to be elaborate, "
            "and none of it has to be identical in both homes. What helps is that it happens "
            "the same way most days, so a child is not spending energy working out what comes "
            "next.",
            "At BOK Law and Mediation Services, we help families build arrangements that hold "
            "up on ordinary weeks, not just on paper.",
        ),
    },
    {
        "type": "social",
        "series": "Turn the Page Thursday",
        "title": "Mediation Can Lower the Temperature",
        "src": "turn-the-page-thursday.png",
        "caption": cap(
            "Families in the middle of a change often assume the only route forward is a "
            "contested one. It is not the only option.",
            "Mediation keeps both parents in the room and in the conversation, with a neutral "
            "third party helping structure it. What is discussed generally stays out of the "
            "public file. And choosing to sit down first gives up nothing, because if it does "
            "not work, court remains fully available.",
            "At BOK Law and Mediation Services, we help families work through parenting, "
            "support and property questions with less heat and more clarity.",
        ),
    },
    {
        "type": "social",
        "series": "Family Friday",
        "title": "Weekends Work Better With a Plan",
        "src": "family-friday.png",
        "caption": cap(
            "A weekend usually goes the way the handover goes. A little preparation on Friday "
            "afternoon takes the pressure off everyone.",
            "Bags packed before anyone is tired, a pickup time already agreed rather than "
            "negotiated at the door, and one clear message instead of five. Children read the "
            "temperature of a handover quickly, and a calm one tells them the weekend is "
            "theirs to enjoy rather than something to manage.",
            "At BOK Law and Mediation Services, we help families put arrangements in place "
            "that make ordinary weeks feel less like negotiations.",
        ),
    },
]

DATA = {
    "client": "BOK Law & Mediation Services",
    "website": "BOKLAWFIRM.COM",
    "phone": "412.941.9410",
    "status": "CLIENT REVIEW - NOT PUBLISHED",
    "disclaimer": DISCLAIMER,
    "months": [{
        "month": "Week of September 15, 2026",
        "filename": "This-Week-With-BOK-2026-W38.pdf",
        "pieces": PIECES,
    }],
}


def stage_graphics():
    """Resize the 1088x1088 renders to the 1080x1080 square social spec."""
    GFX.mkdir(parents=True, exist_ok=True)
    out = []
    for i, piece in enumerate(PIECES, start=1):
        src = SRC / piece["src"]
        assert src.exists(), f"missing generated graphic: {src}"
        dst = GFX / f"{i:02d}-{B.slugify(piece['series'])}.png"
        with Image.open(src) as im:
            assert im.size == (1088, 1088), f"unexpected source size {im.size}"
            im.convert("RGB").resize(SQUARE, Image.Resampling.LANCZOS).save(dst, quality=95)
        out.append(dst)
    return out


def main():
    B.ensure_directories()
    B.register_fonts()
    graphics = stage_graphics()
    pdf = B.build_monthly_pdf(DATA["months"][0], graphics)
    B.render_pdf_preview(pdf, B.PREVIEW_DIR / "w38-reference-packet-contact-sheet.png")
    B.render_graphics_preview(graphics, B.PREVIEW_DIR / "w38-reference-all-graphics.png")
    qa = B.run_qa(DATA, graphics, [pdf])
    B.write_qa(qa)
    print("pdf:", pdf)
    print("graphics:", len(graphics))
    print("qa:", qa["status"], "errors:", qa["errors"])


if __name__ == "__main__":
    main()
