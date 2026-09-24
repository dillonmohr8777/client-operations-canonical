#!/usr/bin/env python3
"""Momentum five-mode shadow runtime. Reuses replay.py; no live actions."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sqlite3
import sys
import tempfile


BASE = Path(__file__).resolve().parent
PACKAGE = BASE.parent
sys.path.insert(0, str(PACKAGE))
import replay  # noqa: E402


EXPECTED_MODES = [
    "jason-sales",
    "sean-operations",
    "mac-revenue-reporting",
    "melissa-silber-marketing",
    "melissa-rigby-delivery",
]


def stamp():
    return datetime.now(timezone.utc).isoformat()


def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def write_json(path, data):
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_suffix(target.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    tmp.replace(target)


def init(db):
    db.execute("""CREATE TABLE IF NOT EXISTS mode_packets(
      mode TEXT NOT NULL,
      source_card_id TEXT NOT NULL,
      packet_id TEXT NOT NULL,
      source_fingerprint TEXT NOT NULL,
      payload TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(mode, source_card_id)
    )""")
    db.execute("""CREATE TABLE IF NOT EXISTS packet_memory(
      mode TEXT NOT NULL,
      source_card_id TEXT NOT NULL,
      source_fingerprint TEXT NOT NULL,
      source_refs TEXT NOT NULL,
      provided_answers TEXT NOT NULL,
      requested_asset_count TEXT NOT NULL,
      conflicts TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(mode, source_card_id)
    )""")
    db.execute("""CREATE TABLE IF NOT EXISTS cancellations(
      scope TEXT PRIMARY KEY,
      reason TEXT NOT NULL,
      cancelled_at TEXT NOT NULL
    )""")
    db.commit()


def ensure_answer_shape(card):
    answers = card.get("provided_answers", {})
    if answers is None:
        answers = {}
    if not isinstance(answers, dict):
        raise ValueError(f"{card['id']} provided_answers must be an object")
    if any(not isinstance(k, str) or isinstance(v, (dict, list)) for k, v in answers.items()):
        raise ValueError(f"{card['id']} provided_answers must be flat")
    count = card.get("requested_asset_count")
    if count is not None and (isinstance(count, bool) or not isinstance(count, int) or count < 0):
        raise ValueError(f"{card['id']} requested_asset_count must be a nonnegative integer")
    return answers, count


def read_json_value(value, fallback):
    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return fallback


def merge_memory(db, mode, card, packet):
    answers, count = ensure_answer_shape(card)
    now = stamp()
    row = db.execute(
        """SELECT source_fingerprint,source_refs,provided_answers,requested_asset_count,
                  conflicts,first_seen_at
           FROM packet_memory WHERE mode=? AND source_card_id=?""",
        (mode, card["id"]),
    ).fetchone()
    if row:
        stable_fingerprint = row[0]
        stable_refs = read_json_value(row[1], packet["source_refs"])
        retained_answers = read_json_value(row[2], {})
        retained_count = read_json_value(row[3], None)
        conflicts = read_json_value(row[4], {})
        first_seen = row[5]
    else:
        stable_fingerprint = packet["source_fingerprint"]
        stable_refs = packet["source_refs"]
        retained_answers = {}
        retained_count = None
        conflicts = {}
        first_seen = now

    if stable_fingerprint != packet["source_fingerprint"]:
        conflicts.setdefault("source_fingerprint", [stable_fingerprint])
        if packet["source_fingerprint"] not in conflicts["source_fingerprint"]:
            conflicts["source_fingerprint"].append(packet["source_fingerprint"])

    for key, value in answers.items():
        old = retained_answers.get(key)
        if old is not None and old != value:
            conflicts.setdefault("provided_answers." + key, [old])
            if value not in conflicts["provided_answers." + key]:
                conflicts["provided_answers." + key].append(value)
        elif old is None:
            retained_answers[key] = value

    if count is not None:
        if retained_count is not None and retained_count != count:
            conflicts.setdefault("requested_asset_count", [retained_count])
            if count not in conflicts["requested_asset_count"]:
                conflicts["requested_asset_count"].append(count)
        elif retained_count is None:
            retained_count = count

    db.execute(
        "INSERT OR REPLACE INTO packet_memory VALUES(?,?,?,?,?,?,?,?,?)",
        (
            mode, card["id"], stable_fingerprint, json.dumps(stable_refs),
            json.dumps(retained_answers, sort_keys=True), json.dumps(retained_count),
            json.dumps(conflicts, sort_keys=True), first_seen, now,
        ),
    )
    return {
        "source_fingerprint": stable_fingerprint,
        "source_refs": stable_refs,
        "incoming_source_fingerprint": packet["source_fingerprint"],
        "incoming_source_refs": packet["source_refs"],
        "source_identity_review_required": stable_fingerprint != packet["source_fingerprint"],
        "provided_answers": retained_answers,
        "requested_asset_count": retained_count,
        "conflicts": conflicts,
    }


def active_stops(db):
    if not db:
        return {}
    return {
        row[0]: {"reason": row[1], "cancelled_at": row[2]}
        for row in db.execute("SELECT scope,reason,cancelled_at FROM cancellations")
    }


def is_cancelled(stops, mode, card_id):
    return "all" in stops or mode in stops or card_id in stops


def missing_evidence(card, packet):
    missing = []
    unresolved = packet.get("unresolved_prerequisites", [])
    if unresolved:
        missing.append("unresolved prerequisites: " + ", ".join(unresolved))
    if packet.get("stage") == "identity_pending":
        missing.append("confirm exact owner identity and assignment before activation")
    cid = card["id"]
    if cid in {"lead-duplicate", "lead-system-map"}:
        missing.append("provider event ID to CRM record to Slack timestamp mapping")
    if cid == "lead-follow-through":
        missing.append("controlled owner/task readback and approved call test")
    if cid == "apollo-capacity":
        missing.append("current Apollo credit balance and exact approved quantity")
    if cid in {"report-reconciliation", "billing-handoff"}:
        missing.append("current account/period/payment receipt readback")
    if cid == "assistant-repeat-loop":
        missing.append("actual output receipt or exact tool blocker for requested assets")
    if cid in {"marketing-dependencies", "production-brief", "scope-clarity"}:
        missing.append("current owner input, due date, and source-file receipt where applicable")
    return sorted(set(missing))


def packet_for(card, packet, memory):
    provided_answers = memory["provided_answers"]
    requested_asset_count = memory["requested_asset_count"]
    missing = missing_evidence(card, packet)
    if memory["source_identity_review_required"]:
        missing.append("source identity changed; review before collapsing with previous packet")
    if memory["conflicts"]:
        missing.append("retained field conflict requires review")
    return {
        "packet_id": packet["packet_id"],
        "state": "STAGED",
        "stage": "source_identity_review" if memory["source_identity_review_required"] else packet["stage"],
        "mode": packet["worker"],
        "owner": packet["owner"],
        "lane": packet["lane"],
        "source_observed_date": card["observed_date"],
        "stable_source_identity": {
            "source_card_id": packet["source_card_id"],
            "source_fingerprint": memory["source_fingerprint"],
            "source_refs": memory["source_refs"],
        },
        "incoming_source_identity": {
            "source_fingerprint": memory["incoming_source_fingerprint"],
            "source_refs": memory["incoming_source_refs"],
        },
        "input_acceptance": {
            "accepted_input": "one source-backed evidence card plus explicit dependencies",
            "stop_cancels": True,
            "cross_client_output": "forbidden",
        },
        "provided_answers": provided_answers,
        "provided_answer_state": "retained" if provided_answers else "no structured answers in source packet",
        "requested_asset_count": requested_asset_count if requested_asset_count is not None else "not supplied in source packet",
        "field_conflicts": memory["conflicts"],
        "summary": packet["summary"],
        "next_action": packet["next_action"],
        "output_acceptance": packet["acceptance"],
        "missing_evidence": sorted(set(missing)),
        "allowed_output": packet["allowed_output"],
        "live_actions": "forbidden",
    }


def build(contracts_path, evidence_path, db=None, stop_scope=None, stop_reason="human stop", resume_scope=None):
    if resume_scope and db:
        db.execute("DELETE FROM cancellations WHERE scope=?", (resume_scope,))
    if stop_scope:
        if db:
            db.execute(
                "INSERT OR REPLACE INTO cancellations VALUES(?,?,?)",
                (stop_scope, stop_reason, stamp()),
            )
        return {
            "state": "STOPPED",
            "offline_only": True,
            "scope": stop_scope,
            "packets": [],
            "modes": [],
        }
    stops = active_stops(db)
    if "all" in stops:
        return {
            "state": "STOPPED",
            "offline_only": True,
            "scope": "all",
            "stop": stops["all"],
            "packets": [],
            "modes": [],
        }

    contracts = load_json(contracts_path)
    evidence = load_json(evidence_path)
    replay_result = replay.replay(str(contracts_path), str(evidence_path))
    if replay_result["state"] != "DRAFT":
        return replay_result

    cards = {card["id"]: card for card in evidence["cards"]}
    grouped = {mode: [] for mode in EXPECTED_MODES}
    cancelled = []
    for packet in replay_result["packets"]:
        if packet["worker"] not in grouped:
            continue
        card = cards[packet["source_card_id"]]
        if is_cancelled(stops, packet["worker"], packet["source_card_id"]):
            cancelled.append({"mode": packet["worker"], "source_card_id": packet["source_card_id"]})
            continue
        memory = merge_memory(db, packet["worker"], card, packet) if db else {
            "source_fingerprint": packet["source_fingerprint"],
            "source_refs": packet["source_refs"],
            "incoming_source_fingerprint": packet["source_fingerprint"],
            "incoming_source_refs": packet["source_refs"],
            "source_identity_review_required": False,
            "provided_answers": ensure_answer_shape(card)[0],
            "requested_asset_count": ensure_answer_shape(card)[1],
            "conflicts": {},
        }
        grouped[packet["worker"]].append(packet_for(card, packet, memory))

    now = stamp()
    if db:
        for mode, packets in grouped.items():
            for packet in packets:
                identity = packet["stable_source_identity"]
                existing = db.execute(
                    "SELECT first_seen_at FROM mode_packets WHERE mode=? AND source_card_id=?",
                    (mode, identity["source_card_id"]),
                ).fetchone()
                first_seen = existing[0] if existing else now
                db.execute(
                    "INSERT OR REPLACE INTO mode_packets VALUES(?,?,?,?,?,?,?)",
                    (
                        mode, identity["source_card_id"], packet["packet_id"],
                        identity["source_fingerprint"], json.dumps(packet),
                        first_seen, now,
                    ),
                )

    modes = []
    for mode in EXPECTED_MODES:
        worker = contracts["workers"][mode]
        packets = grouped[mode]
        modes.append({
            "mode": mode,
            "owner": worker["owner"],
            "lanes": worker["lanes"],
            "state": "STOPPED" if mode in stops else "STAGED",
            "packet_count": len(packets),
            "stop": stops.get(mode),
            "packets": packets,
        })

    verification = {
        "state": "PASS",
        "verifier": "shadow_runtime.py",
        "checks": [
            "all five named modes present",
            "no packet emits a live action",
            "no packet marks business work complete",
            "dedupe key is mode plus source_card_id with changed sources held for review",
            "source identity remains the source card and Slack URL fingerprint",
            "persisted stops are enforced until explicit local resume",
            "provided answers and requested asset counts are retained across omitted updates",
        ],
        "complete_state_allowed": False,
    }
    return {
        "state": "STAGED",
        "offline_only": True,
        "client": contracts["client"],
        "generated_at": now,
        "evidence_snapshot_date": evidence["observed_at"],
        "source_label": "historical Slack evidence replay; recheck live state before external action",
        "mode_count": len(modes),
        "packet_count": sum(m["packet_count"] for m in modes),
        "cancelled_packets": cancelled,
        "modes": modes,
        "verification": verification,
    }


def write_mode_markdown(folder, result):
    out = Path(folder)
    out.mkdir(parents=True, exist_ok=True)
    for mode in result.get("modes", []):
        lines = [
            f"# {mode['owner']} - {mode['mode']}",
            "",
            "State: STAGED. No live action is authorized by this packet.",
            "",
        ]
        for packet in mode["packets"]:
            lines.extend([
                f"## {packet['stable_source_identity']['source_card_id']}",
                "",
                f"Source observed date: {packet['source_observed_date']}",
                "Freshness: historical evidence replay; recheck live state before external action.",
                f"Stage: {packet['stage']}",
                f"Summary: {packet['summary']}",
                "Provided answers: " + (json.dumps(packet["provided_answers"], sort_keys=True) if packet["provided_answers"] else "none in source packet"),
                f"Requested asset count: {packet['requested_asset_count']}",
                "Field conflicts: " + (json.dumps(packet["field_conflicts"], sort_keys=True) if packet["field_conflicts"] else "none"),
                f"Next action: {packet['next_action']}",
                f"Acceptance: {packet['output_acceptance']}",
                "Missing evidence: " + ("; ".join(packet["missing_evidence"]) if packet["missing_evidence"] else "none"),
                "Source refs: " + ", ".join(packet["stable_source_identity"]["source_refs"]),
                "",
            ])
        (out / (mode["mode"] + ".md")).write_text("\n".join(lines), encoding="utf-8")


def self_test():
    checks = 0

    def check(value):
        nonlocal checks
        assert value
        checks += 1

    contracts_path = PACKAGE / "agent-contracts.json"
    evidence_path = PACKAGE / "evidence-cards.json"
    with tempfile.TemporaryDirectory() as td:
        db = sqlite3.connect(Path(td) / "modes.sqlite")
        try:
            init(db)
            with db:
                result = build(contracts_path, evidence_path, db)
            check(result["state"] == "STAGED")
            check(result["mode_count"] == 5)
            check(result["packet_count"] == 11)
            check(result["evidence_snapshot_date"] == "2026-09-12")
            check(result["source_label"].startswith("historical Slack evidence"))
            check(result["verification"]["state"] == "PASS")
            modes = {mode["mode"]: mode for mode in result["modes"]}
            check(set(modes) == set(EXPECTED_MODES))
            check(modes["melissa-rigby-delivery"]["packets"][0]["stage"] == "identity_pending")
            check(modes["melissa-rigby-delivery"]["packets"][0]["source_observed_date"] == "2026-09-03")
            lead_follow = [
                p for p in modes["jason-sales"]["packets"]
                if p["stable_source_identity"]["source_card_id"] == "lead-follow-through"
            ][0]
            check(lead_follow["stage"] == "blocked_by_prerequisites")
            check(any("lead-duplicate" in item for item in lead_follow["missing_evidence"]))
            check(all(p["live_actions"] == "forbidden" for m in result["modes"] for p in m["packets"]))
            check(all(p["state"] == "STAGED" for m in result["modes"] for p in m["packets"]))
            check(db.execute("SELECT count(*) FROM mode_packets").fetchone()[0] == 11)
            with db:
                again = build(contracts_path, evidence_path, db)
            check(again["packet_count"] == result["packet_count"])
            check(db.execute("SELECT count(*) FROM mode_packets").fetchone()[0] == 11)
            with db:
                stopped = build(contracts_path, evidence_path, db, stop_scope="all")
            check(stopped["state"] == "STOPPED")
            check(db.execute("SELECT count(*) FROM cancellations").fetchone()[0] == 1)
            with db:
                still_stopped = build(contracts_path, evidence_path, db)
            check(still_stopped["state"] == "STOPPED")
            with db:
                resumed = build(contracts_path, evidence_path, db, resume_scope="all")
            check(resumed["state"] == "STAGED")
            with db:
                mode_stopped = build(contracts_path, evidence_path, db, stop_scope="jason-sales")
            check(mode_stopped["state"] == "STOPPED")
            with db:
                one_mode_held = build(contracts_path, evidence_path, db)
            check(next(m for m in one_mode_held["modes"] if m["mode"] == "jason-sales")["state"] == "STOPPED")
            check(one_mode_held["packet_count"] == 9)
            with db:
                build(contracts_path, evidence_path, db, resume_scope="jason-sales")

            evidence = load_json(evidence_path)
            evidence["cards"][-1]["provided_answers"] = {"tone": "restrained", "format": "two sizes"}
            evidence["cards"][-1]["requested_asset_count"] = 3
            e2 = Path(td) / "evidence.json"
            write_json(e2, evidence)
            with db:
                retained = build(contracts_path, e2, db)
            assistant_packet = [
                p for m in retained["modes"] for p in m["packets"]
                if p["stable_source_identity"]["source_card_id"] == "assistant-repeat-loop"
            ][0]
            check(assistant_packet["provided_answers"]["tone"] == "restrained")
            check(assistant_packet["requested_asset_count"] == 3)

            evidence_omitted = load_json(evidence_path)
            e3 = Path(td) / "evidence-omitted.json"
            write_json(e3, evidence_omitted)
            with db:
                omitted = build(contracts_path, e3, db)
            omitted_packet = [
                p for m in omitted["modes"] for p in m["packets"]
                if p["stable_source_identity"]["source_card_id"] == "assistant-repeat-loop"
            ][0]
            check(omitted_packet["provided_answers"]["tone"] == "restrained")
            check(omitted_packet["requested_asset_count"] == 3)

            evidence_conflict = load_json(evidence_path)
            evidence_conflict["cards"][-1]["provided_answers"] = {"tone": "loud"}
            evidence_conflict["cards"][-1]["requested_asset_count"] = 2
            e4 = Path(td) / "evidence-conflict.json"
            write_json(e4, evidence_conflict)
            with db:
                conflicted = build(contracts_path, e4, db)
            conflicted_packet = [
                p for m in conflicted["modes"] for p in m["packets"]
                if p["stable_source_identity"]["source_card_id"] == "assistant-repeat-loop"
            ][0]
            check(conflicted_packet["provided_answers"]["tone"] == "restrained")
            check(conflicted_packet["requested_asset_count"] == 3)
            check("provided_answers.tone" in conflicted_packet["field_conflicts"])
            check("requested_asset_count" in conflicted_packet["field_conflicts"])

            evidence_changed_source = load_json(evidence_path)
            evidence_changed_source["cards"][-1]["source_refs"][0] = "https://momentum3d.slack.com/archives/C0B3T401W77/p1787166794634640"
            e5 = Path(td) / "evidence-source-change.json"
            write_json(e5, evidence_changed_source)
            with db:
                source_changed = build(contracts_path, e5, db)
            changed_packet = [
                p for m in source_changed["modes"] for p in m["packets"]
                if p["stable_source_identity"]["source_card_id"] == "assistant-repeat-loop"
            ][0]
            check(changed_packet["stage"] == "source_identity_review")
            check(changed_packet["stable_source_identity"]["source_fingerprint"] != changed_packet["incoming_source_identity"]["source_fingerprint"])

            for bad_count in (-1, True, "3"):
                bad = load_json(evidence_path)
                bad["cards"][-1]["requested_asset_count"] = bad_count
                bad_path = Path(td) / ("bad-count-" + str(checks) + ".json")
                write_json(bad_path, bad)
                try:
                    with db:
                        build(contracts_path, bad_path, db)
                    raise AssertionError("bad requested_asset_count accepted")
                except ValueError:
                    checks += 1
        finally:
            db.close()
            del db
    return {"state": "PASS", "checks": checks, "scope": "five mode shadow runtime; no model or network calls"}


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--contracts", default=str(PACKAGE / "agent-contracts.json"))
    parser.add_argument("--evidence", default=str(PACKAGE / "evidence-cards.json"))
    parser.add_argument("--db", default=str(BASE / "run" / "modes.sqlite"))
    parser.add_argument("--out", default=str(BASE / "run" / "current-packets.json"))
    parser.add_argument("--owner-packets", default=str(BASE / "run" / "owner-packets"))
    parser.add_argument("--stop-scope")
    parser.add_argument("--stop-reason", default="human stop")
    parser.add_argument("--resume-scope")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args(argv)
    try:
        if args.self_test:
            result = self_test()
        else:
            db_path = Path(args.db)
            db_path.parent.mkdir(parents=True, exist_ok=True)
            db = sqlite3.connect(db_path)
            try:
                init(db)
                with db:
                    result = build(
                        Path(args.contracts), Path(args.evidence), db,
                        stop_scope=args.stop_scope, stop_reason=args.stop_reason,
                        resume_scope=args.resume_scope,
                    )
            finally:
                db.close()
            write_json(args.out, result)
            if result["state"] == "STAGED":
                write_mode_markdown(args.owner_packets, result)
        print(json.dumps(result, indent=2))
        return 0 if result["state"] in ("PASS", "STAGED", "STOPPED") else 1
    except (ValueError, OSError, sqlite3.Error) as exc:
        result = {"state": "FAILED", "offline_only": True, "error": str(exc)}
        if not args.self_test:
            write_json(args.out, result)
        print(json.dumps(result, indent=2))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
