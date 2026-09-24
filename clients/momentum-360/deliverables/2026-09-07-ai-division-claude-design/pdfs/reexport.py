"""Re-export the browser-printed PDFs with headers and footers off.

The originals were printed from Chrome with its header and footer on, which
stamped a timestamp and a file:///C:/Users/... path onto every page.
02 (one-pagers) and 08 (snapshot) are rebuilt by their own generators.

    python reexport.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
DELIV = HERE.parents[1]
sys.path.insert(0, str(DELIV / "_print"))
from momentum_print import to_pdf  # noqa: E402

JOBS = {
    "03-Momentum-AI-Division-Launch-Kit.pdf": DELIV / "2026-09-05-ai-division-launch-kit" / "index.html",
    "04-Momentum-AI-Command-Center.pdf": HERE.parent / "interactive" / "index.html",
    "05-Momentum-AI-Ebook-Get-Found-By-AI.pdf": HERE.parent / "interactive" / "ebook-get-found.html",
    "06-Momentum-AI-Ebook-Content-That-Moves.pdf": HERE.parent / "interactive" / "ebook-ai-marketing.html",
    "07-Momentum-AI-Readiness-Diagnostic.pdf": HERE.parent / "interactive" / "diagnostic.html",
}

if __name__ == "__main__":
    for pdf, src in JOBS.items():
        print(to_pdf(src, HERE / pdf, margin="10mm"))
