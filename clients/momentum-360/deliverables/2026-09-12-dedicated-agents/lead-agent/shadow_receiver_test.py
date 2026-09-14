"""Shadow receiver tests: signed Slack envelope, no network, staged delivery only."""
import copy
import hashlib
import hmac
import json
import os
from pathlib import Path
import sqlite3
import sys
import tempfile
import types

import lead_agent
import slack_shadow_receiver as r

root = Path(__file__).resolve().parent
crm = lead_agent.load(root.parent / "live-crm-snapshot.json")
secret = "test-signing-secret-not-real"
now = 1800000000
checks = 0


def check(value):
    global checks
    assert value
    checks += 1


config = r.Config(
    signing_secret=secret,
    team_id="T066HGS7N",
    channel_id="C05R2B1ULF6",
    app_id="A123MOMENTUM",
    bot_user_id="UWORKMATE",
    allowed_human_user_ids=frozenset({"U05MUGHN031"}),
    allowed_source_ids=frozenset({"synthetic-demo", "slack_review_request"}),
).checked()
small_config = r.Config(
    signing_secret=secret,
    team_id="T066HGS7N",
    channel_id="C05R2B1ULF6",
    app_id="A123MOMENTUM",
    bot_user_id="UWORKMATE",
    allowed_human_user_ids=frozenset({"U05MUGHN031"}),
    allowed_source_ids=frozenset({"synthetic-demo"}),
    max_body_bytes=1024,
).checked()


def body(event_id, provider_event_id, contact_id="247699043386", **event_overrides):
    link = {
        "verified": True,
        "contact_id": contact_id,
        "crm_record_id": contact_id,
        "evidence_ref": "fixture://provider-crm-map/" + provider_event_id,
    }
    envelope = {
        "team_id": "T066HGS7N",
        "api_app_id": "A123MOMENTUM",
        "event_id": event_id,
        "event_time": now,
        "event": {
            "type": "app_mention",
            "user": "U05MUGHN031",
            "channel": "C05R2B1ULF6",
            "ts": "1789315200.000000",
            "text": "<@UWORKMATE> review lead " + provider_event_id,
            "metadata": {
                "event_type": "lead_review_v2",
                "event_payload": {
                    "lead_event": {
                        "source_system": "synthetic-demo",
                        "event_id": provider_event_id,
                        "occurred_at": crm["readAt"],
                        "source_locator": "fixture://synthetic-provider/" + provider_event_id,
                        "portal_id": "50612503",
                        "source_id": "synthetic-demo",
                        "channel_id": "C05R2B1ULF6",
                        "contact_id": contact_id,
                        "crm_record_id": contact_id,
                        "verified_event_link": link,
                    }
                },
            },
        },
    }
    envelope["event"].update(event_overrides)
    return envelope


def sign(raw, ts=now, key=secret):
    base = b"v0:" + str(ts).encode("utf-8") + b":" + raw
    return {
        "x-slack-request-timestamp": str(ts),
        "x-slack-signature": "v0=" + hmac.new(key.encode("utf-8"), base, hashlib.sha256).hexdigest(),
    }


