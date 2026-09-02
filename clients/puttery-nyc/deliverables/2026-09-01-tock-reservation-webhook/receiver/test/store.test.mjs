import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { ReservationStore } from "../src/store.mjs";

function summary(versionId, payloadHash) {
  return { businessId: "707", reservationId: "413", versionId: String(versionId), payloadHash, amounts: {}, lifecycle: {}, keyValueNames: [], signalsPresent: {} };
}

test("applies newer versions and suppresses duplicates, stale updates, and conflicts", () => {
  const store = new ReservationStore(":memory:");
  try {
    assert.equal(store.apply(summary(10, "a".repeat(64))), "inserted");
    assert.equal(store.apply(summary(10, "a".repeat(64))), "duplicate");
    assert.equal(store.apply(summary(9, "b".repeat(64))), "stale");
    assert.equal(store.apply(summary(10, "c".repeat(64))), "conflict");
    assert.equal(store.apply(summary(11, "d".repeat(64))), "updated");
    assert.equal(store.getState("707", "413").version_id, "11");
    assert.equal(store.getOpenConflicts().length, 1);
    assert.equal(store.getOpenConflicts()[0].conflicting_payload_hash, "c".repeat(64));
    assert.deepEqual(store.stats().outcomes, { conflict: 1, duplicate: 1, inserted: 1, stale: 1, updated: 1 });
  } finally {
    store.close();
  }
});

test("persists state and suppresses a retry after restart", () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "puttery-tock-store-"));
  const dbPath = join(tempRoot, "receiver.sqlite");
  try {
    const first = new ReservationStore(dbPath);
    assert.equal(first.apply(summary("18446744073709551614", "e".repeat(64))), "inserted");
    first.close();

    const second = new ReservationStore(dbPath);
    try {
      assert.equal(second.health(), true);
      assert.equal(second.apply(summary("18446744073709551614", "e".repeat(64))), "duplicate");
      assert.equal(second.apply(summary("18446744073709551615", "f".repeat(64))), "updated");
      assert.equal(second.getState("707", "413").version_id, "18446744073709551615");
    } finally {
      second.close();
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});
