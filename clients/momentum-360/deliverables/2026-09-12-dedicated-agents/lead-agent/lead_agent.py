#!/usr/bin/env python3
"""Offline Momentum inquiry review. No network, model, or delivery capability."""
import argparse
import hashlib
import json
from pathlib import Path
import sqlite3
import sys
from datetime import datetime, timezone

CLIENT, PORTAL = "momentum-360", "50612503"
ERROR_STATES = {"read_error", "stale", "token_expired", "unverified"}
EVENT_FIELDS = ("source_system", "event_id", "occurred_at", "source_locator",
                "portal_id", "source_id", "channel_id", "contact_id",
                "crm_record_id", "campaign_id", "ad_id", "form_id")

def stamp():
    return datetime.now(timezone.utc).isoformat()

def text(value):
    return value.strip() if isinstance(value, str) else ""

def time_value(value, label):
    try:
        result = datetime.fromisoformat(text(value).replace("Z", "+00:00"))
        if result.tzinfo is None:
            raise ValueError()
        return result
    except (TypeError, ValueError):
        raise ValueError(label + " requires an ISO timestamp with timezone")

def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))

def init(db):
    # ponytail: local v2 ledger; no migration from the unshipped interrupted prototype.
    db.execute("""CREATE TABLE IF NOT EXISTS lead_review_v2(
      event_key TEXT PRIMARY KEY, payload TEXT NOT NULL, conflicts TEXT NOT NULL,
      packet TEXT NOT NULL, retry_count INTEGER NOT NULL DEFAULT 0)""")
    db.commit()

def snapshot(crm, as_of=None):
    if not isinstance(crm, dict):
        raise ValueError("CRM snapshot must be an object")
    route = crm.get("route")
    if not isinstance(route, dict) or route.get("clientId") != CLIENT or route.get("portalId") != PORTAL or route.get("identity") != "valid":
        raise ValueError("CRM snapshot must identify verified momentum-360 portal 50612503")
    read_at = time_value(crm.get("readAt"), "CRM readAt")
    current = time_value(as_of or stamp(), "as-of")
    age = (current - read_at).total_seconds()
    state = crm.get("state", crm.get("status"))
    if not isinstance(state, str):
        raise ValueError("CRM state must be text")
    reasons = []
    if state in ERROR_STATES:
        reasons.append("crm_" + state)
    elif state != "live-read-only":
        reasons.append("crm_unverified")
    if age < -300:
        reasons.append("crm_future_timestamp")
    if age > 86400:
        reasons.append("crm_stale")
    records = crm.get("records")
    if not isinstance(records, list) or any(not isinstance(r, dict) for r in records):
        raise ValueError("CRM records must be a list of objects")
    ids = [text(r.get("contactId")) for r in records]
    if any(not v for v in ids) or len(set(ids)) != len(ids):
        raise ValueError("CRM contact IDs must be nonempty and unique")
    return records, reasons

def validate(event, allowed_sources, allowed_channels):
    if not isinstance(event, dict):
        raise ValueError("event must be an object")
    if event.get("portal_id") != PORTAL:
        raise ValueError("event portal must be 50612503")
    for name in EVENT_FIELDS:
        if name in event and not isinstance(event[name], str):
            raise ValueError(name + " must be text")
    for name in ("source_system", "event_id", "source_locator"):
        if not text(event.get(name)):
            raise ValueError(name + " is required")
    time_value(event.get("occurred_at"), "occurred_at")
    if not allowed_sources and not allowed_channels:
        raise ValueError("explicit source or channel allowlist required")
    if allowed_sources and event.get("source_id") not in allowed_sources:
        raise ValueError("source_id not allowed")
    if allowed_channels and event.get("channel_id") not in allowed_channels:
        raise ValueError("channel_id not allowed")
    if "status" in event and event["status"] not in ("", "open", "resolved"):
        raise ValueError("status must be open or resolved")
    if "verified_event_link" in event and not isinstance(event["verified_event_link"], dict):
        raise ValueError("verified_event_link must be an object")

def retain(values, incoming, conflicts):
    for name, value in incoming.items():
        value = text(value)
        if not value:
            continue
        old = text(values.get(name))
        if old and old != value:
            conflicts[name] = sorted(set(conflicts.get(name, []) + [old, value]))
        else:
            values[name] = value

