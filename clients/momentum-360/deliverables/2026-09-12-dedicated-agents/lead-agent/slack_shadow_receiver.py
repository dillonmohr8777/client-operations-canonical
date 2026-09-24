#!/usr/bin/env python3
"""Local-only Slack mention receiver for the Momentum lead pilot."""
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
import time

import lead_agent

EXPECTED_TEAM_ID = "T066HGS7N"
EXPECTED_CHANNEL_ID = "C05R2B1ULF6"
STOP_WORDS = {"stop", "cancel"}


def text(value):
    return value.strip() if isinstance(value, str) else ""


def stamp():
    return datetime.now(timezone.utc).isoformat()


def dumps(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


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
    def from_env(cls, env=os.environ):
        values = {
            "signing_secret": text(env.get("MOMENTUM_SLACK_SIGNING_SECRET")),
            "team_id": text(env.get("MOMENTUM_SLACK_TEAM_ID")),
            "channel_id": text(env.get("MOMENTUM_SLACK_CHANNEL_ID")),
            "app_id": text(env.get("MOMENTUM_SLACK_APP_ID")),
            "bot_user_id": text(env.get("MOMENTUM_SLACK_BOT_USER_ID")),
        }
        missing = [k for k, v in values.items() if not v]
        humans = tokens(env.get("MOMENTUM_ALLOWED_HUMAN_USER_IDS"))
        sources = tokens(env.get("MOMENTUM_ALLOWED_SOURCE_IDS"))
        if not humans:
            missing.append("allowed_human_user_ids")
        if not sources:
            missing.append("allowed_source_ids")
        if missing:
            raise ValueError("missing required external receiver config: " + ", ".join(sorted(missing)))
        return cls(
            **values,
            allowed_human_user_ids=frozenset(humans),
            allowed_source_ids=frozenset(sources),
        ).checked()

    def checked(self):
        if self.team_id != EXPECTED_TEAM_ID:
            raise ValueError("team_id must match verified Momentum workspace T066HGS7N")
        if self.channel_id != EXPECTED_CHANNEL_ID:
            raise ValueError("channel_id must match verified #360leads C05R2B1ULF6")
        if not self.signing_secret:
            raise ValueError("signing secret must come from the external secret store")
        if not self.allowed_human_user_ids:
            raise ValueError("at least one approved human Slack user id is required")
        if not self.allowed_source_ids:
            raise ValueError("at least one approved source id is required")
        if self.max_body_bytes < 1024:
            raise ValueError("max_body_bytes must be at least 1024")
        return self


def tokens(value):
    return {part.strip() for part in text(value).split(",") if part.strip()}


def init(db):
    lead_agent.init(db)
    db.execute("""CREATE TABLE IF NOT EXISTS slack_shadow_events(
      slack_event_id TEXT PRIMARY KEY,
      body_sha256 TEXT NOT NULL DEFAULT '',
      team_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      state TEXT NOT NULL,
      inquiry_id TEXT,
      response TEXT NOT NULL,
      received_at TEXT NOT NULL)""")
    columns = {row[1] for row in db.execute("PRAGMA table_info(slack_shadow_events)")}
    if "body_sha256" not in columns:
        db.execute("ALTER TABLE slack_shadow_events ADD COLUMN body_sha256 TEXT NOT NULL DEFAULT ''")
    db.execute("""CREATE TABLE IF NOT EXISTS delivery_ledger(
      intent_id TEXT PRIMARY KEY,
      inquiry_id TEXT NOT NULL UNIQUE,
      packet_id TEXT NOT NULL,
      source_slack_event_id TEXT NOT NULL,
      state TEXT NOT NULL,
      message TEXT NOT NULL,
      slack_ts TEXT,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL)""")
    db.execute("""CREATE TABLE IF NOT EXISTS receiver_state(
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL)""")


def verify_signature(raw_body, headers, config, now=None):
    header = {str(k).lower(): v for k, v in dict(headers).items()}
    ts = text(header.get("x-slack-request-timestamp"))
    sig = text(header.get("x-slack-signature"))
    if not ts or not sig:
        return reject(401, "bad_signature", "missing Slack signature headers")
    try:
        seen = int(ts)
    except ValueError:
        return reject(401, "bad_signature", "invalid Slack signature timestamp")
    current = int(now if now is not None else time.time())
    if abs(current - seen) > config.signature_tolerance_seconds:
        return reject(401, "bad_signature", "stale Slack signature timestamp")
    base = b"v0:" + ts.encode("utf-8") + b":" + raw_body
    expected = "v0=" + hmac.new(config.signing_secret.encode("utf-8"), base, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return reject(401, "bad_signature", "Slack signature mismatch")
    return None


def reject(status_code, reason, detail=None):
    out = {"status_code": status_code, "state": "REJECTED", "reason": reason, "offline_only": True}
    if detail:
        out["detail"] = detail
    return out


def event_text(event):
    return text(event.get("text")) if isinstance(event, dict) else ""


def is_stop(event):
    command = re.sub(r"<@[A-Z0-9]+>", " ", event_text(event)).strip().lower()
    return re.fullmatch(r"(?:stop|cancel)(?: (?:all|dispatch))?", command) is not None


def event_payload(envelope):
    event = envelope.get("event") if isinstance(envelope, dict) else None
    if not isinstance(event, dict):
        return None
    metadata = event.get("metadata")
    payload = metadata.get("event_payload") if isinstance(metadata, dict) else None
    if not isinstance(payload, dict):
        payload = envelope.get("event_payload")
    if not isinstance(payload, dict):
        payload = envelope.get("lead_payload")
    return payload if isinstance(payload, dict) else None


def lead_event(envelope, config):
    payload = event_payload(envelope)
    value = payload.get("lead_event") if isinstance(payload, dict) else None
    if not isinstance(value, dict):
        event = envelope["event"]
        command = event_text(event).replace("<@" + config.bot_user_id + ">", "").strip()
        match = re.fullmatch(r"review contact ([0-9]{1,30})", command, re.IGNORECASE)
        if not match:
            raise ValueError("use: @Momentum Workmate review contact <numeric-id>")
        timestamp = float(text(event.get("ts")))
        occurred = datetime.fromtimestamp(timestamp, timezone.utc).isoformat()
        value = {
            "source_system": "slack_review_request", "source_id": "slack_review_request",
            "event_id": envelope["event_id"], "occurred_at": occurred,
            "source_locator": "https://momentum3d.slack.com/archives/" + config.channel_id + "/p" + event["ts"].replace(".", ""),
            "portal_id": "50612503", "contact_id": match.group(1),
        }
    normalized = dict(value)
    normalized.setdefault("channel_id", config.channel_id)
    normalized.pop("verified_event_link", None)
    return normalized


def validate_envelope(envelope, config):
    if not isinstance(envelope, dict):
        return reject(400, "bad_payload", "Slack envelope must be a JSON object")
    event_id = text(envelope.get("event_id"))
    event = envelope.get("event")
    if not event_id:
        return reject(400, "bad_payload", "Slack event_id is required")
    if not isinstance(event, dict):
        return reject(400, "bad_payload", "Slack event object is required")
    if envelope.get("team_id") != config.team_id:
        return reject(200, "wrong_workspace")
    if envelope.get("api_app_id") != config.app_id:
        return reject(200, "wrong_app")
    if event.get("type") != "app_mention":
        return reject(200, "not_app_mention")
    if event.get("channel") != config.channel_id:
        return reject(200, "wrong_channel")
    user = text(event.get("user"))
    if not user or user == config.bot_user_id or user not in config.allowed_human_user_ids:
        return reject(200, "unapproved_human")
    if text(event.get("bot_id")) or text(event.get("subtype")) == "bot_message":
        return reject(200, "bot_event")
    if "<@" + config.bot_user_id + ">" not in event_text(event):
        return reject(200, "missing_bot_mention")
    return None


def save_event(db, envelope, state, response, body_hash, inquiry_id=""):
    event = envelope.get("event") if isinstance(envelope, dict) else {}
    db.execute(
        """INSERT INTO slack_shadow_events(
          slack_event_id,body_sha256,team_id,channel_id,user_id,state,inquiry_id,response,received_at
        ) VALUES(?,?,?,?,?,?,?,?,?)""",
        (
            text(envelope.get("event_id")),
            body_hash,
            text(envelope.get("team_id")),
            text(event.get("channel")),
            text(event.get("user")),
            state,
            inquiry_id,
            dumps(response),
            stamp(),
        ),
    )


def saved_event(db, event_id, body_hash):
    row = db.execute(
        "SELECT body_sha256,response FROM slack_shadow_events WHERE slack_event_id=?", (event_id,)
    ).fetchone()
    if not row:
        return None
    if row[0] != body_hash:
        return reject(200, "event_id_conflict", "same Slack event_id arrived with different body")
    response = json.loads(row[1])
    response["deduplicated_slack_event"] = True
    return response


def cancel_pending(db, source_slack_event_id):
    # ponytail: channel-wide shadow stop; narrow to per-thread cancellation if concurrent pilots start.
    rows = db.execute(
        "SELECT intent_id FROM delivery_ledger WHERE state IN ('AWAITING_APPROVAL','HELD_REVIEW')"
    ).fetchall()
    now = stamp()
    for (intent_id,) in rows:
        db.execute(
            "UPDATE delivery_ledger SET state='CANCELLED', reason=?, updated_at=? WHERE intent_id=?",
            ("cancelled_by_slack_event:" + source_slack_event_id, now, intent_id),
        )
    return len(rows)


def dispatch_stopped(db):
    return db.execute("SELECT value FROM receiver_state WHERE key='dispatch_stopped'").fetchone() is not None


def stop_dispatch(db, source_slack_event_id):
    db.execute(
        "INSERT OR REPLACE INTO receiver_state VALUES('dispatch_stopped',?,?)",
        (source_slack_event_id, stamp()),
    )


def render_message(packet):
    ctx = packet.get("crm_context", {})
    fields = packet.get("fields", {})
    lines = [
        "Momentum lead review draft",
        "Inquiry: " + packet["inquiry_id"],
        "Source: " + (ctx.get("utm_source") or fields.get("source_system") or "missing"),
        "Campaign: " + (ctx.get("campaign") or "missing"),
        "Owner: " + packet.get("owner", "missing"),
        "Task: " + " ".join(p for p in [ctx.get("task_priority"), ctx.get("task_status"), ctx.get("task_id")] if p),
        "CRM contact: " + packet.get("crm_record_id", "unverified"),
        "Review state: " + packet.get("review_state", "held"),
        "Approval required before any Slack post.",
    ]
    reasons = packet.get("review_reasons") or []
    if reasons:
        lines.insert(-1, "Hold reasons: " + ", ".join(reasons))
    return "\n".join(lines) + "\n"


def stage_delivery(db, slack_event_id, packet):
    inquiry_id = packet["inquiry_id"]
    if dispatch_stopped(db):
        return {
            "state": "STOPPED",
            "inquiry_id": inquiry_id,
            "delivery_created": False,
            "reason": "receiver dispatch stopped; preserve draft only",
        }
    row = db.execute(
        "SELECT intent_id,state,message FROM delivery_ledger WHERE inquiry_id=?", (inquiry_id,)
    ).fetchone()
    if row and row[1] == "UNCERTAIN":
        return {
            "state": "RECONCILE_REQUIRED",
            "intent_id": row[0],
            "inquiry_id": inquiry_id,
            "reason": "prior send state uncertain; verify Slack readback before retry",
            "delivery_created": False,
        }
    if row:
        return {
            "state": "DUPLICATE_INQUIRY",
            "intent_id": row[0],
            "inquiry_id": inquiry_id,
            "delivery_created": False,
        }
    intent_id = "intent-" + hashlib.sha256(inquiry_id.encode("utf-8")).hexdigest()[:20]
    reasons = packet.get("review_reasons") or []
    state = "AWAITING_APPROVAL" if packet.get("review_state") == "linked_verified" else "HELD_REVIEW"
    reason = "ready_for_approved_test" if state == "AWAITING_APPROVAL" else ",".join(reasons)
    message = render_message(packet)
    now = stamp()
    db.execute(
        "INSERT INTO delivery_ledger VALUES(?,?,?,?,?,?,?,?,?,?)",
        (intent_id, inquiry_id, packet["packet_id"], slack_event_id, state, message, "", reason, now, now),
    )
    return {
        "state": state,
        "intent_id": intent_id,
        "inquiry_id": inquiry_id,
        "delivery_created": True,
        "message": message,
        "approval_required": True,
        "live_actions": "forbidden",
    }


def mark_delivery_uncertain(db, inquiry_id, detail):
    now = stamp()
    db.execute(
        "UPDATE delivery_ledger SET state='UNCERTAIN', reason=?, updated_at=? WHERE inquiry_id=?",
        (text(detail) or "send outcome uncertain", now, inquiry_id),
    )


def handle_request(raw_body, headers, config, crm_snapshot, db, now=None, as_of=None):
    init(db)
    if len(raw_body) > config.max_body_bytes:
        return reject(413, "body_too_large")
    sig_error = verify_signature(raw_body, headers, config, now=now)
    if sig_error:
        return sig_error
    try:
        envelope = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return reject(400, "bad_payload", "request body must be JSON")
    if not isinstance(envelope, dict):
        return reject(400, "bad_payload", "Slack envelope must be a JSON object")
    if envelope.get("type") == "url_verification":
        challenge = envelope.get("challenge")
        if not isinstance(challenge, str) or len(challenge) > 1024:
            return reject(400, "bad_payload", "invalid Slack challenge")
        return {"status_code": 200, "state": "CHALLENGE", "challenge": challenge}
    body_hash = hashlib.sha256(raw_body).hexdigest()
    return process_envelope(envelope, config, crm_snapshot, db, body_hash, as_of=as_of)


def handle_socket_envelope(envelope, config, crm_snapshot, db, as_of=None):
    init(db)
    if not isinstance(envelope, dict):
        return reject(400, "bad_payload", "Slack envelope must be a JSON object")
    body_hash = "socket:" + hashlib.sha256(dumps(envelope).encode("utf-8")).hexdigest()
    return process_envelope(envelope, config, crm_snapshot, db, body_hash, as_of=as_of)


def process_envelope(envelope, config, crm_snapshot, db, body_hash, as_of=None):
    event_id = text(envelope.get("event_id"))
    envelope_error = validate_envelope(envelope, config)
    if envelope_error:
        return envelope_error
    with db:
        prior = saved_event(db, event_id, body_hash) if event_id else None
        if prior:
            return prior
        event = envelope["event"]
        if is_stop(event):
            stop_dispatch(db, event_id)
            cancelled = cancel_pending(db, event_id)
            response = {
                "status_code": 200,
                "state": "STOPPED",
                "cancelled_intents": cancelled,
                "offline_only": True,
                "live_actions": "forbidden",
            }
            save_event(db, envelope, "STOPPED", response, body_hash)
            return response
        try:
            packet_result = lead_agent.process(
                lead_event(envelope, config),
                crm_snapshot,
                db,
                set(config.allowed_source_ids),
                {config.channel_id},
                as_of=as_of,
            )
            packet = packet_result["packets"][0]
            delivery = stage_delivery(db, event_id, packet)
            response = {
                "status_code": 200,
                "state": delivery["state"],
                "slack_event_id": event_id,
                "packet_id": packet["packet_id"],
                "inquiry_id": packet["inquiry_id"],
                "lead_review": packet,
                "delivery": delivery,
                "offline_only": True,
                "live_actions": "forbidden",
            }
            save_event(db, envelope, response["state"], response, body_hash, packet["inquiry_id"])
            return response
        except (ValueError, OverflowError, OSError, sqlite3.Error) as exc:
            response = reject(200, "held", str(exc))
            save_event(db, envelope, "REJECTED", response, body_hash)
            return response


def socket_tokens(env=os.environ):
    bot_token = text(env.get("MOMENTUM_SLACK_BOT_TOKEN"))
    app_token = text(env.get("MOMENTUM_SLACK_APP_TOKEN"))
    missing = []
    if not bot_token:
        missing.append("MOMENTUM_SLACK_BOT_TOKEN")
    if not app_token:
        missing.append("MOMENTUM_SLACK_APP_TOKEN")
    if missing:
        raise ValueError("missing required external Socket Mode secret: " + ", ".join(missing))
    if not bot_token.startswith("xoxb-") or not app_token.startswith("xapp-"):
        raise ValueError("Slack Socket Mode secrets have unexpected token prefixes")
    return bot_token, app_token


def build_socket_app(config, crm_snapshot, db_path, as_of=None):
    bot_token, _app_token = socket_tokens()
    try:
        from slack_bolt import App
    except ImportError as exc:
        raise ValueError("install pinned slack_bolt requirements before Socket Mode run") from exc
    app = App(token=bot_token, process_before_response=False)
    identity = app.client.auth_test()
    if identity.get("team_id") != config.team_id or identity.get("user_id") != config.bot_user_id:
        raise ValueError("Socket Mode bot identity does not match configured Momentum team/user")

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
            "api_app_id": body.get("api_app_id"),
            "event_id": body.get("event_id"),
            "event_time": body.get("event_time"),
            "event": event,
        }
        db = sqlite3.connect(db_path)
        try:
            result = handle_socket_envelope(envelope, config, crm_snapshot, db, as_of=as_of)
        finally:
            db.close()
        if logger:
            logger.info("Momentum shadow receiver staged %s", result.get("state"))
        return {"state": result.get("state"), "reason": result.get("reason", "")}

    return app


def ack_payload(result):
    if result.get("state") == "CHALLENGE":
        return {"challenge": result["challenge"]}
    return {"state": result.get("state"), "reason": result.get("reason", "")}


def serve_loopback(bind, config, crm_snapshot, db_path, as_of=None):
    host, _, port_text = bind.partition(":")
    host = host or "127.0.0.1"
    port = int(port_text or "8787")
    if host not in {"127.0.0.1", "localhost"}:
        raise ValueError("shadow receiver binds only to loopback")

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            self.connection.settimeout(5)
            try:
                length = int(self.headers.get("content-length", "0"))
            except ValueError:
                self.send_response(411)
                self.end_headers()
                return
            if length < 0:
                result = reject(400, "invalid_content_length")
            elif length > config.max_body_bytes:
                result = reject(413, "body_too_large")
            else:
                try:
                    raw = self.rfile.read(length)
                except TimeoutError:
                    self.send_error(408)
                    return
                if len(raw) != length:
                    self.send_error(400)
                    return
                headers = {k: v for k, v in self.headers.items()}
                db = sqlite3.connect(db_path)
                try:
                    result = handle_request(raw, headers, config, crm_snapshot, db, as_of=as_of)
                finally:
                    db.close()
            ack = ack_payload(result)
            body = json.dumps(ack, separators=(",", ":")).encode("utf-8")
            self.send_response(int(result.get("status_code", 500)))
            self.send_header("content-type", "application/json")
            self.send_header("content-length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *_args):
            return

    server = HTTPServer((host, port), Handler)
    print(json.dumps({"state": "LISTENING", "bind": host + ":" + str(port), "offline_only": True}))
    server.serve_forever()


def serve_socket_mode(config, crm_snapshot, db_path, as_of=None):
    _bot_token, app_token = socket_tokens()
    try:
        from slack_bolt.adapter.socket_mode import SocketModeHandler
    except ImportError as exc:
        raise ValueError("install pinned slack_bolt requirements before Socket Mode run") from exc
    app = build_socket_app(config, crm_snapshot, db_path, as_of=as_of)
    print(json.dumps({"state": "SOCKET_MODE_STARTING", "offline_delivery_only": True}))
    SocketModeHandler(app, app_token).start()


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--body-json")
    parser.add_argument("--headers-json")
    parser.add_argument("--crm-json", required=True)
    parser.add_argument("--db", required=True)
    parser.add_argument("--output")
    parser.add_argument("--as-of")
    parser.add_argument("--now", type=int)
    parser.add_argument("--serve-loopback")
    parser.add_argument("--serve-socket-mode", action="store_true")
    args = parser.parse_args(argv)
    try:
        config = Config.from_env()
        crm = load(args.crm_json)
        if args.serve_socket_mode:
            serve_socket_mode(config, crm, args.db, as_of=args.as_of)
            return 0
        if args.serve_loopback:
            serve_loopback(args.serve_loopback, config, crm, args.db, as_of=args.as_of)
            return 0
        if not args.body_json or not args.headers_json or not args.output:
            raise ValueError("--body-json, --headers-json and --output are required unless --serve-loopback is used")
        raw = Path(args.body_json).read_bytes()
        headers = load(args.headers_json)
        Path(args.db).parent.mkdir(parents=True, exist_ok=True)
        db = sqlite3.connect(args.db)
        try:
            result = handle_request(raw, headers, config, crm, db, now=args.now, as_of=args.as_of)
        finally:
            db.close()
        target = Path(args.output)
        target.parent.mkdir(parents=True, exist_ok=True)
        tmp = target.with_suffix(target.suffix + ".tmp")
        tmp.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        tmp.replace(target)
        print(json.dumps({k: result.get(k) for k in ("status_code", "state", "reason", "inquiry_id")}))
        return 0 if result.get("status_code") == 200 else 2
    except (ValueError, OSError, sqlite3.Error) as exc:
        print(json.dumps({"state": "FAILED", "error": str(exc), "offline_only": True}))
        return 2


if __name__ == "__main__":
    sys.exit(main())
