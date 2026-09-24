"""Build the BigOrange review ZIP from a passing source manifest."""

from __future__ import annotations

import json
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "CANONICAL-PACKAGE-MANIFEST.json"
ARCHIVE = ROOT / "BigOrange-Sept3-Canonical-Review-Package.zip"


def safe_source(relative: str) -> Path:
    source = (ROOT / relative).resolve()
    if ROOT.resolve() not in source.parents:
        raise SystemExit(f"source escapes package root: {relative}")
    if not source.is_file():
        raise SystemExit(f"missing source: {relative}")
    return source


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if manifest.get("sourceValidationStatus") != "PASS":
        raise SystemExit("refusing to build from a non-passing source manifest")

    entries: dict[str, Path] = {}
    for row in manifest["files"] + manifest["documents"]:
        archive_path = row["archivePath"]
        if archive_path in entries:
            raise SystemExit(f"duplicate archive path: {archive_path}")
        entries[archive_path] = safe_source(row["sourcePath"])
    manifest_path = manifest["archive"]["manifestArchivePath"]
    entries[manifest_path] = MANIFEST

    expected = manifest["archive"]["expectedEntries"]
    if len(entries) != expected:
        raise SystemExit(f"manifest expected {expected} entries, builder resolved {len(entries)}")

    temporary = ARCHIVE.with_suffix(".tmp.zip")
    with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for archive_path, source in sorted(entries.items()):
            zf.write(source, archive_path)
    temporary.replace(ARCHIVE)
    print(f"BUILT: {ARCHIVE.name} with {len(entries)} exact entries")


if __name__ == "__main__":
    main()
