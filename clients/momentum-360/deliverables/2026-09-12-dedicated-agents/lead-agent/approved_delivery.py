"""One explicitly approved Slack test delivery; never called by the receiver."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
import sqlite3

import slack_shadow_receiver as receiver


def deliver(db, approval, client, now=None):
    now = now or datetime.now(timezone.utc)
    if approval.get("approved") is not True or approval.get("purpose") != "controlled_test":
        raise ValueError("explicit controlled-test approval required")
    if approval.get("team_id") != receiver.EXPECTED_TEAM_ID or approval.get("channel_id") != receiver.EXPECTED_CHANNEL_ID:
        raise ValueError("approval destination mismatch")
    expiry = datetime.fromisoformat(approval["expires_at"].replace("Z", "+00:00"))
    if expiry.tzinfo is None or expiry <= now or not approval.get("approved_by"):
        raise ValueError("approval expired or missing approver")
    identity = client.auth_test()
    if identity.get("team_id") != approval["team_id"] or identity.get("user_id") != approval.get("bot_user_id"):
        raise ValueError("installed bot identity does not match approval")
    if not approval.get("bot_user_id"):
        raise ValueError("real bot identity required")
    receiver.init(db)
    db.commit()
    db.execute("BEGIN IMMEDIATE")
    try:
        row = db.execute("SELECT state,message FROM delivery_ledger WHERE intent_id=?", (approval.get("intent_id"),)).fetchone()
        if not row or row[0] not in {"AWAITING_APPROVAL", "HELD_REVIEW"}:
            raise ValueError("intent missing, already claimed, cancelled, or uncertain; do not resend")
        if receiver.dispatch_stopped(db):
            raise ValueError("dispatch is stopped")
        if row[0] == "HELD_REVIEW" and approval.get("allow_held_test") is not True:
            raise ValueError("held draft requires explicit held-test approval")
        message = row[1]
        digest = hashlib.sha256(message.encode("utf-8")).hexdigest()
        if approval.get("message_sha256") != digest:
            raise ValueError("approved content hash does not match current draft")
        db.execute("UPDATE delivery_ledger SET state='SENDING',reason=?,updated_at=? WHERE intent_id=?",
                   ("controlled_test_approved_by:" + str(approval["approved_by"]), receiver.stamp(), approval["intent_id"]))
        db.commit()  # Claim survives a crash. SENDING is never automatically retried.
    except Exception:
        db.rollback()
        raise
    ts = ""
    try:
        posted = client.chat_postMessage(channel=approval["channel_id"], text=message,
                                         unfurl_links=False, unfurl_media=False)
        ts = str(posted.get("ts", ""))
        if not posted.get("ok") or posted.get("channel") != approval["channel_id"] or not ts:
            raise ValueError("post receipt incomplete")
        readback = client.conversations_history(channel=approval["channel_id"], oldest=ts,
                                                latest=ts, inclusive=True, limit=1)
        matched = any(m.get("ts") == ts and m.get("text") == message and
                      m.get("user") == approval["bot_user_id"] for m in readback.get("messages", []))
        if not readback.get("ok") or not matched:
            raise ValueError("exact message readback unverified")
        state, reason = "DELIVERED", "controlled_test_exact_slack_readback"
    except Exception:
        # Error strings can include provider payloads. Keep only the safe state.
        state, reason = "UNCERTAIN", "inspect Slack and reconcile before any retry"
    with db:
        db.execute("UPDATE delivery_ledger SET state=?,slack_ts=?,reason=?,updated_at=? WHERE intent_id=?",
                   (state, ts, reason, receiver.stamp(), approval["intent_id"]))
    return {"state": state, "intent_id": approval["intent_id"], "slack_ts": ts}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--send-approved", action="store_true")
    parser.add_argument("--approval-json")
    parser.add_argument("--db")
    args = parser.parse_args()
    if not args.send_approved:
        print(json.dumps({"state": "DISABLED", "detail": "no network or delivery attempted"}))
        return 0
    if not args.approval_json or not args.db:
        parser.error("--approval-json and --db are required for an approved test")
    from slack_sdk import WebClient
    token = os.environ.get("MOMENTUM_SLACK_BOT_TOKEN", "")
    if not token.startswith("xoxb-"):
        raise ValueError("protected Momentum bot token required")
    # No SDK transport retries: an ambiguous post must be reconciled first.
    client = WebClient(token=token, retry_handlers=[], timeout=15)
    with sqlite3.connect(args.db) as db:
        result = deliver(db, receiver.load(args.approval_json), client)
    print(json.dumps(result))
    return 0 if result["state"] == "DELIVERED" else 2


if __name__ == "__main__":
    raise SystemExit(main())
