"""Retry local Erie sites, then keep only owner-operated published mailboxes."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from collect_erie_sendable import inspect_site, place_reason, observation  # noqa: E402

RETRY_DOMAINS = {
    "arbeatty.com",
    "barberautopa.com",
    "boyermarinesales.com",
    "bloomerflowerspa.com",
    "bigfootpestcontrolerie.com",
    "cidermillapts.com",
    "bates-collision.com",
    "chiropracticfitnesserie.com",
    "coolrenewmedspa.com",
    "cooleytireservice.com",
    "duggansappliance.com",
    "eastwaylanes.com",
    "follysend.com",
    "gameovertattoo.net",
    "greatwallgb.com",
    "glcerie.com",
    "hprinting.com",
    "ichibanichiban.com",
    "griffitheyecenter.com",
    "lorieswildridge.com",
    "lacasadepizza.com",
    "weinsureerie.com",
    "meadowlarkstructures.com",
    "autogallerynortheast.com",
    "mydadspizzaanddeli.com",
    "pekingerie.com",
    "pinejunctiontavern.com",
    "oasispuberie.com",
    "pennocksnortheast.net",
    "niagaracarwash.net",
    "rivieramotelerie.com",
    "rosebudflowershop.com",
    "rogerstrailers.com",
    "schmidtfuneralhomeerie.com",
    "prichardchiropractic.com",
    "potratz.com",
    "ruscittisauto.com",
    "royalchopstixerie.com",
    "southonesupply.com",
    "springfieldmonument.com",
    "skunkandgoattavern.com",
    "sarasandsallys.com",
    "tjsplumbing.com",
    "torerosmexicanrestaurants.com",
    "uglytunatavern.com",
    "unclejohnselkcreekcamp.com",
    "doleskiwolfordortho.com",
    "ascendclimbing.com",
}

DENY_EMAIL = {
    "steve.r.odom@questdiagnostics.com",
    "rewards@crosbysstores.com",
    "info@erieairport.org",
    "info@porterie.org",
    "impallari@gmail.com",
    "hello@rfuenzalida.com",
    "info@route1a.com",
    "thebrandphotography@outlook.com",
    "info@euma-erie.org",
    "greenscenethrift@gmail.com",
    "info@eriehumanesociety.org",
    "info@alcanoncluberie.com",
    "gemcityoutdoorsmenclub@gmail.com",
    "socialmedia@mtsd.org",
    "joe@gmail.com",
}

DENY_DOMAIN = {
    "associatedclinicallabs.com",
    "crosbysstores.com",
    "erieairport.org",
    "porterie.org",
    "wagnermowerandplow.com",
    "westpenncollision.com",
    "route1a.com",
    "thebrand.photo",
    "euma-erie.org",
    "greenscenethrift.org",
    "eriehumanesociety.org",
    "alcanoncluberie.com",
    "gemcityoutdoorsmen.com",
    "questdiagnostics.com",
    "orphanangels.org",
}

ALLOW_EVEN_IF_UNKNOWN = {
    "affinityfamilysupportservicespc.com",
    "andorasbubble.com",
    "vetsatwaterford.com",
    "beachzero.com",
    "bayhousepier6.com",
    "burtonquinnscott.com",
    "ccarlinplumbing.com",
    "bucketscharters.com",
    "foodeist.com",
    "altairre.com",
    "corryfab.com",
    "familydentistrycorryuc.com",
    "familyaffaircampground.com",
    "gatesmankitchenandbath.weebly.com",
    "gcwoodcraft.com",
    "eriebraces.com",
    "jacksonplumbingerie.com",
    "jeanevansthompsonfh.com",
    "powellmobilehomes.com",
    "prmrehab.com",
    "presqueislepassage.com",
    "purristacatcafe.com",
    "primotailoring.com",
    "rabidnerd.com",
    "psnlabs.com",
    "roscoserie.com",
    "runstedlerliferetire.com",
    "sarascampground.com",
    "schuttewoodworking.net",
    "sloppyducksaloon.com",
    "starplushomecare.com",
    "thaitasteerie.com",
    "theinsulationguy.com",
    "trtoferie.net",
    "upick6.com",
    "valeriospizzeria.com",
    "waldameer.com",
    "winsautomotive.com",
        "zimmermanstorage.com",
        "forestparkhonda.com",
        "rothcadillacerie.com",
        "affinityfamilysupportservicespc.com",
    }


def email_ok(addr: str) -> bool:
    value = (addr or "").strip().lower().lstrip("\xa0 ")
    if not value or "@" not in value:
        return False
    if value in DENY_EMAIL:
        return False
    if value.startswith("webmaster@") or value.startswith("rewards@"):
        return False
    return True


def keep(row: dict) -> bool:
    email = (row.get("email") or "").strip().lower().lstrip("\xa0 ")
    domain = (row.get("domain") or "").lower()
    if not email_ok(email):
        return False
    if domain in DENY_DOMAIN:
        return False
    if domain in ALLOW_EVEN_IF_UNKNOWN:
        return True
    return False


def main() -> None:
    inspected = json.loads((ROOT / "erie-inspected.json").read_text(encoding="utf-8"))
    by_domain = {(r.get("domain") or "").lower(): r for r in inspected}
    retries = [r for r in inspected if (r.get("domain") or "").lower() in RETRY_DOMAINS]
    print(f"retrying {len(retries)}", flush=True)
    for row in retries:
        # Prefer a bare homepage if the stored URL is a store locator.
        url = row.get("officialUrl") or ""
        if "stores." in url or "locations." in url:
            continue
        updated = inspect_site(row)
        by_domain[(updated.get("domain") or "").lower()] = updated
        print(f"{updated.get('domain')} {updated.get('emailStatus')} {updated.get('email')}", flush=True)

    merged = list(by_domain.values())
    sendable = []
    seen = set()
    for row in merged:
        email = (row.get("email") or "").strip().lower().lstrip("\xa0 ")
        row["email"] = email
        if not keep(row):
            continue
        if email in seen:
            continue
        seen.add(email)
        if not row.get("localPlaceReason"):
            row["localPlaceReason"] = place_reason(row["business"], row.get("city") or "Erie", "")
        if not row.get("liveSiteObservation"):
            row["liveSiteObservation"] = observation(
                row.get("pageTitle") or "",
                row.get("pageH1") or "",
                row.get("pageMeta") or "",
                row["business"],
            )
        sendable.append(row)

    sendable.sort(key=lambda r: r["business"].lower())
    (ROOT / "erie-inspected.json").write_text(json.dumps(merged, indent=2) + "\n", encoding="utf-8")
    (ROOT / "erie-sendable.json").write_text(json.dumps(sendable, indent=2) + "\n", encoding="utf-8")
    (ROOT / "erie-final-summary.json").write_text(
        json.dumps(
            {
                "sendable": len(sendable),
                "rule": "Owner-operated Erie businesses with a published mailbox only.",
                "emails": [r["email"] for r in sendable],
                "businesses": [r["business"] for r in sendable],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print("SENDABLE", len(sendable))
    for row in sendable:
        print(f"{row['email']}\t{row['business']}")


if __name__ == "__main__":
    main()
