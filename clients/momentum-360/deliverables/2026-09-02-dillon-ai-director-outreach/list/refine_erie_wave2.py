"""Keep owner-operated Erie County shops from the chamber harvest."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

DROP_DOMAIN = {
    "altairre.com",
    "burtonquinnscott.com",
    "redcross.org",
    "huntington.com",
    "pnc.com",
    "edwardjones.com",
    "ml.com",
    "advisor.ml.com",
    "equitable.com",
    "newyorklife.com",
    "hubinternational.com",
    "ameripriseadvisors.com",
    "wsfsbank.com",
    "sunb.com",
    "nationalfuel.com",
    "wegmans.com",
    "orkin.com",
    "redroof.com",
    "servpro.com",
    "nothingbundtcakes.com",
    "shrinerschildrens.org",
    "my.clevelandclinic.org",
    "ahn.org",
    "healthcareathome.com",
    "eriercd.org",
    "ects.org",
    "eriewater.org",
    "eriewaterworks.org",
    "ride-the-e.com",
    "millcreektownship.com",
    "summittownship.com",
    "lamar.com",
    "cellphonerepair.com",
    "fastsigns.com",
    "spherion.com",
    "fccscouting.org",
    "scouting.org",
    "ccaeducate.me",
    "mpslakers.com",
    "edinborofire.org",
    "aus.com",
    "movement.com",
    "ecrda.net",
    "visiterie.com",
    "yourerie.com",
    "wqln.org",
    "wctl.org",
    "milb.com",
    "seawolves.com",
    "ecgra.org",
    "erieddc.org",
    "geedc.org",
    "gecac.org",
    "corryidc.org",
    "impactcorry.com",
    "erieconstructioncouncil.com",
    "eriedeic.org",
    "dowe.us",
    "diverseerie.org",
    "jawesternpa.org",
    "unitedwayerie.org",
    "trecf.org",
    "eriecommunityfoundation.org",
    "benfranklin.org",
    "cnp.benfranklin.org",
    "aceserie.org",
    "pfew.org",
    "yournpp.org",
    "nwirc.org",
    "nwir.org",
    "fsnwpa.org",
    "missionempower.org",
    "stmartincenter.org",
    "sarahreed.org",
    "bethesda1919.org",
    "ymcaerie.org",
    "wccerie.org",
    "jeserie.org",
    "lcbalife.org",
    "h-v-a.org",
    "eriebar.com",
    "achieva.info",
    "abridgetoindependence.org",
    "adagiohealth.org",
    "community-healthnet.com",
    "cacerie.org",
    "mlkcentererie.org",
    "besterie.org",
    "empowermenterie.org",
    "eriecancerwellness.org",
    "eriesblackwallstreet.org",
    "futurefocusedacademy.org",
    "mheds.org",
    "mercyhilltopcenter.com",
    "brevillier.org",
    "athenaerie.org",
    "bigideaslearning.com",
    "lincolninvestment.com",
    "nmfn.com",
    "guidantmeasurement.com",
    "wabteccorp.com",
    "essentracomponents.com",
    "essentra.com",
    "my.clevelandclinic.org",
}

DROP_NAME = (
    "red cross",
    "huntington",
    "pnc bank",
    "edward jones",
    "merrill lynch",
    "equitable advisors",
    "new york life",
    "hub international",
    "ahn ",
    "cleveland clinic",
    "catholic diocese",
    "technical school",
    "preparatory school",
    "charter academy",
    "water works",
    "transit authority",
    "gaming revenue",
    "downtown development",
    "economic development",
    "redevelopment authority",
    "workforce efficiency",
    "junior achievement",
    "boy scouts",
    "french creek council",
    "united way",
    "community foundation",
    "ymca",
    "shriners",
    "wegmans",
    "orkin",
    "red roof",
    "servpro",
    "nothing bundt",
    "fastsigns",
    "cell phone repair",
    "allied universal",
    "lamar advertising",
    "edinboro vfd",
    "volunteer fire",
    "township",
    "county bar association",
    "school district",
)

WAVE1_DOMAINS = {
    "affinityfamilysupportservicespc.com",
    "andorasbubble.com",
    "vetsatwaterford.com",
    "upick6.com",
    "beachzero.com",
    "bucketscharters.com",
    "burtonfuneralhome.com",
    "ccarlinplumbing.com",
    "altairre.com",
    "foodeist.com",
    "corryfab.com",
    "familyaffaircampground.com",
    "fducc.com",
    "forestparkhonda.com",
    "gatesmankitchenandbath.weebly.com",
    "gcwoodcraft.com",
    "eriebraces.com",
    "jacksonplumbingerie.com",
    "jeanevansthompsonfh.com",
    "powellmobilehomes.com",
    "prmrehab.com",
    "presqueislepassage.com",
    "primotailoring.com",
    "psnlabs.com",
    "purristacatcafe.com",
    "rabidnerd.com",
    "roscoserie.com",
    "millermgmt.com",
    "runstedlerliferetire.com",
    "sarascampground.com",
    "schuttewoodworking.net",
    "sloppyducksaloon.com",
    "starplushomecare.com",
    "thaitasteerie.com",
    "theinsulationguy.com",
    "trtoferie.net",
    "valeriospizzeria.com",
    "waldameer.com",
    "winsautomotive.com",
    "zimmermanstorage.com",
    "rothcadillacerie.com",
}

BOOST = (
    "restaurant",
    "cafe",
    "bakery",
    "brew",
    "tavern",
    "grill",
    "pizza",
    "donut",
    "chocolate",
    "wine",
    "florist",
    "gallery",
    "barber",
    "salon",
    "massage",
    "golf",
    "plumb",
    "electric",
    "hvac",
    "construct",
    "remodel",
    "landscap",
    "clean",
    "auto",
    "ford",
    "funeral",
    "print",
    "sign",
    "hotel",
    "inn",
    "camp",
    "vet",
    "dental",
    "ortho",
    "chiro",
    "studio",
    "boutique",
    "shop",
    "market",
    "coffee",
    "bean",
    "pub",
    "mechan",
    "roof",
    "paint",
    "concrete",
    "vacuum",
    "exterminat",
    "pest",
)


def score(row: dict) -> int:
    blob = f"{row.get('business', '')} {row.get('category', '')} {row.get('domain', '')}".lower()
    points = 10
    if any(token in blob for token in BOOST):
        points += 20
    if row.get("pageH1") or row.get("pageTitle"):
        points += 3
    if (row.get("officialUrl") or "").startswith("http"):
        points += 2
    return points


def keep(row: dict) -> bool:
    domain = (row.get("domain") or "").lower()
    name = (row.get("business") or "").lower()
    email = (row.get("email") or "").lower()
    if domain in DROP_DOMAIN or domain in WAVE1_DOMAINS:
        return False
    if any(part in name for part in DROP_NAME):
        return False
    if email.endswith((".gov", ".edu", ".pa.us")):
        return False
    if "bank" in name and "food" not in name:
        return False
    return True


def main() -> None:
    inspected = json.loads((ROOT / "erie-wave2-inspected.json").read_text(encoding="utf-8"))
    sent = {
        m["email"].lower()
        for m in json.loads((ROOT.parent / "sends" / "erie-messages.json").read_text(encoding="utf-8"))["messages"]
    }
    rows = []
    seen_email = set()
    seen_domain = set()
    for row in inspected:
        email = (row.get("email") or "").lower()
        domain = (row.get("domain") or "").lower()
        if not email or email in sent or email in seen_email:
            continue
        if not keep(row):
            continue
        if domain and domain in seen_domain:
            continue
        seen_email.add(email)
        if domain:
            seen_domain.add(domain)
        rows.append(row)
    rows.sort(key=lambda r: (-score(r), r["business"].lower()))
    sendable = rows[:200]
    summary = {
        "generatedAtUtc": json.loads((ROOT / "erie-wave2-summary.json").read_text(encoding="utf-8")).get("generatedAtUtc"),
        "refined": True,
        "eligible": len(rows),
        "sendable": len(sendable),
        "rule": "Wave 2 refined. Owner-operated Erie County shops from chamber published emails. No wave 1 remmail.",
        "emails": [r["email"] for r in sendable],
        "businesses": [r["business"] for r in sendable],
        "top": [(r["business"], r["email"], score(r)) for r in sendable[:25]],
    }
    (ROOT / "erie-wave2-sendable.json").write_text(json.dumps(sendable, indent=2) + "\n", encoding="utf-8")
    (ROOT / "erie-wave2-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"eligible": len(rows), "sendable": len(sendable), "top": summary["top"]}, indent=2))


if __name__ == "__main__":
    main()
