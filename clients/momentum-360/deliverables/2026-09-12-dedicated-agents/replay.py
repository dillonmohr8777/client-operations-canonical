#!/usr/bin/env python3
"""Offline Momentum agent-review replay. No network, no live actions."""

import argparse
import ast
import copy
import json
import os
import re
import sys
import tempfile


BASE = os.path.dirname(os.path.abspath(__file__))
CARD_ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
ISO_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def source_fingerprint(source_refs):
    return "\n".join(sorted(set(source_refs)))


def nonempty_text(value):
    return isinstance(value, str) and bool(value.strip())


def valid_ref(contracts, ref):
    return bool(re.match(contracts["schema"]["source_ref_pattern"], ref or ""))


def refs_valid(contracts, refs):
    return (
        isinstance(refs, list)
        and bool(refs)
        and all(isinstance(x, str) and valid_ref(contracts, x) for x in refs)
    )


def worker_for(contracts, owner, lane):
    for key, worker in contracts["workers"].items():
        if worker["owner"] == owner and lane in worker["lanes"]:
            return key
    return None


def validate(contracts, evidence):
    errors = []
    warnings = []
    if not isinstance(evidence, dict):
        return ["evidence must be an object"], warnings
    cards = evidence.get("cards")

    for field in contracts["schema"]["top_required"]:
        if field not in evidence:
            errors.append(f"missing top field: {field}")
        elif field != "cards" and not nonempty_text(evidence.get(field)):
            errors.append(f"top field must be non-empty text: {field}")
    if evidence.get("state") != "DRAFT":
        errors.append("evidence state must be DRAFT")
    if evidence.get("client") != contracts["client"]:
        errors.append(f"client mismatch: {evidence.get('client')!r}")
    if evidence.get("observed_at") and not ISO_DATE_RE.match(str(evidence["observed_at"])):
        errors.append("observed_at must be ISO date YYYY-MM-DD")
    if not isinstance(cards, list):
        errors.append("cards must be a list")
        return errors, warnings

    ids = {}
    source_seen = {}
    for i, card in enumerate(cards):
        prefix = f"cards[{i}]"
        if not isinstance(card, dict):
            errors.append(f"{prefix} must be an object")
            continue
        for field in contracts["schema"]["card_required"]:
            if field not in card:
                errors.append(f"{prefix} missing field: {field}")
            elif field not in ("source_refs", "depends_on") and not nonempty_text(card.get(field)):
                errors.append(f"{prefix} field must be non-empty text: {field}")
        cid = card.get("id")
        if not isinstance(cid, str) or not CARD_ID_RE.match(cid):
            errors.append(f"{prefix} invalid id: {cid!r}")
            continue
        if cid in ids:
            errors.append(f"duplicate card id: {cid}")
        ids[cid] = card
        if not isinstance(card.get("observed_date"), str) or not ISO_DATE_RE.match(card.get("observed_date", "")):
            errors.append(f"{cid} observed_date must be ISO date YYYY-MM-DD")

        refs = card.get("source_refs")
        if not refs_valid(contracts, refs):
            errors.append(f"{cid} source_refs must be non-empty valid Momentum Slack message URLs")
        else:
            fp = source_fingerprint(refs)
            source_seen.setdefault(fp, []).append(cid)

        owner = card.get("owner")
        lane = card.get("lane")
        if not worker_for(contracts, owner, lane):
            errors.append(f"{cid} unknown owner/lane: {owner!r}/{lane!r}")

        status = card.get("status")
        if status in contracts["schema"]["forbidden_statuses"]:
            errors.append(f"{cid} forbidden live/completion status: {status}")
        elif status not in contracts["schema"]["draft_statuses"] + contracts["schema"]["suppress_statuses"]:
            errors.append(f"{cid} unknown status: {status}")
        if status in contracts["schema"]["suppress_statuses"]:
            resolution_refs = card.get("resolution_source_refs")
            if not refs_valid(contracts, resolution_refs):
                errors.append(f"{cid} resolved_evidenced requires valid resolution_source_refs")

        deps = card.get("depends_on")
        if not isinstance(deps, list) or not all(isinstance(x, str) for x in deps):
            errors.append(f"{cid} depends_on must be a string list")

        if card.get("live_action") or card.get("send_now") or card.get("mutate_now"):
            errors.append(f"{cid} requests live action")

    for fp, card_ids in source_seen.items():
        if len(card_ids) > 1:
            warnings.append(
                "shared source refs kept as distinct card work: " + ", ".join(sorted(card_ids))
            )

    missing = []
    for cid, card in ids.items():
        deps = card.get("depends_on", [])
        if not isinstance(deps, list):
            continue
        for dep in deps:
            if not isinstance(dep, str):
                continue
            if dep not in ids:
                missing.append(f"{cid}->{dep}")
    if missing:
        errors.append("missing dependencies: " + ", ".join(missing))

    cycle = find_cycle(ids)
    if cycle:
        errors.append("dependency cycle: " + " -> ".join(cycle))

    return errors, warnings


