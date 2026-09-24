from pathlib import Path
import re
import json

text = Path(__file__).with_name("gyms-locator.html").read_text(encoding="utf-8", errors="replace")
idx = text.lower().find("abbeville@snapfitness.com")
print("idx", idx)
print(text[max(0, idx - 800): idx + 400])
print("\n\n==== NEXT ====\n")
idx2 = text.lower().find("jacksonvillefl@snapfitness.com")
print("idx2", idx2)
print(text[max(0, idx2 - 800): idx2 + 400])
