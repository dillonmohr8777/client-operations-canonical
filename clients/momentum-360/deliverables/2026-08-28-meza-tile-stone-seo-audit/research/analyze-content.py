import json
import re
import sys
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path


STOP = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
    "have", "in", "is", "it", "of", "on", "or", "our", "that", "the", "their",
    "this", "to", "we", "with", "you", "your",
}


def tokens(text):
    return [t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in STOP and len(t) > 2]


def shingles(items, size=5):
    return {tuple(items[i : i + size]) for i in range(max(0, len(items) - size + 1))}


def jaccard(left, right):
    union = left | right
    return len(left & right) / len(union) if union else 0.0


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: analyze-content.py input.json output.json")
    source = Path(sys.argv[1])
    target = Path(sys.argv[2])
    data = json.loads(source.read_text(encoding="utf-8"))
    pages = [p for p in data["pages"] if not p["url"].startswith("https://www.")]
    token_map = {p["url"]: tokens(p.get("main_text", "")) for p in pages}
    shingle_map = {url: shingles(value, 5) for url, value in token_map.items()}

    pairs = []
    for left, right in combinations(shingle_map, 2):
        similarity = jaccard(shingle_map[left], shingle_map[right])
        if similarity >= 0.12:
            pairs.append({"left": left, "right": right, "jaccard_5gram": round(similarity, 4)})
    pairs.sort(key=lambda row: row["jaccard_5gram"], reverse=True)

    occurrences = defaultdict(set)
    for url, items in token_map.items():
        for gram in shingles(items, 8):
            occurrences[gram].add(url)
    repeated = [
        {"phrase": " ".join(gram), "page_count": len(urls), "urls": sorted(urls)}
        for gram, urls in occurrences.items()
        if len(urls) >= 4
    ]
    repeated.sort(key=lambda row: (-row["page_count"], row["phrase"]))

    cities = [
        "centennial", "denver", "castle rock", "colorado springs", "thornton",
        "westminster", "fountain", "fort carson", "monument", "evergreen", "aurora",
        "parker", "elizabeth", "littleton", "morrison", "golden", "lakewood",
        "englewood", "arvada", "greenwood village",
    ]
    city_counts = []
    for p in pages:
        text = p.get("main_text", "").lower()
        hits = {city: len(re.findall(r"\b" + re.escape(city) + r"\b", text)) for city in cities}
        city_counts.append({"url": p["url"], "city_mentions": {k: v for k, v in hits.items() if v}})

    high_intent_groups = {
        "tile_installation": [p["url"] for p in pages if "tile-installation" in p["url"]],
        "tile_cost": [p["url"] for p in pages if "cost" in p["url"] and "tile" in p["url"]],
        "tile_repair": [p["url"] for p in pages if "damaged-tile" in p["url"] or "tile-repair" in p["url"] or "grout" in p["url"]],
        "remodeling": [p["url"] for p in pages if "/remodeling" in p["url"]],
    }

    result = {
        "source": str(source),
        "page_count": len(pages),
        "highest_similarity_pairs": pairs[:30],
        "repeated_8grams_across_4plus_pages": repeated[:60],
        "city_mentions": city_counts,
        "possible_intent_overlap_groups": high_intent_groups,
    }
    target.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps({
        "page_count": len(pages),
        "top_pairs": pairs[:12],
        "repeated_phrase_count": len(repeated),
        "intent_groups": high_intent_groups,
    }, indent=2))


if __name__ == "__main__":
    main()