def call(db, envelope, ts=now, key=secret):
    raw = json.dumps(envelope, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return r.handle_request(raw, sign(raw, ts=ts, key=key), config, crm, db, now=now, as_of=crm["readAt"])


with tempfile.TemporaryDirectory() as folder:
    db = sqlite3.connect(Path(folder) / "shadow.sqlite")
    first_body = body("EvFIRST", "provider-first")
    first = call(db, first_body)
    first_inquiry = first["inquiry_id"]
    check(first["state"] == "HELD_REVIEW")
    check(first["delivery"]["delivery_created"] is True)
    check(first["lead_review"]["review_state"] == "held")
    check("mapping_required" in first["lead_review"]["review_reasons"])
    check("Approval required" in first["delivery"]["message"])
    check(db.execute("SELECT count(*) FROM delivery_ledger").fetchone()[0] == 1)
    check(db.execute("SELECT count(*) FROM slack_shadow_events").fetchone()[0] == 1)

    duplicate_slack = call(db, first_body)
    check(duplicate_slack["deduplicated_slack_event"] is True)
    check(db.execute("SELECT count(*) FROM delivery_ledger").fetchone()[0] == 1)

    retry = call(db, body("EvRETRY", "provider-first"))
    check(retry["state"] == "DUPLICATE_INQUIRY")
    check(retry["inquiry_id"] == first_inquiry)
    check(db.execute("SELECT count(*) FROM delivery_ledger").fetchone()[0] == 1)

    r.mark_delivery_uncertain(db, first_inquiry, "simulated transport timeout")
    uncertain = call(db, body("EvUNCERTAIN", "provider-first"))
    check(uncertain["state"] == "RECONCILE_REQUIRED")
    check(uncertain["delivery"]["delivery_created"] is False)
    check(db.execute("SELECT count(*) FROM delivery_ledger WHERE inquiry_id=?", (first_inquiry,)).fetchone()[0] == 1)

    second_same_contact = call(db, body("EvSECOND", "provider-second"))
    check(second_same_contact["state"] == "HELD_REVIEW")
    check(second_same_contact["inquiry_id"] != first_inquiry)
    check(db.execute("SELECT count(*) FROM delivery_ledger").fetchone()[0] == 2)

    not_stop = body("EvNOTSTOP", "provider-not-stop", text="<@UWORKMATE> do not stop this")
    check(call(db, not_stop)["state"] == "HELD_REVIEW")

    wrong_team = copy.deepcopy(first_body)
    wrong_team["event_id"] = "EvWRONGTEAM"
    wrong_team["team_id"] = "TWRONG"
    check(call(db, wrong_team)["reason"] == "wrong_workspace")

    wrong_channel = body("EvWRONGCHANNEL", "provider-wrong-channel", channel="C999")
    check(call(db, wrong_channel)["reason"] == "wrong_channel")

    bot_event = body("EvBOT", "provider-bot", bot_id="B123")
    check(call(db, bot_event)["reason"] == "bot_event")

    unapproved = body("EvUNAPPROVED", "provider-unapproved", user="UOTHER")
    check(call(db, unapproved)["reason"] == "unapproved_human")

    missing_mention = body("EvNOMENTION", "provider-no-mention", text="review lead")
    check(call(db, missing_mention)["reason"] == "missing_bot_mention")

    unsigned_raw = json.dumps(body("EvSIG", "provider-sig")).encode("utf-8")
    check(r.handle_request(unsigned_raw, {}, config, crm, db, now=now)["status_code"] == 401)
    check(r.handle_request(unsigned_raw, sign(unsigned_raw, key="wrong"), config, crm, db, now=now)["status_code"] == 401)
    check(r.handle_request(unsigned_raw, sign(unsigned_raw, ts=now - 1000), config, crm, db, now=now)["status_code"] == 401)
    check(r.handle_request(b"[]", sign(b"[]"), config, crm, db, now=now)["status_code"] == 400)
    big = b'{"x":"' + (b"x" * 2048) + b'"}'
    check(r.handle_request(big, sign(big), small_config, crm, db, now=now)["status_code"] == 413)

    conflict = copy.deepcopy(first_body)
    conflict["team_id"] = "TWRONG"
    conflict_raw = json.dumps(conflict, sort_keys=True, separators=(",", ":")).encode("utf-8")
    check(r.handle_request(conflict_raw, sign(conflict_raw), config, crm, db, now=now)["reason"] == "wrong_workspace")
    conflict["team_id"] = config.team_id
    conflict["event"]["text"] += " changed"
    check(call(db, conflict)["reason"] == "event_id_conflict")

    human = body("EvHUMAN", "unused", text="<@UWORKMATE> review contact 247699043386")
    del human["event"]["metadata"]
    human_result = call(db, human)
    check(human_result["state"] == "HELD_REVIEW")
    check(human_result["lead_review"]["fields"]["source_system"] == "slack_review_request")
    check("mapping_required" in human_result["lead_review"]["review_reasons"])
    check(call(db, human)["deduplicated_slack_event"] is True)
    check(not r.is_stop({"text": "<@UWORKMATE> stop this from duplicating"}))
    challenge = json.dumps({"type": "url_verification", "challenge": "test-challenge"}).encode()
    challenge_result = r.handle_request(challenge, sign(challenge), config, crm, db, now=now)
    check(r.ack_payload(challenge_result) == {"challenge": "test-challenge"})
    check("lead_review" not in r.ack_payload(first))

    stop = body("EvSTOP", "provider-stop", text="<@UWORKMATE> stop")
    stopped = call(db, stop)
    check(stopped["state"] == "STOPPED")
    check(stopped["cancelled_intents"] == 3)
    check(db.execute("SELECT count(*) FROM delivery_ledger WHERE state='CANCELLED'").fetchone()[0] == 3)

    fresh = call(db, body("EvFRESH", "provider-fresh"))
    check(fresh["state"] == "STOPPED")
    check(fresh["delivery"]["delivery_created"] is False)

    unverified = body("EvUNVERIFIED", "provider-unverified")
    del unverified["event"]["metadata"]["event_payload"]["lead_event"]["verified_event_link"]
    held = call(db, unverified)
    check(held["state"] == "STOPPED")

    try:
        r.serve_loopback("0.0.0.0:8787", config, crm, Path(folder) / "never.sqlite")
        raise AssertionError("non-loopback bind accepted")
    except ValueError:
        checks += 1

    try:
        r.socket_tokens({})
        raise AssertionError("missing socket tokens accepted")
    except ValueError:
        checks += 1

    class FakeApp:
        last = None

        def __init__(self, token, process_before_response):
            self.token = token
            self.process_before_response = process_before_response
            self.handlers = {}
            self.client = types.SimpleNamespace(auth_test=lambda: {"team_id": config.team_id, "user_id": config.bot_user_id})
            FakeApp.last = self

        def event(self, name):
            def decorate(func):
                self.handlers[name] = func
                return func
            return decorate

    prior_module = sys.modules.get("slack_bolt")
    fake_module = types.ModuleType("slack_bolt")
    fake_module.App = FakeApp
    old_env = {k: os.environ.get(k) for k in ("MOMENTUM_SLACK_BOT_TOKEN", "MOMENTUM_SLACK_APP_TOKEN")}
    try:
        sys.modules["slack_bolt"] = fake_module
        os.environ["MOMENTUM_SLACK_BOT_TOKEN"] = "xoxb-test-token"
        os.environ["MOMENTUM_SLACK_APP_TOKEN"] = "xapp-test-token"
        socket_db = Path(folder) / "socket.sqlite"
        app = r.build_socket_app(config, crm, socket_db, as_of=crm["readAt"])
        acked = []
        socket_body = body("EvSOCKET", "provider-socket")
        socket_result = app.handlers["app_mention"](
            event=socket_body["event"],
            body={k: socket_body[k] for k in ("team_id", "api_app_id", "event_id", "event_time")},
            ack=lambda: acked.append(True),
            logger=None,
        )
        check(acked == [True])
        check(app.process_before_response is False)
        check(socket_result["state"] == "HELD_REVIEW")
        socket_conn = sqlite3.connect(socket_db)
        try:
            check(socket_conn.execute("SELECT count(*) FROM delivery_ledger").fetchone()[0] == 1)
        finally:
            socket_conn.close()
    finally:
        if prior_module is None:
            sys.modules.pop("slack_bolt", None)
        else:
            sys.modules["slack_bolt"] = prior_module
        for key, value in old_env.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value

    try:
        r.Config.from_env({})
        raise AssertionError("empty env config accepted")
    except ValueError:
        checks += 1

    db.close()

print(json.dumps({"state": "PASS", "checks": checks, "scope": "local shadow receiver; no outbound effects"}))
