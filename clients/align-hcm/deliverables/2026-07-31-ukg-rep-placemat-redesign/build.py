#!/usr/bin/env python3
"""Render the Align HCM x UKG rep placemat to a 2 page landscape PDF.

Usage:  python3 build.py

Inputs
  placemat.source.html   layout + copy, with __FONTS__ / __ALIGN__ / __UKG__ tokens
  assets/align-hcm-logo.png
  assets/ukg-logo-2025.svg

Output
  Align_HCM_UKG_Rep_Placemat.pdf   11in x 8.5in, 2 pages

Fonts (Plus Jakarta Sans) are pulled from Google Fonts once and inlined as
base64 so the PDF renders identically on any machine. Requires headless
Chromium; set CHROME to override the binary path.
"""

import base64
import os
import re
import subprocess
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = os.environ.get("CHROME", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
FONT_CSS_URL = (
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:"
    "ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap"
)
UA = {"User-Agent": "Mozilla/5.0"}


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()


def font_css():
    """Download Plus Jakarta Sans and return @font-face rules with inlined TTFs."""
    cache = os.path.join(HERE, ".fonts.css")
    if os.path.exists(cache):
        return open(cache).read()
    css = fetch(FONT_CSS_URL).decode()
    rules = []
    for block in re.findall(r"@font-face \{(.*?)\}", css, re.S):
        url = re.search(r"url\((https://[^)]+)\)", block).group(1)
        style = re.search(r"font-style: (\w+)", block).group(1)
        weight = re.search(r"font-weight: (\d+)", block).group(1)
        b64 = base64.b64encode(fetch(url)).decode()
        rules.append(
            "@font-face{font-family:'Plus Jakarta Sans';font-style:%s;font-weight:%s;"
            "src:url(data:font/ttf;base64,%s) format('truetype');}" % (style, weight, b64)
        )
    out = "\n".join(rules)
    open(cache, "w").write(out)
    return out


def data_uri(path, mime):
    with open(os.path.join(HERE, path), "rb") as fh:
        return "data:%s;base64,%s" % (mime, base64.b64encode(fh.read()).decode())


def main():
    html = open(os.path.join(HERE, "placemat.source.html")).read()
    html = html.replace("/*__FONTS__*/", font_css())
    html = html.replace("__ALIGN__", data_uri("assets/align-hcm-logo.png", "image/png"))
    html = html.replace("__UKG__", data_uri("assets/ukg-logo-2025.svg", "image/svg+xml"))

    built = os.path.join(HERE, ".build.html")
    open(built, "w").write(html)

    pdf = os.path.join(HERE, "Align_HCM_UKG_Rep_Placemat.pdf")
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer",
         "--virtual-time-budget=6000", "--print-to-pdf=" + pdf, "file://" + built],
        check=True, capture_output=True,
    )
    print("wrote %s (%d bytes)" % (pdf, os.path.getsize(pdf)))


if __name__ == "__main__":
    main()
