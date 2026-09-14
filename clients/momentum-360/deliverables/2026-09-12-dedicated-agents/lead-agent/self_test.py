"""One offline check, real redacted CRM context + explicitly synthetic events."""
import copy
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import lead_agent as a

root = Path(__file__).resolve().parent
crm = a.load(root.parent / "live-crm-snapshot.json")
as_of = crm["readAt"]
checks = 0
def check(value):
    global checks
    assert value
    checks += 1

with tempfile.TemporaryDirectory() as folder:
    folder = Path(folder)
    path = folder / "test.sqlite"
    db = sqlite3.connect(path)
    a.init(db)
    event = a.demo_events(crm)[0]
    def go(e, snapshot=crm, at=as_of):
        with db:
            return a.process(e, snapshot, db, {"synthetic-demo"}, {"C05R2B1ULF6"}, as_of=at)["packets"][0]
    first = go(event)
    check(first["owner"] == "84251079")
    check(first["crm_context"]["task_status"] == "NOT_STARTED")
    check(first["crm_context"]["campaign"] == "2026 Suspension Ads")
    check(first["review_reasons"] == ["mapping_required"])
    check(first["provenance"]["source_locator"] == event["source_locator"])
    check(first["crm_read_at"] == as_of)
    second = go(a.demo_events(crm)[1])
    check(second["crm_context"]["task_status"] == "IN_PROGRESS")
    enriched = go(dict(event, campaign_id="a"))
    enriched = go(dict(event, campaign_id="b"))
    enriched = go(dict(event, campaign_id="c", ad_id="ad-new"))
    check(enriched["conflicts"]["campaign_id"] == ["a", "b", "c"])
    check(enriched["fields"]["campaign_id"] == "a")
    check(enriched["fields"]["ad_id"] == "ad-new")
    blank = go(dict(event, campaign_id=""))
    check(blank["fields"]["campaign_id"] == "a")
    check(blank["packet_id"] == first["packet_id"])
    db.close()
    db = sqlite3.connect(path)
    restarted = go(event)
    check(restarted["packet_id"] == first["packet_id"])
    check(db.execute("SELECT count(*) FROM lead_review_v2").fetchone()[0] == 2)
    separate = go(dict(event, event_id="new-inquiry"))
    check(separate["inquiry_id"] != first["inquiry_id"])
    collision1 = go(dict(event, source_system="a:b", event_id="c"))
    collision2 = go(dict(event, source_system="a", event_id="b:c"))
    check(collision1["event_key"] != collision2["event_key"])
    link = {"verified": True, "crm_record_id": event["contact_id"],
            "contact_id": event["contact_id"], "evidence_ref": "fixture://verified"}
    linked_event = dict(event, event_id="linked", verified_event_link=link)
    check(go(linked_event)["review_state"] == "linked_verified")
    check("mapping_required" in go(dict(event,event_id="badlink",verified_event_link=dict(link,crm_record_id="wrong")))["review_reasons"])
    check(go(dict(linked_event, event_id="readerror"), dict(crm,state="read_error"))["review_state"] == "held")
    check("crm_unverified" in go(dict(event,event_id="unknownstate"),dict(crm,state="nonsense"))["review_reasons"])
    check("crm_stale" in go(dict(event,event_id="stale"), at="2026-09-15T00:00:00Z")["review_reasons"])
    check("crm_future_timestamp" in go(dict(event,event_id="future"),at="2026-09-10T00:00:00Z")["review_reasons"])
    unresolved = go(dict(event,event_id="resolved",status="resolved"))
    check(unresolved["status"] == "open" and "resolved_requires_evidence" in unresolved["review_reasons"])
    resolved = go(dict(event,event_id="resolved",status="resolved",resolved_evidence_ref="fixture://receipt"))
    check(resolved["status"] == "resolved" and resolved["resolved_evidence_ref"] == "fixture://receipt")
    newer = copy.deepcopy(crm)
    newer["readAt"] = "2026-09-12T23:00:00Z"
    newer["records"][0]["ownerId"] = "owner-new"
    newer["records"][0]["task"]["status"] = "IN_PROGRESS"
    updated = go(event,newer,at=newer["readAt"])
    check(updated["owner"] == "owner-new" and updated["crm_context"]["task_status"] == "IN_PROGRESS")
    check(updated["context_provenance"]["owner_id"] == newer["readAt"])
    missing = copy.deepcopy(newer)
    missing["readAt"] = "2026-09-12T23:01:00Z"
    missing["records"][0]["ownerId"] = ""
    held = go(event,missing,at=missing["readAt"])
    check(held["owner"] == "owner-new" and "crm_context_retained_from_previous_read" in held["review_reasons"])
    check(held["context_provenance"]["owner_id"] == newer["readAt"])
    count = db.execute("SELECT count(*) FROM lead_review_v2").fetchone()[0]
    for bad in (None, [], dict(event, portal_id="242825734"), dict(event,source_id="wrong"),
                dict(event,channel_id="wrong"), dict(event,occurred_at="2026-09-12"),
                dict(event,source_locator=""),dict(event,event_id=[])):
        try:
            go(bad)
            raise AssertionError("invalid event accepted")
        except ValueError:
            checks += 1
    for bad in (None, dict(crm,route={}), dict(crm,readAt="yesterday"),
                dict(crm,records=[None]),dict(crm,route=dict(crm["route"],identity="invalid")),
                dict(crm,route=dict(crm["route"],portalId="242825734"))):
        try:
            go(event,bad)
            raise AssertionError("invalid snapshot accepted")
        except ValueError:
            checks += 1
    check(db.execute("SELECT count(*) FROM lead_review_v2").fetchone()[0] == count)
    check(a.process(None,None,db,set(),set(),True)["state"] == "STOPPED")
    db.close()
    stop = subprocess.run([sys.executable,str(root/"lead_agent.py"),"--stop","--db",str(folder/"never.sqlite"),
                           "--output",str(folder/"stop.json"),"--crm-json","missing","--event-json","missing"],capture_output=True,text=True)
    check(stop.returncode == 0 and a.load(folder/"stop.json")["state"] == "STOPPED")
    check(not (folder/"never.sqlite").exists())
print(json.dumps({"state":"PASS","checks":checks,"scope":"offline; real redacted CRM context, synthetic transport events"}))
