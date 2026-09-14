#!/usr/bin/env python3
"""Local Momentum Workmate receiver. Stages only; never posts to Slack."""

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import hmac
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
import tempfile
import time
import types


BASE = Path(__file__).resolve().parent
PACKAGE = BASE.parent
LEAD_AGENT = PACKAGE / "lead-agent"
sys.path.insert(0, str(LEAD_AGENT))
import lead_agent  # noqa: E402


TEAM_ID = "T066HGS7N"
CHANNEL_ID = "C05R2B1ULF6"
PORTAL_ID = "50612503"
SLACK_REVIEW_SOURCE_ID = "slack-review-request"
DEMO_APP_ID = "A123MOMENTUM"
DEMO_BOT_USER_ID = "UWORKMATE"
DEMO_HUMAN_ID = "U05MUGHN031"
STOP_WORDS = {"stop", "cancel", "halt"}


def stamp():
    return datetime.now(timezone.utc).isoformat()


def text(value):
    return value.strip() if isinstance(value, str) else ""


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def write_json(path, data):
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_suffix(target.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    tmp.replace(target)


def compact_json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def split_csv(value):
    return frozenset(part.strip() for part in text(value).split(",") if part.strip())


@dataclass(frozen=True)
class Config:
    signing_secret: str
    team_id: str
    channel_id: str
    app_id: str
    bot_user_id: str
    allowed_human_user_ids: frozenset
    allowed_source_ids: frozenset
    signature_tolerance_seconds: int = 300
    max_body_bytes: int = 262144

    @classmethod
    def demo(cls):
        return cls(
            signing_secret="test-signing-secret-not-real",
            team_id=TEAM_ID,
            channel_id=CHANNEL_ID,
            app_id=DEMO_APP_ID,
            bot_user_id=DEMO_BOT_USER_ID,
            allowed_human_user_ids=frozenset({DEMO_HUMAN_ID}),
            allowed_source_ids=frozenset({"synthetic-demo", SLACK_REVIEW_SOURCE_ID}),
        ).checked()

    @classmethod
    def from_env(cls, env=os.environ):
        values = {
            "signing_secret": text(env.get("MOMENTUM_SLACK_SIGNING_SECRET")),
            "team_id": text(env.get("MOMENTUM_SLACK_TEAM_ID")),
            "channel_id": text(env.get("MOMENTUM_SLACK_CHANNEL_ID")),
            "app_id": text(env.get("MOMENTUM_SLACK_APP_ID")),
            "bot_user_id": text(env.get("MOMENTUM_SLACK_BOT_USER_ID")),
        }
        humans = split_csv(env.get("MOMENTUM_ALLOWED_HUMAN_USER_IDS"))
        sources = split_csv(env.get("MOMENTUM_ALLOWED_SOURCE_IDS"))
        missing = [name for name, value in values.items() if not value]
        if not humans:
            missing.append("allowed_human_user_ids")
        if not sources:
            missing.append("allowed_source_ids")
        if missing:
            raise ValueError("missing external receiver config: " + ", ".join(sorted(missing)))
        return cls(
            **values,
            allowed_human_user_ids=humans,
            allowed_source_ids=sources,
        ).checked()

    def checked(self):
        if self.team_id != TEAM_ID:
            raise ValueError("team_id must match Momentum workspace T066HGS7N")
        if self.channel_id != CHANNEL_ID:
            raise ValueError("channel_id must match #360leads C05R2B1ULF6")
        if not self.app_id or not self.bot_user_id:
            raise ValueError("approved Slack app id and bot user id are required")
        if not self.signing_secret:
            raise ValueError("Slack signing secret must come from the external secret store")
        if not self.allowed_human_user_ids:
            raise ValueError("at least one approved human Slack user id is required")
        if not self.allowed_source_ids:
            raise ValueError("at least one approved source id is required")
        if self.max_body_bytes < 1024:
            raise ValueError("max_body_bytes must be at least 1024")
        return self


def init(db):
    lead_agent.init(db)
    db.execute("""CREATE TABLE IF NOT EXISTS slack_events(
      event_id TEXT PRIMARY KEY,
      body_sha256 TEXT NOT NULL,
      state TEXT NOT NULL,
      payload TEXT NOT NULL,
      result TEXT NOT NULL,
      created_at TEXT NOT NULL
    )""")
    ensure_column(db, "slack_events", "body_sha256", "TEXT NOT NULL DEFAULT ''")
    db.execute("""CREATE TABLE IF NOT EXISTS delivery_intents(
      intent_id TEXT PRIMARY KEY,
      delivery_key TEXT UNIQUE NOT NULL,
      event_id TEXT NOT NULL,
      inquiry_id TEXT NOT NULL,
      packet_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      state TEXT NOT NULL,
      message TEXT NOT NULL,
      packet TEXT NOT NULL,
      reason TEXT NOT NULL,
      slack_ts TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )""")
    ensure_column(db, "delivery_intents", "reason", "TEXT NOT NULL DEFAULT ''")
    ensure_column(db, "delivery_intents", "slack_ts", "TEXT NOT NULL DEFAULT ''")
    ensure_column(db, "delivery_intents", "updated_at", "TEXT NOT NULL DEFAULT ''")
    db.execute("""CREATE TABLE IF NOT EXISTS delivery_receipts(
      intent_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      message_ts TEXT NOT NULL,
      readback_ref TEXT NOT NULL,
      verified INTEGER NOT NULL,
      recorded_at TEXT NOT NULL
    )""")
    db.execute("""CREATE TABLE IF NOT EXISTS receiver_state(
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )""")


def ensure_column(db, table, column, definition):
    columns = {row[1] for row in db.execute("PRAGMA table_info(" + table + ")")}
    if column not in columns:
        db.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition)


