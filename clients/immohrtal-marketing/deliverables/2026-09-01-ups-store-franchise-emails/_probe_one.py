from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_list import extract_record, fetch

url = "https://locations.theupsstore.com/ne/omaha/321-s-17th-st"
html = fetch(url)
print("len", len(html))
print("ldjson", html.count("application/ld+json"))
print("email word", "email" in html.lower())
print("store@", "theupsstore.com" in html.lower())
print("head", html[:200].replace("\n", " "))
rec = extract_record(url, html)
print("rec", rec)
