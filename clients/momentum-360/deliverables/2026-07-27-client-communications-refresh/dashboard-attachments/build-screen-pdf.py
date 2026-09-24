from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent
PAIRS = [
    (
        ROOT / "Kimberly-James-Bridal-Advertising-Dashboard-2026-07-27-full.png",
        ROOT / "Kimberly-James-Bridal-Advertising-Dashboard-2026-07-27.pdf",
    ),
    (
        ROOT / "Omega-Landscaping-Advertising-Dashboard-2026-07-27-full.png",
        ROOT / "Omega-Landscaping-Advertising-Dashboard-2026-07-27.pdf",
    ),
]


def build_pdf(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGB")
    pixels = np.asarray(image)
    background = pixels[-1, 0].astype(np.int16)
    distance = np.max(np.abs(pixels.astype(np.int16) - background), axis=2)
    row_activity = np.count_nonzero(distance > 10, axis=1)

    active_rows = np.flatnonzero(row_activity > 8)
    if not active_rows.size:
        raise RuntimeError(f"No rendered dashboard content found in {source}")

    content_bottom = min(image.height, int(active_rows[-1]) + 100)
    image = image.crop((0, 0, image.width, content_bottom))
    activity = row_activity[:content_bottom]

    pages: list[Image.Image] = []
    start = 0
    target_height = 1800
    search_radius = 240
    minimum_page_height = 1250

    while start < content_bottom:
        remaining = content_bottom - start
        if remaining <= target_height:
            end = content_bottom
        else:
            target = start + target_height
            low = max(start + minimum_page_height, target - search_radius)
            high = min(content_bottom, target + search_radius)
            candidates = np.arange(low, high)
            scores = activity[low:high]
            quiet = candidates[scores < image.width * 0.015]
            if quiet.size:
                end = int(quiet[np.argmin(np.abs(quiet - target))])
            else:
                end = int(candidates[np.argmin(scores)])

        page = image.crop((0, start, image.width, end))
        pages.append(page)
        start = end

    pages[0].save(
        destination,
        "PDF",
        resolution=144,
        save_all=True,
        append_images=pages[1:],
    )
    print(f"{destination.name}: {len(pages)} pages from {content_bottom}px")


for source_path, destination_path in PAIRS:
    build_pdf(source_path, destination_path)