def process(event, crm, db, allowed_sources, allowed_channels, stop=False, as_of=None):
    if stop:
        return {"state": "STOPPED", "packets": []}
    validate(event, allowed_sources, allowed_channels)
    records, reasons = snapshot(crm, as_of)
    key = json.dumps([event["source_system"], event["event_id"]], separators=(",", ":"))
    row = db.execute("SELECT payload,conflicts,packet,retry_count FROM lead_review_v2 WHERE event_key=?", (key,)).fetchone()
    retained = json.loads(row[0]) if row else {}
    conflicts = json.loads(row[1]) if row else {}
    old_packet = json.loads(row[2]) if row else {}
    retain(retained, {k: event.get(k) for k in EVENT_FIELDS}, conflicts)
    contact = text(retained.get("contact_id"))
    record = next((r for r in records if r["contactId"] == contact), {})
    source = record.get("source") or {}
    task = record.get("task") or {}
    if not isinstance(source, dict) or not isinstance(task, dict):
        raise ValueError("CRM source and task must be objects")
    observed = {
        "owner_id": text(record.get("ownerId")), "campaign": text(source.get("utmCampaign")),
        "utm_source": text(source.get("utmSource")), "lead_status": text(record.get("leadStatus")),
        "task_id": text(task.get("taskId")), "task_status": text(task.get("status")),
        "task_priority": text(task.get("priority")), "task_timestamp": text(task.get("timestamp"))
    }
    context = dict(old_packet.get("crm_context", {}))
    for name, value in observed.items():
        if value:
            context[name] = value
    retained_context = any(context.get(k) and not v for k, v in observed.items())
    if retained_context:
        reasons.append("crm_context_retained_from_previous_read")
    if not record:
        reasons.append("contact_unmatched" if contact else "contact_missing")
    if not context.get("owner_id"):
        reasons.append("owner_missing")
    if not context.get("campaign"):
        reasons.append("campaign_missing")
    # Contact association is context, never cross-source inquiry deduplication.
    link = event.get("verified_event_link", retained.get("verified_event_link", {}))
    valid_link = (isinstance(link, dict) and link.get("verified") is True and
                  bool(text(link.get("evidence_ref"))) and bool(contact) and
                  link.get("contact_id") == contact and link.get("crm_record_id") == contact and bool(record))
    if valid_link:
        retained["verified_event_link"] = link
    else:
        reasons.append("mapping_required")
    status = text(event.get("status")) or old_packet.get("status", "open")
    evidence = text(event.get("resolved_evidence_ref")) or retained.get("resolved_evidence_ref", "")
    if status == "resolved" and not evidence:
        status = "open"
        reasons.append("resolved_requires_evidence")
    if evidence:
        retained["resolved_evidence_ref"] = evidence
    if conflicts:
        reasons.append("event_conflict")
    reasons = sorted(set(reasons))
    iid = "inq-" + hashlib.sha256(key.encode()).hexdigest()[:20]
    context_provenance = dict(old_packet.get("context_provenance", {}))
    for name, value in observed.items():
        if value:
            context_provenance[name] = crm["readAt"]
    result = {
        "packet_id": "draft-" + iid, "state": "DRAFT", "client": CLIENT,
        "inquiry_id": iid, "event_key": key, "contact_id": contact or "missing",
        "crm_record_id": contact if valid_link else "unverified",
        "owner": context.get("owner_id") or "missing",
        "status": status, "resolved_evidence_ref": evidence,
        "review_state": "held" if reasons else "linked_verified",
        "review_reasons": reasons,
        "fields": {k: retained[k] for k in EVENT_FIELDS if k in retained},
        "crm_context": context, "context_provenance": context_provenance,
        "conflicts": conflicts,
        "provenance": {k: retained[k] for k in ("source_system", "event_id", "occurred_at", "source_locator")},
        "crm_read_at": crm["readAt"], "evaluated_at": as_of or stamp(),
        "allowed_output": "local_draft", "live_actions": "forbidden"
    }
    db.execute("INSERT OR REPLACE INTO lead_review_v2 VALUES(?,?,?,?,?)",
               (key, json.dumps(retained), json.dumps(conflicts), json.dumps(result), row[3] + 1 if row else 0))
    return {"state": "DRAFT", "deduplicated_retry": bool(row), "packets": [result]}

def demo_events(crm):
    return [dict(source_system="synthetic-demo", event_id="demo-" + r["contactId"],
                 occurred_at=crm["readAt"], source_locator="fixture://synthetic-demo/" + r["contactId"],
                 portal_id=PORTAL, source_id="synthetic-demo", channel_id="C05R2B1ULF6",
                 contact_id=r["contactId"]) for r in crm["records"]]

def main(argv=None):
    parser = argparse.ArgumentParser()
    for arg in ("event-json", "crm-json", "as-of"):
        parser.add_argument("--" + arg)
    parser.add_argument("--db", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--allowed-source-id", action="append", default=[])
    parser.add_argument("--allowed-channel-id", action="append", default=[])
    parser.add_argument("--stop", action="store_true")
    parser.add_argument("--demo", action="store_true")
    args = parser.parse_args(argv)
    try:
        out = {"state": "STOPPED" if args.stop else "DRAFT", "offline_only": True, "packets": []}
        if not args.stop:
            if not args.crm_json:
                raise ValueError("--crm-json required unless stopped")
            crm = load(args.crm_json)
            snapshot(crm, args.as_of)
            raw = demo_events(crm) if args.demo else load(args.event_json) if args.event_json else []
            events = raw if isinstance(raw, list) else [raw]
            for event in events:
                validate(event, set(args.allowed_source_id), set(args.allowed_channel_id))
            Path(args.db).parent.mkdir(parents=True, exist_ok=True)
            db = sqlite3.connect(args.db)
            try:
                init(db)
                with db:
                    packets = {}
                    for event in events:
                        packet = process(event, crm, db, set(args.allowed_source_id),
                                         set(args.allowed_channel_id), as_of=args.as_of)["packets"][0]
                        packets[packet["packet_id"]] = packet
                    out["packets"] = list(packets.values())
            finally:
                db.close()
        target = Path(args.output)
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix(target.suffix + ".tmp")
        temporary.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
        temporary.replace(target)
        print(json.dumps({"state": out["state"], "packets": len(out["packets"]), "output": str(target)}))
        return 0
    except (ValueError, OSError, sqlite3.Error) as exc:
        print(json.dumps({"state": "FAILED", "error": str(exc), "offline_only": True}))
        return 2

if __name__ == "__main__":
    sys.exit(main())