def find_cycle(ids):
    visiting = set()
    visited = set()

    def walk(cid, stack):
        if cid in visiting:
            return stack[stack.index(cid):] + [cid]
        if cid in visited:
            return None
        visiting.add(cid)
        stack.append(cid)
        deps = ids[cid].get("depends_on", [])
        if not isinstance(deps, list):
            deps = []
        for dep in deps:
            if dep in ids:
                found = walk(dep, stack)
                if found:
                    return found
        stack.pop()
        visiting.remove(cid)
        visited.add(cid)
        return None

    for cid in ids:
        found = walk(cid, [])
        if found:
            return found
    return None


def ordered_cards(cards):
    by_id = {c["id"]: c for c in cards}
    out = []
    seen = set()

    def add(cid):
        if cid in seen:
            return
        deps = by_id[cid].get("depends_on", [])
        if not isinstance(deps, list):
            deps = []
        for dep in deps:
            add(dep)
        seen.add(cid)
        out.append(by_id[cid])

    for card in cards:
        add(card["id"])
    return out


def build_packets(contracts, evidence):
    cards = {c["id"]: c for c in evidence["cards"]}
    packets = []
    suppressed = []
    for card in ordered_cards(evidence["cards"]):
        if card["status"] in contracts["schema"]["suppress_statuses"]:
            suppressed.append(card["id"])
            continue
        deps = card.get("depends_on", [])
        unresolved = [
            dep for dep in deps
            if cards[dep]["status"] not in contracts["schema"]["suppress_statuses"]
        ]
        worker = worker_for(contracts, card["owner"], card["lane"])
        stage = "blocked_by_prerequisites" if unresolved else "ready_for_review"
        if card["status"] == "identity_pending":
            stage = "identity_pending"
        packets.append({
            "packet_id": "draft-" + card["id"],
            "state": "DRAFT",
            "stage": stage,
            "worker": worker,
            "owner": card["owner"],
            "lane": card["lane"],
            "source_card_id": card["id"],
            "source_refs": sorted(set(card["source_refs"])),
            "source_fingerprint": source_fingerprint(card["source_refs"]),
            "summary": card["summary"],
            "next_action": card["next_action"],
            "acceptance": card["acceptance"],
            "prerequisites": deps,
            "unresolved_prerequisites": unresolved,
            "allowed_output": "draft_packet",
            "live_actions": "forbidden"
        })
    return packets, suppressed


def replay(contracts_path, evidence_path):
    contracts = load_json(contracts_path)
    evidence = load_json(evidence_path)
    errors, warnings = validate(contracts, evidence)
    if errors:
        return {
            "state": "FAILED",
            "offline_only": True,
            "errors": errors,
            "warnings": warnings,
            "packets": []
        }
    packets, suppressed = build_packets(contracts, evidence)
    return {
        "state": "DRAFT",
        "offline_only": True,
        "client": contracts["client"],
        "packet_count": len(packets),
        "suppressed_cards": suppressed,
        "warnings": warnings,
        "notes": [
            "orchestration plumbing only",
            "no model API, network, Slack, CRM, payment, call, email, or publishing side effects",
            contracts["policies"]["lead_entity_dedup"],
            contracts["policies"]["assistant_acceptance"]
        ],
        "packets": packets
    }


