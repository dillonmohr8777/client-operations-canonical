"""QA pass for the AI division video batch. Per piece: probe codec/dims/fps/
duration, pull a 6-frame contact sheet, and scan those frames for forbidden
hues (purple/violet; orange beyond a small accent area). Writes
qa-report.json and one contact sheet per video.

    python qa.py
"""
from __future__ import annotations
import json
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).parent
QA_DIR = HERE / "qa"
QA_DIR.mkdir(exist_ok=True)


def probe(path: pathlib.Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration:stream=width,height,r_frame_rate,codec_name,color_primaries,color_transfer,color_space",
         "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    return json.loads(out.stdout)


def contact_sheet(path: pathlib.Path, out_png: pathlib.Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(path),
         "-vf", "select='not(mod(n\\,24))',scale=240:-1,tile=6x1",
         "-frames:v", "1", str(out_png)],
        check=True,
    )


def hue_scan(png: pathlib.Path) -> dict:
    try:
        from PIL import Image
    except ImportError:
        return {"skipped": "Pillow not installed"}
    im = Image.open(png).convert("RGB")
    w, h = im.size
    px = im.load()
    assert px is not None
    purple = 0
    orange = 0
    total = w * h
    for x in range(0, w, 2):
        for y in range(0, h, 2):
            r, g, b = px[x, y]  # type: ignore[misc]  # PIL stubs type RGB getitem as float
            mx, mn = max(r, g, b), min(r, g, b)
            if mx == mn:
                continue
            hue = 0.0
            d = mx - mn
            if mx == r:
                hue = (60 * ((g - b) / d) + 360) % 360
            elif mx == g:
                hue = 60 * ((b - r) / d) + 120
            else:
                hue = 60 * ((r - g) / d) + 240
            sat = d / mx if mx else 0
            if 260 <= hue <= 300 and sat > 0.25:
                purple += 1
            if 15 <= hue <= 40 and sat > 0.5:
                orange += 1
    sampled = total / 4
    return {
        "purple_pct": round(100 * purple / sampled, 2),
        "orange_pct": round(100 * orange / sampled, 2),
    }


def main() -> int:
    videos = sorted(HERE.glob("*.mp4"))
    report = []
    for v in videos:
        meta = probe(v)
        sheet = QA_DIR / f"{v.stem}.sheet.png"
        try:
            contact_sheet(v, sheet)
        except subprocess.CalledProcessError as e:
            report.append({"file": v.name, "error": str(e)})
            continue
        hue = hue_scan(sheet)
        stream = meta["streams"][0]
        row = {
            "file": v.name,
            "width": stream.get("width"),
            "height": stream.get("height"),
            "fps": stream.get("r_frame_rate"),
            "codec": stream.get("codec_name"),
            "duration_s": round(float(meta["format"]["duration"]), 2),
            "size_kb": round(v.stat().st_size / 1024, 1),
            "sheet": str(sheet.relative_to(HERE)),
            **hue,
        }
        report.append(row)
        flag = "  FLAG" if row.get("purple_pct", 0) > 0.5 or row.get("orange_pct", 0) > 8 else ""
        print(f"{v.name:32s} {stream.get('width')}x{stream.get('height')} {row['duration_s']:>5}s  purple={row.get('purple_pct','?')}%  orange={row.get('orange_pct','?')}%{flag}")

    (HERE / "qa-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nwrote qa-report.json ({len(report)} pieces)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
