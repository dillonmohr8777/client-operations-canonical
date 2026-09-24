from pathlib import Path
import re
import json

p = Path(__file__).with_name("gyms-locator.html")
text = p.read_text(encoding="utf-8", errors="replace")
emails = sorted(set(re.findall(r"[A-Za-z0-9._%+\-]+@snapfitness\.com", text, re.I)))
slugs = sorted(set(re.findall(r"/us/gyms/([a-z0-9\-]+)", text, re.I)))
print("emails", len(emails))
print("slugs", len(slugs))
print("sample emails", emails[:20])
print("sample slugs", slugs[:20])
print("file chars", len(text))
for pat in ["clubEmail", "emailAddress", "mailto:", "phone"]:
    print(pat, text.lower().count(pat.lower()))
# dump unique gym hrefs
hrefs = sorted(set(re.findall(r"https://www\.snapfitness\.com/us/gyms/[a-z0-9\-]+", text, re.I)))
print("full hrefs", len(hrefs))
print("sample hrefs", hrefs[:10])
Path(__file__).with_name("locator-emails.json").write_text(json.dumps({"emails": emails, "slugs": slugs, "hrefs": hrefs}, indent=2), encoding="utf-8")
