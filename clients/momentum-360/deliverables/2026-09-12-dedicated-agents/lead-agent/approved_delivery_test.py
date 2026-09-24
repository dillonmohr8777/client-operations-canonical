"""Mock-only check for the explicit delivery gate and ambiguous-send recovery."""
from datetime import datetime, timezone
import hashlib
import json
import sqlite3

from approved_delivery import deliver
import slack_shadow_receiver as receiver


class Slack:
    def __init__(self, db, failure=""):
        self.db, self.failure, self.posts = db, failure, 0

    def auth_test(self):
        return {"team_id": "WRONG" if self.failure == "identity" else receiver.EXPECTED_TEAM_ID, "user_id": "UBOT"}

    def chat_postMessage(self, **kwargs):
        assert self.db.execute("SELECT state FROM delivery_ledger").fetchone()[0] == "SENDING"
        self.posts += 1
        if self.failure == "timeout":
            raise TimeoutError()
        return {"ok": True, "channel": kwargs["channel"], "ts": "1.001"}

    def conversations_history(self, **kwargs):
        return {"ok": True, "messages": [{"ts": "1.001", "text": "wrong" if self.failure == "readback" else "Synthetic held test", "user": "UBOT"}]}


def setup(failure=""):
    db = sqlite3.connect(":memory:")
    receiver.init(db)
    db.execute("INSERT INTO delivery_ledger VALUES(?,?,?,?,?,?,?,?,?,?)",
               ("intent1", "inquiry1", "packet1", "event1", "HELD_REVIEW", "Synthetic held test", "", "mapping_required", "now", "now"))
    db.commit()
    approval = {"approved": True, "purpose": "controlled_test", "team_id": receiver.EXPECTED_TEAM_ID,
                "channel_id": receiver.EXPECTED_CHANNEL_ID, "bot_user_id": "UBOT", "intent_id": "intent1",
                "approved_by": "local-test-only", "allow_held_test": True, "expires_at": "2026-09-14T00:00:00Z",
                "message_sha256": hashlib.sha256(b"Synthetic held test").hexdigest()}
    return db, approval, Slack(db, failure)


def check():
    now = datetime(2026, 9, 13, tzinfo=timezone.utc)
    checks = 0
    for key, bad in [("approved", False), ("purpose", "routine"), ("team_id", "OTHER"),
                     ("channel_id", "OTHER"), ("expires_at", "2020-01-01T00:00:00Z"),
                     ("approved_by", ""), ("message_sha256", "wrong"), ("allow_held_test", False)]:
        db, approval, client = setup()
        approval[key] = bad
        try:
            deliver(db, approval, client, now)
            raise AssertionError("invalid approval accepted: " + key)
        except ValueError:
            assert client.posts == 0
        db.close()
        checks += 1
    for failure in ["", "timeout", "readback", "identity", "stop"]:
        db, approval, client = setup(failure)
        if failure == "stop":
            receiver.stop_dispatch(db, "stop1")
            db.commit()
        if failure in {"identity", "stop"}:
            try:
                deliver(db, approval, client, now)
                raise AssertionError("identity or stop ignored")
            except ValueError:
                assert client.posts == 0
        else:
            result = deliver(db, approval, client, now)
            assert result["state"] == ("DELIVERED" if not failure else "UNCERTAIN")
            try:
                deliver(db, approval, client, now)
                raise AssertionError("repeat post allowed")
            except ValueError:
                assert client.posts == 1
        db.close()
        checks += 1
    print(json.dumps({"state": "PASS", "checks": checks, "scope": "mocked delivery only; no network"}))


if __name__ == "__main__":
    check()
