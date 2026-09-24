from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_list import fetch

html = fetch("https://locations.theupsstore.com/ne/omaha/321-s-17th-st")
block = re.findall(r"<script[^>]*ld\+json[^>]*>(.*?)</script>", html, re.S)[0]
data = json.loads(block)
print(data.keys())
graph = data.get("@graph", [])
print("graph", len(graph), graph[0].keys() if graph else None)
print(json.dumps(graph[0], indent=2)[:1200])
