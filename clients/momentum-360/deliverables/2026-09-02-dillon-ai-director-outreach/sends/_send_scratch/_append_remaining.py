import json
from pathlib import Path

log_path = Path(r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-send-log.jsonl")
rows = [
    {"business": "Newco Electric Co Inc", "email": "csins@newcoelectric.com", "messageId": "1a06529d165d0c79", "status": "sent", "error": None},
    {"business": "Nuance Massage Therapy", "email": "nuancemassagetherapy@gmail.com", "messageId": "1a06529d2e9f9f55", "status": "sent", "error": None},
    {"business": "Painted Finch Gallery, Inc", "email": "paintedfinchgallery@gmail.com", "messageId": "1a06529d3ea7ba20", "status": "sent", "error": None},
    {"business": "Paragon Print Systems, Inc", "email": "rhess@barcodefactory.com", "messageId": "1a06529d5411f356", "status": "sent", "error": None},
    {"business": "Plymouth Tavern", "email": "tomjthompson@gmail.com", "messageId": "1a06532cab81a681", "status": "sent", "error": None},
    {"business": "POTRATZ FLORAL SHOP & GREENHOUSES", "email": "flowers@potratz.com", "messageId": "1a06532cd4dceecd", "status": "sent", "error": None},
    {"business": "Presque Publications", "email": "jasmine@erieseniors.com", "messageId": "1a06532cfd6e8b34", "status": "sent", "error": None},
    {"business": "Printing Concepts, Inc.", "email": "ddunham@printingconceptsonline.com", "messageId": "1a06532ce6292899", "status": "sent", "error": None},
    {"business": "Process and Data Automation, LLC", "email": "janderson@processanddata.com", "messageId": "1a06533faba22270", "status": "sent", "error": None},
    {"business": "Rabe Environmental Systems, Inc.", "email": "mwilliams@rabehvac.com", "messageId": "1a06533fcfe26ea9", "status": "sent", "error": None},
    {"business": "Sanford Co., Inc.", "email": "msanford@sanfordcompany.com", "messageId": "1a06533fc396e923", "status": "sent", "error": None},
    {"business": "Schaffner, Knight, Minnaugh & Company P.C.", "email": "cknight@skmco.com", "messageId": "1a06533fed27dcc7", "status": "sent", "error": None},
]

existing = set()
if log_path.exists():
    for line in log_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        rec = json.loads(line)
        existing.add(rec.get("email", "").lower())

appended = 0
with log_path.open("a", encoding="utf-8", newline="\n") as fh:
    for row in rows:
        if row["email"].lower() in existing:
            continue
        fh.write(json.dumps(row, ensure_ascii=False) + "\n")
        existing.add(row["email"].lower())
        appended += 1

assigned = [
    "dbertges@galvanizeit.com",
    "nperobbdesignhouse@gmail.com",
    "tony@beechwoodgolfclub.com",
    "brennand@bostwickdesign.com",
    "kevinbrooksbli@gmail.com",
    "epastor@cleancoerie.com",
    "emily@cscerie.com",
    "doug@dbcremodel.com",
    "smiles@doleskiwolfordortho.com",
    "dougyaplevacuum@outlook.com",
    "stevecara@eandmsi.com",
    "info@ewa-llc.com",
    "chase@swingproject.golf",
    "jpaulson@fordtech.com",
    "donaldwoods_gcb@outlook.com",
    "richardwinston19@yahoo.com",
    "emily@glassgrowersgallery.com",
    "rking@hmro.net",
    "tony@hazardserie.com",
    "hrrinderle@jpsigns.com",
    "mjefferys@kjconstruct.com",
    "ap@konzelconstruction.com",
    "lakeeffectplumbingpa@gmail.com",
    "jlavery@laverybrewing.com",
    "team@luckybeanroast.com",
    "smelaragno@massarocorporation.com",
    "cori@mayabrothersconcrete.com",
    "rcopeland@hiteco.com",
    "joederose@mazza-hvac.com",
    "brandon@mccartyprinting.com",
    "chamilton@mcrings.com",
    "jessica@menajeriestudio.com",
    "frankie@millcreekcoffeeco.com",
    "missy@monacellamassage.com",
    "dave@mosquitoassassin.com",
    "rclause@mysalonsuite.com",
    "csins@newcoelectric.com",
    "nuancemassagetherapy@gmail.com",
    "paintedfinchgallery@gmail.com",
    "rhess@barcodefactory.com",
    "tomjthompson@gmail.com",
    "flowers@potratz.com",
    "jasmine@erieseniors.com",
    "ddunham@printingconceptsonline.com",
    "janderson@processanddata.com",
    "mwilliams@rabehvac.com",
    "msanford@sanfordcompany.com",
    "cknight@skmco.com",
]
present = 0
missing = []
for email in assigned:
    if email.lower() in existing:
        present += 1
    else:
        missing.append(email)

print(json.dumps({"appended": appended, "assigned_present": present, "assigned_missing": missing}, indent=2))