def response(status_code, state, reason="", **extra):
    data = {"status_code": status_code, "state": state, "offline_only": True, "live_actions": "forbidden"}
    if reason:
        data["reason"] = reason
    data.update(extra)
    return data


def verify_signature(raw_body, headers, config, now=None):
    values = {str(k).lower(): v for k, v in dict(headers).items()}
    ts = text(values.get("x-slack-request-timestamp"))
    sig = text(values.get("x-slack-signature"))
    if not ts or not sig:
        return response(401, "REJECTED", "missing_signature")
    try:
        timestamp = int(ts)
    except ValueError:
        return response(401, "REJECTED", "bad_signature_timestamp")
    current = int(now if now is not None else time.time())
    if abs(current - timestamp) > config.signature_tolerance_seconds:
        return response(401, "REJECTED", "stale_signature")
    base = b"v0:" + ts.encode("utf-8") + b":" + raw_body
    expected = "v0=" + hmac.new(config.signing_secret.encode("utf-8"), base, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return response(401, "REJECTED", "signature_mismatch")
    return None


def sign_headers(raw_body, config, now):
    ts = str(int(now))
    base = b"v0:" + ts.encode("utf-8") + b":" + raw_body
    return {
        "x-slack-request-timestamp": ts,
        "x-slack-signature": "v0=" + hmac.new(config.signing_secret.encode("utf-8"), base, hashlib.sha256).hexdigest(),
    }


def validate_envelope(envelope, config):
    if not isinstance(envelope, dict):
        return None, None, response(400, "REJECTED", "envelope_not_object")
    event_id = text(envelope.get("event_id"))
    event = envelope.get("event")
    if not event_id:
        return None, None, response(400, "REJECTED", "event_id_required")
    if text(envelope.get("team_id")) != config.team_id:
        return event_id, event, response(200, "REJECTED", "wrong_workspace")
    if text(envelope.get("api_app_id")) != config.app_id:
        return event_id, event, response(200, "REJECTED", "wrong_app")
    if not isinstance(event, dict):
        return event_id, None, response(400, "REJECTED", "event_object_required")
    if event.get("type") != "app_mention":
        return event_id, event, response(200, "REJECTED", "not_app_mention")
    if text(event.get("channel")) != config.channel_id:
        return event_id, event, response(200, "REJECTED", "wrong_channel")
    if text(event.get("bot_id")) or event.get("bot_profile") or text(event.get("subtype")) == "bot_message":
        return event_id, event, response(200, "IGNORED", "bot_event")
    user_id = text(event.get("user"))
    if not user_id or user_id == config.bot_user_id or user_id not in config.allowed_human_user_ids:
        return event_id, event, response(200, "REJECTED", "unapproved_human")
    if "<@" + config.bot_user_id + ">" not in text(event.get("text")):
        return event_id, event, response(200, "REJECTED", "missing_bot_mention")
    return event_id, event, None


def saved_event(db, event_id, body_hash):
    row = db.execute("SELECT body_sha256,result FROM slack_events WHERE event_id=?", (event_id,)).fetchone()
    if not row:
        return None
    if row[0] != body_hash:
        return response(200, "REJECTED", "event_id_conflict")
    result = json.loads(row[1])
    result["deduplicated_slack_event"] = True
    return result


def record_event(db, event_id, body_hash, state, envelope, result):
    db.execute(
        """INSERT OR REPLACE INTO slack_events(
          event_id,body_sha256,state,payload,result,created_at
        ) VALUES(?,?,?,?,?,?)""",
        (event_id, body_hash, state, compact_json(envelope), compact_json(result), stamp()),
    )


def command_text(event, config):
    return re.sub(r"<@" + re.escape(config.bot_user_id) + r">", " ", text(event.get("text"))).strip()


def stop_requested(event, config):
    words = re.findall(r"[a-z]+", command_text(event, config).lower())
    return bool(words and words[0] in STOP_WORDS)


def contact_command(event, config):
    match = re.match(r"(?i)review\s+contact\s+([0-9]+)\b", command_text(event, config))
    return match.group(1) if match else ""


def envelope_payload(envelope):
    event = envelope.get("event")
    metadata = event.get("metadata") if isinstance(event, dict) else None
    payload = metadata.get("event_payload") if isinstance(metadata, dict) else None
    if not isinstance(payload, dict):
        payload = envelope.get("event_payload")
    if not isinstance(payload, dict):
        payload = envelope.get("lead_payload")
    return payload if isinstance(payload, dict) else {}


def lead_event_from_envelope(envelope, event, config):
    payload = envelope_payload(envelope)
    supplied = payload.get("lead_event") or envelope.get("lead_event")
    if isinstance(supplied, dict):
        lead_event = dict(supplied)
    else:
        contact_id = contact_command(event, config)
        if not contact_id:
            raise ValueError("lead_event or '<@bot> review contact <contact_id>' required")
        lead_event = {
            "source_system": "slack_review_request",
            "event_id": text(envelope.get("event_id")),
            "occurred_at": datetime.fromtimestamp(int(envelope.get("event_time", time.time())), timezone.utc).isoformat(),
            "source_locator": "slack://{}/{}/{}".format(config.team_id, config.channel_id, text(event.get("ts")) or text(envelope.get("event_id"))),
            "portal_id": PORTAL_ID,
            "source_id": SLACK_REVIEW_SOURCE_ID,
            "channel_id": config.channel_id,
            "contact_id": contact_id,
            "crm_record_id": contact_id,
        }
    lead_event.setdefault("portal_id", PORTAL_ID)
    lead_event.setdefault("channel_id", config.channel_id)
    lead_event.pop("verified_event_link", None)
    return lead_event


def dispatch_stopped(db):
    return db.execute("SELECT value FROM receiver_state WHERE key='dispatch_stopped'").fetchone() is not None


def set_dispatch_stopped(db, event_id):
    db.execute(
        "INSERT OR REPLACE INTO receiver_state VALUES('dispatch_stopped',?,?)",
        (event_id, stamp()),
    )


def cancel_pending(db, event_id):
    rows = db.execute(
        "SELECT intent_id FROM delivery_intents WHERE state IN ('HELD_REVIEW','AWAITING_APPROVAL')"
    ).fetchall()
    now = stamp()
    for (intent_id,) in rows:
        db.execute(
            "UPDATE delivery_intents SET state='CANCELLED', reason=?, updated_at=? WHERE intent_id=?",
            ("cancelled_by:" + event_id, now, intent_id),
        )
    return len(rows)


def message_for(packet):
    ctx = packet.get("crm_context", {})
    lines = [
        "Momentum lead desk draft",
        "State: DRAFT. No Slack or CRM action has been taken.",
        "Inquiry: " + packet["inquiry_id"],
        "CRM record: " + packet["crm_record_id"],
        "Owner: " + packet["owner"],
        "Campaign: " + (ctx.get("campaign") or "missing"),
        "Lead status: " + (ctx.get("lead_status") or "missing"),
        "Task: " + " / ".join(v for v in [ctx.get("task_id"), ctx.get("task_status")] if v),
        "Source event: " + packet["provenance"]["source_system"] + " / " + packet["provenance"]["event_id"],
        "Review state: " + packet["review_state"],
    ]
    if packet.get("review_reasons"):
        lines.append("Missing or held evidence: " + ", ".join(packet["review_reasons"]))
    lines.append("Approval boundary: one controlled #360leads test only after install approval.")
    return "\n".join(lines)


def stage_intent(db, event_id, packet, channel_id):
    if dispatch_stopped(db):
        return response(200, "STOPPED", "receiver_dispatch_stopped", delivery_created=False, inquiry_id=packet["inquiry_id"])
    delivery_key = channel_id + "\n" + packet["inquiry_id"]
    row = db.execute(
        "SELECT intent_id,state,message,packet FROM delivery_intents WHERE delivery_key=?",
        (delivery_key,),
    ).fetchone()
    if row and row[1] == "UNCERTAIN":
        return response(
            200,
            "RECONCILE_REQUIRED",
            "prior_send_uncertain",
            intent_id=row[0],
            delivery_created=False,
            inquiry_id=packet["inquiry_id"],
        )
    if row:
        return response(
            200,
            "DUPLICATE_INQUIRY",
            intent_id=row[0],
            delivery_created=False,
            inquiry_id=packet["inquiry_id"],
            message=row[2],
            packet=json.loads(row[3]),
        )
    intent_id = "slack-intent-" + hashlib.sha256(delivery_key.encode()).hexdigest()[:20]
    message = message_for(packet)
    state = "AWAITING_APPROVAL" if packet["review_state"] == "linked_verified" else "HELD_REVIEW"
    reason = "ready_for_approved_test" if state == "AWAITING_APPROVAL" else ",".join(packet.get("review_reasons") or [])
    now = stamp()
    db.execute(
        """INSERT INTO delivery_intents(
          intent_id,delivery_key,event_id,inquiry_id,packet_id,channel_id,state,
          message,packet,reason,slack_ts,updated_at,created_at
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            intent_id,
            delivery_key,
            event_id,
            packet["inquiry_id"],
            packet["packet_id"],
            channel_id,
            state,
            message,
            compact_json(packet),
            reason,
            "",
            now,
            now,
        ),
    )
    return response(
        200,
        state,
        intent_id=intent_id,
        delivery_created=True,
        inquiry_id=packet["inquiry_id"],
        message=message,
        packet=packet,
        approval_required=True,
    )


def process_envelope(envelope, crm, db, config, body_hash, as_of=None):
    init(db)
    event_id, event, envelope_error = validate_envelope(envelope, config)
    if envelope_error:
        if event_id and not db.execute("SELECT 1 FROM slack_events WHERE event_id=?", (event_id,)).fetchone():
            record_event(db, event_id, body_hash, envelope_error["state"], envelope, envelope_error)
        return envelope_error
    prior = saved_event(db, event_id, body_hash)
    if prior:
        return prior
    if stop_requested(event, config):
        set_dispatch_stopped(db, event_id)
        result = response(200, "STOPPED", cancelled_intents=cancel_pending(db, event_id), event_id=event_id)
        record_event(db, event_id, body_hash, "STOPPED", envelope, result)
        return result
    try:
        packet = lead_agent.process(
            lead_event_from_envelope(envelope, event, config),
            crm,
            db,
            set(config.allowed_source_ids),
            {config.channel_id},
            as_of=as_of,
        )["packets"][0]
    except ValueError as exc:
        result = response(200, "HELD_REVIEW", str(exc), event_id=event_id)
        record_event(db, event_id, body_hash, "HELD_REVIEW", envelope, result)
        return result
    delivery = stage_intent(db, event_id, packet, config.channel_id)
    result = response(
        200,
        delivery["state"],
        event_id=event_id,
        team_id=config.team_id,
        channel_id=config.channel_id,
        user_id=event["user"],
        packet_id=packet["packet_id"],
        inquiry_id=packet["inquiry_id"],
        lead_review=packet,
        delivery_intent=delivery,
    )
    record_event(db, event_id, body_hash, result["state"], envelope, result)
    return result


def handle_signed_http(raw_body, headers, crm, db, config, now=None, as_of=None):
    if len(raw_body) > config.max_body_bytes:
        return response(413, "REJECTED", "body_too_large")
    sig_error = verify_signature(raw_body, headers, config, now=now)
    if sig_error:
        return sig_error
    try:
        envelope = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return response(400, "REJECTED", "body_not_json")
    if not isinstance(envelope, dict):
        return response(400, "REJECTED", "envelope_not_object")
    if envelope.get("type") == "url_verification":
        challenge = envelope.get("challenge")
        if not isinstance(challenge, str) or len(challenge) > 1024:
            return response(400, "REJECTED", "bad_challenge")
        return response(200, "CHALLENGE", challenge=challenge)
    return process_envelope(envelope, crm, db, config, hashlib.sha256(raw_body).hexdigest(), as_of=as_of)


def handle_socket_envelope(envelope, crm, db, config, as_of=None):
    return process_envelope(
        envelope,
        crm,
        db,
        config,
        "socket:" + hashlib.sha256(compact_json(envelope).encode("utf-8")).hexdigest(),
        as_of=as_of,
    )


def socket_tokens(env=os.environ):
    bot_token = text(env.get("MOMENTUM_SLACK_BOT_TOKEN"))
    app_token = text(env.get("MOMENTUM_SLACK_APP_TOKEN"))
    missing = []
    if not bot_token:
        missing.append("MOMENTUM_SLACK_BOT_TOKEN")
    if not app_token:
        missing.append("MOMENTUM_SLACK_APP_TOKEN")
    if missing:
        raise ValueError("missing Socket Mode secret: " + ", ".join(missing))
    if not bot_token.startswith("xoxb-") or not app_token.startswith("xapp-"):
        raise ValueError("Slack Socket Mode token prefixes are invalid")
    return bot_token, app_token


def slack_client_from_env(env=os.environ):
    token = text(env.get("MOMENTUM_SLACK_BOT_TOKEN"))
    if not token:
        raise ValueError("missing Slack bot token")
    if not token.startswith("xoxb-"):
        raise ValueError("Slack bot token prefix is invalid")
    try:
        from slack_sdk import WebClient
    except ImportError as exc:
        raise ValueError("install requirements.txt before Slack delivery run") from exc
    return WebClient(token=token)


def build_socket_app(config, crm, db_path, as_of=None):
    bot_token, _app_token = socket_tokens()
    try:
        from slack_bolt import App
    except ImportError as exc:
        raise ValueError("install requirements.txt before Socket Mode run") from exc
    app = App(token=bot_token, process_before_response=True)
    auth = app.client.auth_test()
    if auth.get("team_id") != config.team_id:
        raise ValueError("Slack auth.test team_id did not match Momentum workspace")
    if auth.get("user_id") != config.bot_user_id:
        raise ValueError("Slack auth.test bot user did not match config")
    if auth.get("app_id") and auth.get("app_id") != config.app_id:
        raise ValueError("Slack auth.test app_id did not match config")

    @app.event("app_mention")
    def receive_app_mention(event, body, ack, logger=None):
        ack()
        team = body.get("team_id")
        if not team and isinstance(body.get("team"), dict):
            team = body["team"].get("id")
        if not team:
            team = body.get("team")
        envelope = {
            "team_id": team,
            "api_app_id": body.get("api_app_id") or config.app_id,
            "event_id": body.get("event_id"),
            "event_time": body.get("event_time"),
            "event": event,
        }
        db = sqlite3.connect(db_path)
        try:
            with db:
                result = handle_socket_envelope(envelope, crm, db, config, as_of=as_of)
        finally:
            db.close()
        if logger:
            logger.info("Momentum receiver staged %s", result.get("state"))
        return {"state": result.get("state"), "reason": result.get("reason", "")}

    return app


def serve_socket_mode(config, crm, db_path, as_of=None):
    _bot_token, app_token = socket_tokens()
    try:
        from slack_bolt.adapter.socket_mode import SocketModeHandler
    except ImportError as exc:
        raise ValueError("install requirements.txt before Socket Mode run") from exc
    app = build_socket_app(config, crm, db_path, as_of=as_of)
    print(json.dumps({"state": "SOCKET_MODE_STARTING", "offline_delivery_only": True}))
    SocketModeHandler(app, app_token).start()


def serve_loopback(bind, config, crm, db_path, as_of=None):
    host, _, port_text = bind.partition(":")
    host = host or "127.0.0.1"
    if host not in {"127.0.0.1", "localhost"}:
        raise ValueError("loopback receiver binds only to localhost")
    port = int(port_text or "8787")

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            self.connection.settimeout(2)
            try:
                length = int(self.headers.get("content-length", "0"))
            except ValueError:
                result = response(411, "REJECTED", "bad_content_length")
            else:
                if length < 0:
                    result = response(400, "REJECTED", "bad_content_length")
                elif length > config.max_body_bytes:
                    result = response(413, "REJECTED", "body_too_large")
                else:
                    raw = self.rfile.read(length)
                    db = sqlite3.connect(db_path)
                    try:
                        with db:
                            result = handle_signed_http(raw, self.headers, crm, db, config, as_of=as_of)
                    finally:
                        db.close()
            if result.get("state") == "CHALLENGE":
                body = result["challenge"].encode("utf-8")
                content_type = "text/plain"
            else:
                body = compact_json({"state": result.get("state"), "reason": result.get("reason", "")}).encode("utf-8")
                content_type = "application/json"
            self.send_response(int(result.get("status_code", 500)))
            self.send_header("content-type", content_type)
            self.send_header("content-length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *_args):
            return

    print(json.dumps({"state": "LISTENING", "bind": host + ":" + str(port), "offline_only": True}))
    HTTPServer((host, port), Handler).serve_forever()


def record_receipt(receipt, db):
    if not isinstance(receipt, dict):
        raise ValueError("receipt must be an object")
    intent_id = text(receipt.get("intent_id"))
    row = db.execute("SELECT channel_id FROM delivery_intents WHERE intent_id=?", (intent_id,)).fetchone()
    if not row:
        raise ValueError("unknown intent_id")
    channel_id = text(receipt.get("channel_id"))
    message_ts = text(receipt.get("message_ts"))
    readback_ref = text(receipt.get("readback_ref"))
    if channel_id != row[0]:
        raise ValueError("receipt channel mismatch")
    if not message_ts or not readback_ref or receipt.get("verified") is not True:
        raise ValueError("verified message_ts and readback_ref required")
    db.execute(
        "INSERT OR REPLACE INTO delivery_receipts VALUES(?,?,?,?,?,?)",
        (intent_id, channel_id, message_ts, readback_ref, 1, stamp()),
    )
    db.execute(
        "UPDATE delivery_intents SET state='DELIVERED', slack_ts=?, reason='positive_readback_recorded', updated_at=? WHERE intent_id=?",
        (message_ts, stamp(), intent_id),
    )
    return response(200, "RECEIPT_RECORDED", intent_id=intent_id, readback_ref=readback_ref)


def mark_uncertain(db, inquiry_id, reason):
    db.execute(
        "UPDATE delivery_intents SET state='UNCERTAIN', reason=?, updated_at=? WHERE inquiry_id=?",
        (text(reason) or "send outcome uncertain", stamp(), inquiry_id),
    )


def message_hash(message):
    return hashlib.sha256(message.encode("utf-8")).hexdigest()


def approval_expired(approval, now=None):
    expires_at = text(approval.get("expires_at"))
    if not expires_at:
        return True
    try:
        expiry = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    except ValueError:
        return True
    current = datetime.fromtimestamp(now, timezone.utc) if now is not None else datetime.now(timezone.utc)
    return current > expiry


def verify_slack_client_identity(client, config):
    auth = client.auth_test()
    if auth.get("team_id") != config.team_id:
        raise ValueError("Slack auth.test team_id did not match Momentum workspace")
    if auth.get("user_id") != config.bot_user_id:
        raise ValueError("Slack auth.test bot user did not match config")
    if auth.get("app_id") and auth.get("app_id") != config.app_id:
        raise ValueError("Slack auth.test app_id did not match config")


def send_approved_intent(approval, db, config, client, now=None):
    if not isinstance(approval, dict):
        raise ValueError("approval must be an object")
    required = ["intent_id", "team_id", "channel_id", "message_sha256", "approved_by", "approved_at", "expires_at"]
    missing = [name for name in required if not text(approval.get(name))]
    if missing:
        raise ValueError("approval missing " + ", ".join(missing))
    if approval["team_id"] != config.team_id or approval["channel_id"] != config.channel_id:
        raise ValueError("approval team/channel mismatch")
    if approval_expired(approval, now=now):
        raise ValueError("approval expired")
    verify_slack_client_identity(client, config)
    row = db.execute(
        "SELECT channel_id,state,message,inquiry_id FROM delivery_intents WHERE intent_id=?",
        (approval["intent_id"],),
    ).fetchone()
    if not row:
        raise ValueError("unknown intent_id")
    channel_id, state, message, inquiry_id = row
    if channel_id != config.channel_id:
        raise ValueError("intent channel mismatch")
    if state != "AWAITING_APPROVAL":
        raise ValueError("intent is not approved-delivery ready")
    if message_hash(message) != approval["message_sha256"]:
        raise ValueError("message hash mismatch")
    db.execute(
        "UPDATE delivery_intents SET state='SENDING', reason=?, updated_at=? WHERE intent_id=?",
        ("approved_by:" + approval["approved_by"], stamp(), approval["intent_id"]),
    )
    db.commit()
    try:
        sent = client.chat_postMessage(channel=channel_id, text=message)
    except Exception:
        db.execute(
            "UPDATE delivery_intents SET state='UNCERTAIN', reason='send_exception_after_claim', updated_at=? WHERE intent_id=?",
            (stamp(), approval["intent_id"]),
        )
        db.commit()
        raise
    ts = text(sent.get("ts")) if isinstance(sent, dict) else ""
    if not isinstance(sent, dict) or sent.get("ok") is not True or not ts:
        db.execute(
            "UPDATE delivery_intents SET state='SEND_FAILED', reason='slack_post_not_ok', updated_at=? WHERE intent_id=?",
            (stamp(), approval["intent_id"]),
        )
        db.commit()
        return response(200, "SEND_FAILED", "slack_post_not_ok", intent_id=approval["intent_id"])
    read = client.conversations_history(channel=channel_id, latest=ts, inclusive=True, limit=1)
    messages = read.get("messages", []) if isinstance(read, dict) else []
    matched = any(text(m.get("ts")) == ts and m.get("text") == message for m in messages if isinstance(m, dict))
    if not matched:
        db.execute(
            "UPDATE delivery_intents SET state='UNCERTAIN', slack_ts=?, reason='readback_missing', updated_at=? WHERE intent_id=?",
            (ts, stamp(), approval["intent_id"]),
        )
        db.commit()
        return response(200, "RECONCILE_REQUIRED", "readback_missing", intent_id=approval["intent_id"], slack_ts=ts)
    receipt = {
        "intent_id": approval["intent_id"],
        "channel_id": channel_id,
        "message_ts": ts,
        "readback_ref": "slack://{}/{}/{}".format(config.team_id, channel_id, ts),
        "verified": True,
    }
    result = record_receipt(receipt, db)
    result["inquiry_id"] = inquiry_id
    db.commit()
    return result


def demo_envelope(crm, event_id="EvM360FIRSTSYNTH01", provider_event_id="provider-first", contact_id="247699043386"):
    return {
        "event_id": event_id,
        "team_id": TEAM_ID,
        "api_app_id": DEMO_APP_ID,
        "event_time": 1800000000,
        "event": {
            "type": "app_mention",
            "user": DEMO_HUMAN_ID,
            "channel": CHANNEL_ID,
            "text": "<@{}> review contact {}".format(DEMO_BOT_USER_ID, contact_id),
            "ts": "1789315200.000000",
        },
        "lead_event": {
            "source_system": "synthetic-demo",
            "event_id": provider_event_id,
            "occurred_at": crm["readAt"],
            "source_locator": "fixture://synthetic-provider/" + provider_event_id,
            "portal_id": PORTAL_ID,
            "source_id": "synthetic-demo",
            "channel_id": CHANNEL_ID,
            "contact_id": contact_id,
            "crm_record_id": contact_id,
        },
    }


def plain_contact_envelope(contact_id="247699043386", event_id="EvM360PLAIN01"):
    return {
        "event_id": event_id,
        "team_id": TEAM_ID,
        "api_app_id": DEMO_APP_ID,
        "event_time": 1800000000,
        "event": {
            "type": "app_mention",
            "user": DEMO_HUMAN_ID,
            "channel": CHANNEL_ID,
            "text": "<@{}> review contact {}".format(DEMO_BOT_USER_ID, contact_id),
            "ts": "1789315300.000000",
        },
    }


def self_test():
    crm = load(PACKAGE / "live-crm-snapshot.json")
    config = Config.demo()
    checks = 0

    def check(value):
        nonlocal checks
        assert value
        checks += 1

    db = sqlite3.connect(":memory:")
    try:
        init(db)
        first_body = demo_envelope(crm)
        raw = compact_json(first_body).encode("utf-8")
        signed = handle_signed_http(raw, sign_headers(raw, config, 1800000000), crm, db, config, now=1800000000, as_of=crm["readAt"])
        first_inquiry = signed["inquiry_id"]
        check(signed["state"] == "HELD_REVIEW")
        check(signed["delivery_intent"]["delivery_created"] is True)
        check("mapping_required" in signed["lead_review"]["review_reasons"])
        check("2026 Suspension Ads" in signed["delivery_intent"]["message"])
        check("84251079" in signed["delivery_intent"]["message"])
        check(db.execute("SELECT count(*) FROM delivery_intents").fetchone()[0] == 1)

        duplicate = handle_signed_http(raw, sign_headers(raw, config, 1800000000), crm, db, config, now=1800000000, as_of=crm["readAt"])
        check(duplicate["deduplicated_slack_event"] is True)
        check(db.execute("SELECT count(*) FROM delivery_intents").fetchone()[0] == 1)

        retry = demo_envelope(crm, event_id="EvM360RETRY01", provider_event_id="provider-first")
        retry_raw = compact_json(retry).encode("utf-8")
        retry_result = handle_signed_http(retry_raw, sign_headers(retry_raw, config, 1800000000), crm, db, config, now=1800000000, as_of=crm["readAt"])
        check(retry_result["state"] == "DUPLICATE_INQUIRY")
        check(retry_result["inquiry_id"] == first_inquiry)

        mark_uncertain(db, first_inquiry, "simulated timeout")
        uncertain = demo_envelope(crm, event_id="EvM360UNCERTAIN01", provider_event_id="provider-first")
        uncertain_raw = compact_json(uncertain).encode("utf-8")
        uncertain_result = handle_signed_http(uncertain_raw, sign_headers(uncertain_raw, config, 1800000000), crm, db, config, now=1800000000, as_of=crm["readAt"])
        check(uncertain_result["state"] == "RECONCILE_REQUIRED")
        check(uncertain_result["delivery_intent"]["delivery_created"] is False)

        second = demo_envelope(crm, event_id="EvM360SECOND01", provider_event_id="provider-second")
        second_raw = compact_json(second).encode("utf-8")
        second_result = handle_signed_http(second_raw, sign_headers(second_raw, config, 1800000000), crm, db, config, now=1800000000, as_of=crm["readAt"])
        check(second_result["inquiry_id"] != first_inquiry)
        check(db.execute("SELECT count(*) FROM delivery_intents").fetchone()[0] == 2)

        plain = plain_contact_envelope(event_id="EvM360PLAIN01")
        plain_result = handle_socket_envelope(plain, crm, db, config, as_of=crm["readAt"])
        check(plain_result["state"] == "HELD_REVIEW")
        check(plain_result["lead_review"]["fields"]["source_system"] == "slack_review_request")

        not_stop = plain_contact_envelope(event_id="EvM360NOTSTOP01")
        not_stop["event"]["text"] = "<@{}> do not stop contact 247699043386".format(DEMO_BOT_USER_ID)
        check(handle_socket_envelope(not_stop, crm, db, config, as_of=crm["readAt"])["state"] == "HELD_REVIEW")

        bad_cases = [
            (dict(demo_envelope(crm), team_id="TWRONG"), "wrong_workspace"),
            (dict(demo_envelope(crm), api_app_id="AWRONG"), "wrong_app"),
            (dict(demo_envelope(crm), event={**demo_envelope(crm)["event"], "channel": "CWRONG"}), "wrong_channel"),
            (dict(demo_envelope(crm), event={**demo_envelope(crm)["event"], "user": "UWRONG"}), "unapproved_human"),
            (dict(demo_envelope(crm), event={**demo_envelope(crm)["event"], "bot_id": "B123"}), "bot_event"),
            (dict(demo_envelope(crm), event={**demo_envelope(crm)["event"], "text": "review contact 247699043386"}), "missing_bot_mention"),
        ]
        for index, (bad, reason) in enumerate(bad_cases):
            bad["event_id"] = "EvM360BAD{:02d}".format(index)
            check(handle_socket_envelope(bad, crm, db, config, as_of=crm["readAt"])["reason"] == reason)

        big_config = Config(
            signing_secret=config.signing_secret,
            team_id=config.team_id,
            channel_id=config.channel_id,
            app_id=config.app_id,
            bot_user_id=config.bot_user_id,
            allowed_human_user_ids=config.allowed_human_user_ids,
            allowed_source_ids=config.allowed_source_ids,
            max_body_bytes=1024,
        ).checked()
        big = b'{"x":"' + (b"x" * 2048) + b'"}'
        check(handle_signed_http(big, sign_headers(big, big_config, 1800000000), crm, db, big_config, now=1800000000)["status_code"] == 413)
        check(handle_signed_http(b"[]", sign_headers(b"[]", config, 1800000000), crm, db, config, now=1800000000)["reason"] == "envelope_not_object")
        check(handle_signed_http(raw, {}, crm, db, config, now=1800000000)["status_code"] == 401)
        check(handle_signed_http(raw, sign_headers(raw, config, 1799999000), crm, db, config, now=1800000000)["reason"] == "stale_signature")

        changed = dict(first_body, api_app_id=DEMO_APP_ID)
        changed["lead_event"] = dict(changed["lead_event"], event_id="changed")
        changed_raw = compact_json(changed).encode("utf-8")
        check(handle_signed_http(changed_raw, sign_headers(changed_raw, config, 1800000000), crm, db, config, now=1800000000)["reason"] == "event_id_conflict")

        challenge_raw = compact_json({"type": "url_verification", "challenge": "ok"}).encode("utf-8")
        check(handle_signed_http(challenge_raw, sign_headers(challenge_raw, config, 1800000000), crm, db, config, now=1800000000)["challenge"] == "ok")

        ready = demo_envelope(crm, event_id="EvM360READY01", provider_event_id="provider-ready")
        ready_raw = compact_json(ready).encode("utf-8")
        ready_result = handle_signed_http(ready_raw, sign_headers(ready_raw, config, 1800000000), crm, db, config, now=1800000000, as_of=crm["readAt"])
        ready_intent = ready_result["delivery_intent"]["intent_id"]
        db.execute("UPDATE delivery_intents SET state='AWAITING_APPROVAL' WHERE intent_id=?", (ready_intent,))

        class FakeSlack:
            def __init__(self, ok=True, readback=True, fail=False):
                self.ok = ok
                self.readback = readback
                self.fail = fail
                self.sent = []

            def auth_test(self):
                return {"team_id": TEAM_ID, "user_id": DEMO_BOT_USER_ID, "app_id": DEMO_APP_ID}

            def chat_postMessage(self, channel, text):
                if self.fail:
                    raise RuntimeError("simulated timeout")
                self.sent.append((channel, text))
                return {"ok": self.ok, "ts": "1789060000.000200"}

            def conversations_history(self, channel, latest, inclusive, limit):
                if not self.readback:
                    return {"ok": True, "messages": []}
                return {"ok": True, "messages": [{"ts": latest, "text": self.sent[-1][1]}]}

        message = db.execute("SELECT message FROM delivery_intents WHERE intent_id=?", (ready_intent,)).fetchone()[0]
        approval = {
            "intent_id": ready_intent,
            "team_id": TEAM_ID,
            "channel_id": CHANNEL_ID,
            "message_sha256": message_hash(message),
            "approved_by": "test",
            "approved_at": "2026-09-13T17:00:00Z",
            "expires_at": "2030-01-01T00:00:00Z",
        }
        fake = FakeSlack()
        sent = send_approved_intent(approval, db, config, fake, now=1800000000)
        check(sent["state"] == "RECEIPT_RECORDED")
        check(fake.sent == [(CHANNEL_ID, message)])
        check(db.execute("SELECT state FROM delivery_intents WHERE intent_id=?", (ready_intent,)).fetchone()[0] == "DELIVERED")

        blocked = dict(approval, message_sha256="wrong")
        try:
            send_approved_intent(blocked, db, config, FakeSlack(), now=1800000000)
            raise AssertionError("bad hash approved")
        except ValueError:
            checks += 1

        stop = plain_contact_envelope(event_id="EvM360STOP01")
        stop["event"]["text"] = "<@{}> stop".format(DEMO_BOT_USER_ID)
        stopped = handle_socket_envelope(stop, crm, db, config, as_of=crm["readAt"])
        check(stopped["state"] == "STOPPED")
        check(stopped["cancelled_intents"] >= 1)
        after_stop = plain_contact_envelope(event_id="EvM360AFTERSTOP01")
        check(handle_socket_envelope(after_stop, crm, db, config, as_of=crm["readAt"])["state"] == "STOPPED")

        receipt = {
            "intent_id": signed["delivery_intent"]["intent_id"],
            "channel_id": CHANNEL_ID,
            "message_ts": "1789059999.000100",
            "readback_ref": "https://momentum3d.slack.com/archives/C05R2B1ULF6/p1789059999000100",
            "verified": True,
        }
        check(record_receipt(receipt, db)["state"] == "RECEIPT_RECORDED")
        check(db.execute("SELECT count(*) FROM delivery_receipts").fetchone()[0] == 1)

        try:
            Config.from_env({})
            raise AssertionError("missing config accepted")
        except ValueError:
            checks += 1
        try:
            socket_tokens({})
            raise AssertionError("missing socket tokens accepted")
        except ValueError:
            checks += 1
        try:
            serve_loopback("0.0.0.0:8787", config, crm, ":memory:")
            raise AssertionError("non-loopback bind accepted")
        except ValueError:
            checks += 1

        class FakeClient:
            def auth_test(self):
                return {"team_id": TEAM_ID, "user_id": DEMO_BOT_USER_ID, "app_id": DEMO_APP_ID}

        class FakeApp:
            def __init__(self, token, process_before_response):
                self.token = token
                self.process_before_response = process_before_response
                self.client = FakeClient()
                self.handlers = {}

            def event(self, name):
                def decorate(func):
                    self.handlers[name] = func
                    return func
                return decorate

        prior_module = sys.modules.get("slack_bolt")
        fake_module = types.ModuleType("slack_bolt")
        fake_module.App = FakeApp
        old_env = {name: os.environ.get(name) for name in ("MOMENTUM_SLACK_BOT_TOKEN", "MOMENTUM_SLACK_APP_TOKEN")}
        try:
            sys.modules["slack_bolt"] = fake_module
            os.environ["MOMENTUM_SLACK_BOT_TOKEN"] = "xoxb-test-token"
            os.environ["MOMENTUM_SLACK_APP_TOKEN"] = "xapp-test-token"
            with tempfile.TemporaryDirectory() as td:
                socket_db = Path(td) / "socket.sqlite"
                app = build_socket_app(config, crm, socket_db, as_of=crm["readAt"])
                acked = []
                socket_body = plain_contact_envelope(event_id="EvM360SOCKET01")
                socket_result = app.handlers["app_mention"](
                    event=socket_body["event"],
                    body={k: socket_body[k] for k in ("team_id", "api_app_id", "event_id", "event_time")},
                    ack=lambda: acked.append(True),
                    logger=None,
                )
                check(acked == [True])
                check(socket_result["state"] == "HELD_REVIEW")
                socket_conn = sqlite3.connect(socket_db)
                try:
                    check(socket_conn.execute("SELECT count(*) FROM delivery_intents").fetchone()[0] == 1)
                finally:
                    socket_conn.close()
        finally:
            if prior_module is None:
                sys.modules.pop("slack_bolt", None)
            else:
                sys.modules["slack_bolt"] = prior_module
            for name, value in old_env.items():
                if value is None:
                    os.environ.pop(name, None)
                else:
                    os.environ[name] = value
    finally:
        db.close()
    return {"state": "PASS", "checks": checks, "scope": "local receiver core; no network or Slack send"}


def run_demo(args):
    crm = load(args.crm_json)
    config = Config.demo()
    envelope = demo_envelope(crm)
    if args.event_output:
        write_json(args.event_output, envelope)
    raw = compact_json(envelope).encode("utf-8")
    db = sqlite3.connect(args.db)
    try:
        with db:
            result = handle_signed_http(raw, sign_headers(raw, config, 1800000000), crm, db, config, now=1800000000, as_of=args.as_of or crm["readAt"])
    finally:
        db.close()
    return result


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--demo", action="store_true")
    parser.add_argument("--serve-loopback")
    parser.add_argument("--serve-socket-mode", action="store_true")
    parser.add_argument("--body-json")
    parser.add_argument("--headers-json")
    parser.add_argument("--receipt-json")
    parser.add_argument("--approved-send-json")
    parser.add_argument("--mark-uncertain-inquiry")
    parser.add_argument("--uncertain-reason", default="manual uncertain-send hold")
    parser.add_argument("--crm-json", default=str(PACKAGE / "live-crm-snapshot.json"))
    parser.add_argument("--db", default=str(BASE / "run" / "receiver.sqlite"))
    parser.add_argument("--out", default=str(BASE / "run" / "first-test-result.json"))
    parser.add_argument("--event-output")
    parser.add_argument("--as-of")
    parser.add_argument("--now", type=int)
    args = parser.parse_args(argv)
    try:
        if args.self_test:
            result = self_test()
        elif args.demo:
            result = run_demo(args)
        else:
            crm = load(args.crm_json)
            config = Config.from_env()
            if args.serve_socket_mode:
                serve_socket_mode(config, crm, args.db, as_of=args.as_of)
                return 0
            if args.serve_loopback:
                serve_loopback(args.serve_loopback, config, crm, args.db, as_of=args.as_of)
                return 0
            db = sqlite3.connect(args.db)
            try:
                init(db)
                with db:
                    if args.receipt_json:
                        result = record_receipt(load(args.receipt_json), db)
                    elif args.approved_send_json:
                        result = send_approved_intent(load(args.approved_send_json), db, config, slack_client_from_env(), now=args.now)
                    elif args.mark_uncertain_inquiry:
                        mark_uncertain(db, args.mark_uncertain_inquiry, args.uncertain_reason)
                        result = response(200, "UNCERTAIN_RECORDED", inquiry_id=args.mark_uncertain_inquiry)
                    elif args.body_json and args.headers_json:
                        result = handle_signed_http(
                            Path(args.body_json).read_bytes(),
                            load(args.headers_json),
                            crm,
                            db,
                            config,
                            now=args.now,
                            as_of=args.as_of,
                        )
                    else:
                        raise ValueError("choose --demo, --self-test, --serve-*, --receipt-json, --mark-uncertain-inquiry, or --body-json/--headers-json")
            finally:
                db.close()
        if not args.self_test:
            write_json(args.out, result)
        print(json.dumps(result, indent=2))
        return 0 if int(result.get("status_code", 200)) < 400 else 2
    except (ValueError, OSError, sqlite3.Error) as exc:
        result = response(500, "FAILED", str(exc))
        if not args.self_test:
            write_json(args.out, result)
        print(json.dumps(result, indent=2))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