def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def expect_fail(contracts, evidence, text):
    with tempfile.TemporaryDirectory() as td:
        cp = os.path.join(td, "contracts.json")
        ep = os.path.join(td, "evidence.json")
        write_json(cp, contracts)
        write_json(ep, evidence)
        result = replay(cp, ep)
    assert result["state"] == "FAILED", text


def self_test():
    contracts = load_json(os.path.join(BASE, "agent-contracts.json"))
    good = {
        "state": "DRAFT",
        "client": "momentum-360",
        "observed_at": "2026-09-12",
        "scope": "self-test",
        "cards": [
            {
                "id": "alpha",
                "owner": "Jason Fallon",
                "lane": "sales",
                "observed_date": "2026-09-12",
                "status": "observed_unresolved",
                "summary": "A source-backed draft item.",
                "source_refs": ["https://momentum3d.slack.com/archives/C012ABCDEF0/p1789058361970009"],
                "next_action": "Draft review packet.",
                "acceptance": "Human review only.",
                "depends_on": []
            },
            {
                "id": "beta",
                "owner": "Melissa Silber",
                "lane": "marketing",
                "observed_date": "2026-09-12",
                "status": "observed_unresolved",
                "summary": "Same source, distinct work item.",
                "source_refs": ["https://momentum3d.slack.com/archives/C012ABCDEF0/p1789058361970009"],
                "next_action": "Draft separate review packet.",
                "acceptance": "Kept separate from alpha.",
                "depends_on": []
            },
            {
                "id": "done-item",
                "owner": "Sean Boyle",
                "lane": "operations",
                "observed_date": "2026-09-12",
                "status": "resolved_evidenced",
                "summary": "Resolved item should not emit a packet.",
                "source_refs": ["https://momentum3d.slack.com/archives/C012ABCDEF0/p1789058361970010"],
                "resolution_source_refs": ["https://momentum3d.slack.com/archives/C012ABCDEF0/p1789058361970011"],
                "next_action": "Suppress.",
                "acceptance": "No stale reminder.",
                "depends_on": []
            },
            {
                "id": "needs-done",
                "owner": "Jason Fallon",
                "lane": "sales",
                "observed_date": "2026-09-12",
                "status": "observed_unresolved",
                "summary": "Dependency on resolved evidence is released.",
                "source_refs": ["https://momentum3d.slack.com/archives/C012ABCDEF0/p1789058361970012"],
                "next_action": "Draft after resolved prerequisite.",
                "acceptance": "Resolved dependency has proof.",
                "depends_on": ["done-item"]
            },
            {
                "id": "identity-card",
                "owner": "Melissa Rigby",
                "lane": "delivery",
                "observed_date": "2026-09-12",
                "status": "identity_pending",
                "summary": "Identity needs confirmation.",
                "source_refs": ["https://momentum3d.slack.com/archives/C012ABCDEF0/p1789058361970013"],
                "next_action": "Confirm identity before routing as ready.",
                "acceptance": "Held until confirmed.",
                "depends_on": []
            }
        ]
    }

    with tempfile.TemporaryDirectory() as td:
        cp = os.path.join(td, "contracts.json")
        ep = os.path.join(td, "evidence.json")
        write_json(cp, contracts)
        write_json(ep, good)
        result = replay(cp, ep)
        again = replay(cp, ep)
    assert result["state"] == "DRAFT"
    assert [p["source_card_id"] for p in result["packets"]] == ["alpha", "beta", "needs-done", "identity-card"]
    assert result["packets"] == again["packets"]
    assert result["suppressed_cards"] == ["done-item"]
    assert result["packets"][2]["stage"] == "ready_for_review"
    assert result["packets"][3]["stage"] == "identity_pending"
    assert any("alpha, beta" in w or "beta, alpha" in w for w in result["warnings"])

    expect_fail(contracts, "not an object", "malformed primitive evidence")

    bad = copy.deepcopy(good)
    bad["cards"] = "not a list"
    expect_fail(contracts, bad, "malformed cards list")

    bad = copy.deepcopy(good)
    bad["cards"][0] = "not an object"
    expect_fail(contracts, bad, "malformed card object")

    bad = copy.deepcopy(good)
    del bad["cards"][0]["source_refs"]
    expect_fail(contracts, bad, "malformed input")

    bad = copy.deepcopy(good)
    bad["cards"][1]["id"] = "alpha"
    expect_fail(contracts, bad, "duplicate IDs")

    bad = copy.deepcopy(good)
    bad["cards"][0]["depends_on"] = ["beta"]
    bad["cards"][1]["depends_on"] = ["alpha"]
    expect_fail(contracts, bad, "dependency cycle")

    bad = copy.deepcopy(good)
    bad["cards"][0]["depends_on"] = ["missing"]
    expect_fail(contracts, bad, "missing dependency")

    bad = copy.deepcopy(good)
    bad["cards"][0]["depends_on"] = "beta"
    expect_fail(contracts, bad, "non-list deps")

    bad = copy.deepcopy(good)
    bad["cards"][0]["depends_on"] = [123]
    expect_fail(contracts, bad, "non-string deps")

    bad = copy.deepcopy(good)
    bad["cards"][0]["source_refs"] = ["https://other.slack.com/archives/C012ABCDEF0/p1789058361970009"]
    expect_fail(contracts, bad, "wrong workspace source")

    bad = copy.deepcopy(good)
    bad["cards"][0]["source_refs"] = ["https://momentum3d.slack.com/archives/not-a-channel/nope"]
    expect_fail(contracts, bad, "malformed source")

    bad = copy.deepcopy(good)
    bad["client"] = "other-client"
    expect_fail(contracts, bad, "client mismatch")

    bad = copy.deepcopy(good)
    del bad["client"]
    expect_fail(contracts, bad, "missing client")

    bad = copy.deepcopy(good)
    bad["cards"][0]["status"] = "sent"
    expect_fail(contracts, bad, "false completion")

    bad = copy.deepcopy(good)
    bad["cards"][0]["summary"] = " "
    expect_fail(contracts, bad, "empty required text")

    bad = copy.deepcopy(good)
    bad["cards"][0]["observed_date"] = "09/12/2026"
    expect_fail(contracts, bad, "bad card date")

    bad = copy.deepcopy(good)
    bad["observed_at"] = "09/12/2026"
    expect_fail(contracts, bad, "bad observed date")

    bad = copy.deepcopy(good)
    del bad["cards"][2]["resolution_source_refs"]
    expect_fail(contracts, bad, "resolved missing proof")

    bad = copy.deepcopy(good)
    bad["cards"][0]["owner"] = "Unknown Owner"
    expect_fail(contracts, bad, "unknown owner")

    bad = copy.deepcopy(good)
    bad["cards"][0]["live_action"] = True
    expect_fail(contracts, bad, "live action requested")

    tree = ast.parse(open(__file__, "r", encoding="utf-8").read())
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.add(node.module)
    for banned in {"urllib", "requests", "socket", "http.client", "subprocess"}:
        assert banned not in imports, "limited static import scan"

    return {"state": "PASS", "checks": 22}


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--contracts", default=os.path.join(BASE, "agent-contracts.json"))
    parser.add_argument("--evidence", default=os.path.join(BASE, "evidence-cards.json"))
    parser.add_argument("--out", default=os.path.join(BASE, "replay-results.json"))
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--no-write", action="store_true")
    args = parser.parse_args(argv)

    if args.self_test:
        result = self_test()
    else:
        result = replay(args.contracts, args.evidence)
        if not args.no_write:
            write_json(args.out, result)
    print(json.dumps(result, indent=2))
    return 0 if result["state"] in ("DRAFT", "PASS") else 1


if __name__ == "__main__":
    raise SystemExit(main())
