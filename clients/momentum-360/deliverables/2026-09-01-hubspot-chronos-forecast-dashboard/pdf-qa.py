import json
import re
from pathlib import Path

import pypdfium2 as pdfium
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent
PDF = ROOT / "site" / "downloads" / "Momentum-360-Forecast-Pilot-Executive-Brief.pdf"
QA = ROOT / "qa"
QA.mkdir(parents=True, exist_ok=True)

reader = PdfReader(PDF)
document = pdfium.PdfDocument(PDF)
assert len(reader.pages) == 4, f"Expected four pages, found {len(reader.pages)}"

required = [
    "The system worked.",
    "The simplest baseline won.",
    "Two weeks dominate the history.",
    "Improve the target before",
    "Conversion reporting is pending validation",
]
full_text = "\n".join(page.extract_text() or "" for page in reader.pages)
def compact(value: str) -> str:
    return re.sub(r"\s+", "", value.replace("ﬁ", "fi").replace("ﬂ", "fl")).casefold()

compact_text = compact(full_text)
for phrase in required:
    assert compact(phrase) in compact_text, f"Missing required PDF phrase: {phrase}"

forbidden = ["50612503", "C:\\Users\\", "sha256", "AccessBroker", "Bitwarden"]
for term in forbidden:
    assert compact(term) not in compact_text, f"Forbidden PDF content found: {term}"

pages = []
for index, page in enumerate(reader.pages, start=1):
    width = float(page.mediabox.width)
    height = float(page.mediabox.height)
    assert abs(width - 612) < 2 and abs(height - 792) < 2, (
        f"Page {index} is not US Letter: {width} x {height}"
    )
    image_path = QA / f"pdf-page-{index}.png"
    bitmap = document[index - 1].render(scale=2.0)
    bitmap.to_pil().save(image_path)
    page_text = page.extract_text() or ""
    pages.append(
        {
            "page": index,
            "widthPoints": width,
            "heightPoints": height,
            "textCharacters": len(page_text),
            "preview": str(image_path),
        }
    )

report = {
    "status": "pass",
    "pdf": str(PDF),
    "bytes": PDF.stat().st_size,
    "pageCount": len(reader.pages),
    "pages": pages,
}
(QA / "pdf-qa.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
