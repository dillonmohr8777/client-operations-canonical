"""Build deterministic contact sheets and frame-change evidence for the v2 film path."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "_reference" / "tiktok-reference.mp4"
RENDER_ROOT = ROOT / "production-v2" / "video-renders"
QA = ROOT / "qa-v2"
REFERENCE_FRAMES = ROOT / "production-v2" / "reference-crops"

SHOTS = [
    {"folder": "01-aerial", "id": "arrival", "label": "Aerial château / tennis / backyard", "start": 0.0, "end": 1.0},
    {"folder": "02-rear-pool", "id": "pool", "label": "Rear pool / estate", "start": 7.8, "end": 9.5},
    {"folder": "03-marble-living", "id": "marble", "label": "Bright marble living / kitchen", "start": 6.0, "end": 7.6},
    {"folder": "04-dark-game", "id": "game", "label": "Dark cinema / game room", "start": 1.35, "end": 1.85},
    {"folder": "05-foyer-stairs", "id": "foyer", "label": "Foyer / red art / curved stairs", "start": 2.35, "end": 2.9},
    {"folder": "06-front-hero", "id": "momentum", "label": "Front château hero", "start": 18.4, "end": 19.96},
]


def font(size: int):
    for candidate in (
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/segoeui.ttf"),
    ):
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def extract_reference_frames() -> None:
    REFERENCE_FRAMES.mkdir(parents=True, exist_ok=True)
    # This is a clean editorial crop from the supplied reference. The v2 web
    # video uses the same crop without source UI; this comparison keeps the
    # authority frame visible while the browser render shows the overlay system.
    filt = "crop=720:405:0:438,scale=640:360:flags=lanczos"
    for shot in SHOTS:
        target = REFERENCE_FRAMES / f"{shot['folder']}.jpg"
        command = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-ss", str((shot["start"] + shot["end"]) / 2), "-i", str(REFERENCE), "-frames:v", "1",
            "-vf", filt, "-q:v", "2", str(target),
        ]
        subprocess.run(command, check=True)


def fit(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGB")
    image.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, (5, 9, 20))
    canvas.paste(image, ((size[0] - image.width) // 2, (size[1] - image.height) // 2))
    return canvas


def reference_vs_v2() -> None:
    tile = (420, 236)
    sheet = Image.new("RGB", (900, 6 * 286 + 92), (5, 9, 20))
    draw = ImageDraw.Draw(sheet)
    draw.text((24, 18), "REFERENCE AUTHORITY  ↔  V2 FOOTAGE-BACKED STAGE", fill=(246, 248, 251), font=font(24))
    draw.text((24, 52), "Same supplied opening-film timestamps; right column includes Momentum 360 overlay treatment.", fill=(185, 196, 211), font=font(14))
    for index, shot in enumerate(SHOTS):
        shot_id = shot["folder"]
        label = shot["label"]
        y = 84 + index * 286
        ref = fit(Image.open(REFERENCE_FRAMES / f"{shot_id}.jpg"), tile)
        v2 = fit(Image.open(RENDER_ROOT / shot_id / "frame-04.png"), tile)
        sheet.paste(ref, (24, y + 24))
        sheet.paste(v2, (456, y + 24))
        draw.text((24, y), f"{index + 1:02d}  {label}", fill=(255, 211, 77), font=font(16))
        draw.text((24, y + 264), "SUPPLIED REFERENCE CROP", fill=(185, 196, 211), font=font(11))
        draw.text((456, y + 264), "V2 LOCAL WEB RENDER", fill=(156, 232, 237), font=font(11))
    sheet.save(QA / "reference-vs-v2-contact-sheet.jpg", quality=92, optimize=True)


def motion_sheet_and_report() -> None:
    tile = (292, 164)
    sheet = Image.new("RGB", (4 * 310 + 24, 6 * 205 + 72), (5, 9, 20))
    draw = ImageDraw.Draw(sheet)
    draw.text((24, 18), "WITHIN-SHOT MOTION / CAMERA CHANGE", fill=(246, 248, 251), font=font(24))
    draw.text((24, 48), "Each row is one editorial chapter; columns are frame 00 → 02 → 05 → 07.", fill=(185, 196, 211), font=font(14))
    indices = (0, 2, 5, 7)
    report = {"source": "site-v2/assets/media/momentum-reference-opening.mp4", "shots": []}
    for row, shot in enumerate(SHOTS):
        shot_id = shot["folder"]
        label = shot["label"]
        y = 72 + row * 205
        draw.text((24, y), f"{row + 1:02d}  {label}", fill=(255, 211, 77), font=font(14))
        frames = []
        for col, frame_index in enumerate(indices):
            path = RENDER_ROOT / shot_id / f"frame-{frame_index:02d}.png"
            image = fit(Image.open(path), tile)
            frames.append(image)
            sheet.paste(image, (24 + col * 310, y + 24))
            draw.text((29 + col * 310, y + 29), f"{frame_index:02d}", fill=(246, 248, 251), font=font(11))
        first = Image.open(RENDER_ROOT / shot_id / "frame-00.png").convert("RGB")
        last = Image.open(RENDER_ROOT / shot_id / "frame-07.png").convert("RGB")
        diff = ImageChops.difference(first, last)
        stat = ImageStat.Stat(diff)
        pixels = list(diff.convert("L").getdata())
        changed = sum(1 for value in pixels if value >= 8) / len(pixels)
        report["shots"].append({
            "id": shot_id,
            "label": label,
            "timestamp_window_seconds": [shot["start"], shot["end"]],
            "frame_pair": ["frame-00.png", "frame-07.png"],
            "mean_abs_delta_rgb": [round(value, 3) for value in stat.mean],
            "changed_fraction_threshold_8": round(changed, 4),
        })
    sheet.save(QA / "motion-contact-sheet.jpg", quality=92, optimize=True)
    (QA / "motion-difference.json").write_text(json.dumps(report, indent=2), encoding="utf-8")


def main() -> None:
    QA.mkdir(parents=True, exist_ok=True)
    extract_reference_frames()
    reference_vs_v2()
    motion_sheet_and_report()
    print(f"qa:reference-vs-v2:{QA / 'reference-vs-v2-contact-sheet.jpg'}")
    print(f"qa:motion:{QA / 'motion-contact-sheet.jpg'}")
    print(f"qa:motion-difference:{QA / 'motion-difference.json'}")


if __name__ == "__main__":
    main()
