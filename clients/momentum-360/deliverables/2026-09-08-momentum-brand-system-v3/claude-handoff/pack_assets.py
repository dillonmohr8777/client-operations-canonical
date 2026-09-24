"""Derive a canvas-packageable image set from the v3 assets.

Canvas images are stored as bare base64 files entries (~33% inflation) inside a document with a
16 MB cap and a 2 MB per-entry limit. The 16 MB source set cannot go in as-is. Logos pass through
byte-for-byte; supporting art is downsampled to display size.

Reads ../assets/ live, so re-running after Root's mascot update needs no code change.
Writes only into claude-handoff/build/.
"""
import hashlib, json, pathlib, shutil, sys
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parent / "assets"
OUT = HERE / "build" / "assets"

# Byte-exact: the official marks. Never re-encoded, never resized, never redrawn.
VERBATIM = ["momentum-logo.png", "momentum-mark.png"]
# Supporting art: (max width, quality). Displayed at <=720px (mascots) and ~400px (engravings).
RECODE = {
    # six Momo scenes, each carrying the superhero m chest emblem
    "audience-mascot.png": (1200, 80), "build-mascot.png": (1200, 80),
    "hero-mascot.png": (1200, 80), "operations-mascot.png": (1200, 80),
    "phone-mascot.png": (1200, 80), "search-mascot.png": (1200, 80),
    # six standalone ceramic service icons, shown square
    "icon-audience.png": (900, 82), "icon-build.png": (900, 82),
    "icon-operations.png": (900, 82), "icon-phone.png": (900, 82),
    "icon-proof.png": (900, 82), "icon-search.png": (900, 82),
    # three engraved studies
    "bird-engraving.png": (900, 80), "botanical-engraving.png": (900, 80),
    "philly-engraving.png": (900, 80),
}
EXPECT_ILLUSTRATIONS = 15
MAX_ENTRY_KB = 400      # a packaged file this big means the recode silently failed
MAX_TOTAL_KB = 3072     # the whole packaged set, before base64 inflation


def sha(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()


def main():
    if not SRC.is_dir():
        sys.exit(f"no source assets at {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)
    for stale in OUT.iterdir():
        stale.unlink()
    amap, rows = {}, []

    for name in VERBATIM:
        s = SRC / name
        if not s.exists():
            sys.exit(f"missing required logo: {s}")
        d = OUT / name
        shutil.copyfile(s, d)
        if sha(s) != sha(d):
            sys.exit(f"logo bytes changed in copy: {name}")
        amap[f"assets/{name}"] = name
        rows.append((name, name, s.stat().st_size, d.stat().st_size, sha(s), "verbatim"))

    missing = [n for n in RECODE if not (SRC / n).exists()]
    if missing:
        sys.exit("missing illustrations: " + ", ".join(missing))
    if len(RECODE) != EXPECT_ILLUSTRATIONS:
        sys.exit(f"expected {EXPECT_ILLUSTRATIONS} illustrations, RECODE lists {len(RECODE)}")

    for name, (width, q) in RECODE.items():
        s = SRC / name
        out_name = pathlib.Path(name).stem + ".webp"
        im = Image.open(s)
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.Resampling.LANCZOS)
        im.convert("RGB").save(OUT / out_name, "WEBP", quality=q, method=6)
        amap[f"assets/{name}"] = out_name
        rows.append((name, out_name, s.stat().st_size, (OUT / out_name).stat().st_size, sha(s), f"webp q{q} w{width}"))

    total = sum(r[3] for r in rows)
    over = [r for r in rows if r[3] > MAX_ENTRY_KB * 1024]
    for src_name, out_name, sb, db, _, how in rows:
        print(f"  {src_name:26} -> {out_name:26} {sb/1024:7.0f} KB -> {db/1024:6.0f} KB  {how}")
    print(f"  packaged set: {len(rows)} files, {total/1024:.0f} KB (~{total*4/3/1024:.0f} KB as base64)")
    if over:
        sys.exit("packaged entry over %d KB: %s" % (MAX_ENTRY_KB, ", ".join(r[1] for r in over)))
    if total > MAX_TOTAL_KB * 1024:
        sys.exit(f"packaged set {total/1024:.0f} KB exceeds {MAX_TOTAL_KB} KB")

    (HERE / "build" / "asset-map.json").write_text(json.dumps({
        "map": amap,
        "files": [{"source": a, "packaged": b, "sourceBytes": c, "packagedBytes": d,
                   "sourceSha256": e, "method": f} for a, b, c, d, e, f in rows],
    }, indent=2), encoding="utf-8")
    return amap


if __name__ == "__main__":
    main()
