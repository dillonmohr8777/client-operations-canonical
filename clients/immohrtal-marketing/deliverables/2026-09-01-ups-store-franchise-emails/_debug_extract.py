from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_list import fetch

url = "https://locations.theupsstore.com/ne/omaha/321-s-17th-st"
html = fetch(url)
blocks = re.findall(r"<script[^>]*type=\"application/ld\+json\"[^>]*>(.*?)</script>", html, re.S)
print("blocks", len(blocks))
for i, block in enumerate(blocks):
    print("block", i, "len", len(block), "email" in block, "theupsstore" in block.lower())
    print(block[:300])
print("simple email", re.findall(r"store\d+@theupsstore\.com", html, re.I)[:5])
print("json email", re.findall(r'"email"\s*:\s*"[^"]+"', html)[:8])
