from pathlib import Path

import pypdfium2 as pdfium


PDF = Path(r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bigorange-marketing\deliverables\2026-08-28-content-authority-proposal\outputs\01a04906-96f3-7072-b3bf-0c2589aed6fa\BigOrange-Custom-Home-Builder-Authority-System-Proposal-2026-08-28.pdf")
OUT = Path(r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bigorange-marketing\deliverables\2026-08-28-content-authority-proposal\working\proposal-build\rendered")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pdf = pdfium.PdfDocument(str(PDF))
    for index in range(len(pdf)):
        page = pdf[index]
        bitmap = page.render(scale=1.7)
        image = bitmap.to_pil()
        image.save(OUT / f"page-{index + 1}.png")
        page.close()
    pdf.close()
    print(f"Rendered {index + 1} pages to {OUT}")


if __name__ == "__main__":
    main()
