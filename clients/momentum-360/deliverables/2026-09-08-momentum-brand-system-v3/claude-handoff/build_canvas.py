"""Pack assets, convert the seven artboards, merge canvas.json, print the seed command.

Builds only. Never seeds and never publishes — those wait for Dillon's SAVE.

    python claude-handoff/build_canvas.py [--only 1]
"""
import json, pathlib, shutil, sys

HERE = pathlib.Path(__file__).resolve().parent
V3 = HERE.parent
BUILD = HERE / "build"
sys.path.insert(0, str(HERE))
import pack_assets, convert_book  # noqa: E402

# v3 pages lead; the rejected v2 ebooks are dropped from the visible canvas (their local originals
# stay untouched in the 2026-09-08-claude-design-ebooks directory); unrelated earlier work is kept
# but pushed behind the v3 pages under an Archive label.
RETIRE_V2 = True
ARCHIVE_PREFIX = "Archive \u00b7 "
PRIOR_CANVAS = (V3.parent / "2026-09-08-claude-design-ebooks" / "canvas-v2")
ART_URL = "https://claude.ai/code/artifact/e9ce7032-81b1-4970-9aca-4d39a23eafc0"
DESIGN_SKILL = pathlib.Path(
    r"C:\Users\dillo\AppData\Local\Temp\claude\bundled-skills\2.1.260"
    r"\4a712d528345a786f3d1518eeb7113ae\design")

BOOK_FILES = ["01-show-up-when-they-ask-ai.html", "02-from-missed-call-to-booked-job.html",
              "03-built-not-prompted.html", "04-the-small-business-ai-operating-system.html",
              "05-names-not-numbers.html"]
DEFAULT_H = 42000   # replaced with the measured height by verify.mjs


def main():
    only = None
    if "--only" in sys.argv:
        only = int(sys.argv[sys.argv.index("--only") + 1])

    BUILD.mkdir(parents=True, exist_ok=True)
    print("packing assets")
    amap = pack_assets.main()

    css = convert_book.font_css() + convert_book.site_css() + convert_book.OVERRIDES
    manifest = json.loads((V3 / "books-manifest.json").read_text(encoding="utf-8"))

    print("converting artboards")
    stats, artboards, pages = [], [], []

    if only is None:
        st = convert_book.convert(V3 / "brand.html", amap, css, BUILD / "BrandArt.dc.html",
                                  mode="brand")
        stats.append(st)
        artboards.append({"file": "BrandArt.dc.html", "x": 0, "y": 0, "w": 1440, "h": 5200,
                          "page": "page-v3-brand", "print": "flow", "is_interactive": True,
                          "title": "v3 \u00b7 Brand system"})
        pages.append({"id": "page-v3-brand", "name": "v3 \u00b7 Brand system"})

        st = convert_book.convert(V3 / "index.html", amap, css, BUILD / "Library.dc.html",
                                  mode="library")
        stats.append(st)
        artboards.append({"file": "Library.dc.html", "x": 1600, "y": 0, "w": 1440, "h": 3400,
                          "page": "page-v3-brand", "print": "flow", "is_interactive": True,
                          "title": "v3 \u00b7 Library"})

    for i, name in enumerate(BOOK_FILES, 1):
        if only and i != only:
            continue
        out = BUILD / f"Book{i}.dc.html"
        stats.append(convert_book.convert(V3 / name, amap, css, out, mode="book"))
        artboards.append({"file": out.name, "x": 0, "y": 0, "w": 1440, "h": DEFAULT_H,
                          "page": f"page-v3-book-{i}", "print": "flow", "is_interactive": True,
                          "title": f'v3 Book {i} \u00b7 {manifest["books"][i-1]["title"]}'})
        pages.append({"id": f"page-v3-book-{i}",
                      "name": f'v3 Book {i} \u00b7 {manifest["books"][i-1]["title"]}'})

    for s in stats:
        print(f"  {s['file']:22} {s['bytes']/1024:6.0f} KB  jumps={s['jumps']:3d} "
              f"chapters={s['chapters']:3d} controls={sum(s['controls'].values())} "
              f"extras={','.join(s.get('extras') or ['-'])}")

    if only:
        print("\n--only build: canvas.json not merged, nothing staged for seeding")
        return

    # ---- canvas: v3 first, then whatever earlier work is worth keeping, labelled Archive ----
    canvas = {"artboards": list(artboards), "annotations": [], "pages": list(pages),
              "launch": {"view": "canvas", "page": "page-v3-brand"}}
    carried, retired = [], []
    prior = PRIOR_CANVAS / "canvas.json"
    if prior.exists():
        old = json.loads(prior.read_text(encoding="utf-8"))
        keep = []
        for a in old["artboards"]:
            if RETIRE_V2 and a["file"].startswith("Ebook"):
                retired.append(a["file"])
                continue
            keep.append(a)
        used = {a["page"] for a in keep}
        for p in old.get("pages", []):
            if p["id"] not in used:
                continue
            nm = p["name"]
            canvas["pages"].append({"id": p["id"],
                                    "name": nm if nm.startswith(ARCHIVE_PREFIX)
                                    else ARCHIVE_PREFIX + nm})
        canvas["artboards"].extend(keep)
        # An annotation pinned to a retired page would be silently relocated to the first page by
        # the editor, so drop those with their pages rather than let them resurface on the v3 board.
        live = {p["id"] for p in canvas["pages"]}
        canvas["annotations"] = [a for a in old.get("annotations", [])
                                 if a.get("page") in live or "page" not in a]
        carried = [a["file"] for a in keep]
        for f in carried:
            src = PRIOR_CANVAS / f
            if src.exists():
                shutil.copyfile(src, BUILD / f)
        for img in list(PRIOR_CANVAS.glob("*.png")) + list(PRIOR_CANVAS.glob("*.jpg")):
            if not (BUILD / "assets" / img.name).exists():
                shutil.copyfile(img, BUILD / img.name)

    # A retired artboard must not linger in the bundle directory from an earlier build.
    for f in retired:
        (BUILD / f).unlink(missing_ok=True)

    (BUILD / "canvas.json").write_text(json.dumps(canvas, indent=2), encoding="utf-8")

    print(f"\ncanvas.json: {len(canvas['artboards'])} artboards "
          f"({len(artboards)} v3, {len(carried)} archived), {len(canvas['pages'])} pages; "
          f"launch = {canvas['launch']['page']}")
    if retired:
        print(f"  retired from visible canvas: {', '.join(retired)} "
              f"(local originals untouched in {PRIOR_CANVAS.name}/)")
    print("\nnext: node claude-handoff/verify.mjs      (writes measured heights)")
    print("then, ONLY after Dillon sends SAVE, from the v3 directory:\n")
    print(f'  node "{DESIGN_SKILL / "seed-canvas.mjs"}" \\\n'
          f'    --template "{DESIGN_SKILL / "payload.template.html"}" \\\n'
          f'    --out claude-handoff/build/momentum-ai-launch-collateral.html \\\n'
          f'    --title "Momentum AI Launch Collateral" \\\n'
          f'    $(for f in claude-handoff/build/*.dc.html; do printf -- "--artboard %s " "$f"; done) \\\n'
          f'    $(for f in claude-handoff/build/*.jpg claude-handoff/build/*.png '
          f'claude-handoff/build/assets/*; do printf -- "--image %s " "$f"; done) \\\n'
          f'    --canvas claude-handoff/build/canvas.json\n')
    print(f"  then --check the output, then publish to {ART_URL}")
    print('  with contract "0.1.31" and NO capabilities argument.')


if __name__ == "__main__":
    main()
