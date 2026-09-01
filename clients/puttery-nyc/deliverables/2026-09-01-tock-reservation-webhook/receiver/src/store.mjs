import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

function compareUint64(left, right) {
  const a = BigInt(String(left));
  const b = BigInt(String(right));
  return a < b ? -1 : a > b ? 1 : 0;
}

export class ReservationStore {
  constructor(path) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reservation_state (
        business_id TEXT NOT NULL,
        reservation_id TEXT NOT NULL,
        version_id TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        safe_summary_json TEXT NOT NULL,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        PRIMARY KEY (business_id, reservation_id)
      );
      CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_id TEXT NOT NULL,
        reservation_id TEXT NOT NULL,
        version_id TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        received_at TEXT NOT NULL,
        outcome TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS filtered_deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        received_at TEXT NOT NULL,
        outcome TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS conflicts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_id TEXT NOT NULL,
        reservation_id TEXT NOT NULL,
        version_id TEXT NOT NULL,
        accepted_payload_hash TEXT NOT NULL,
        conflicting_payload_hash TEXT NOT NULL,
        conflicting_safe_summary_json TEXT NOT NULL,
        received_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open'
      );
      CREATE INDEX IF NOT EXISTS deliveries_received_at ON deliveries(received_at);
      CREATE INDEX IF NOT EXISTS deliveries_outcome ON deliveries(outcome);
      CREATE INDEX IF NOT EXISTS conflicts_status ON conflicts(status);
    `);

    const versionColumn = this.db.prepare("PRAGMA table_info(reservation_state)").all().find((column) => column.name === "version_id");
    if (String(versionColumn?.type).toUpperCase() !== "TEXT") {
      this.db.close();
      throw new Error("The local scaffold database uses an obsolete version_id schema. Select a new database path before continuing.");
    }

    this.selectState = this.db.prepare("SELECT * FROM reservation_state WHERE business_id = ? AND reservation_id = ?");
    this.insertState = this.db.prepare("INSERT INTO reservation_state (business_id, reservation_id, version_id, payload_hash, safe_summary_json, first_seen_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    this.updateState = this.db.prepare("UPDATE reservation_state SET version_id = ?, payload_hash = ?, safe_summary_json = ?, last_seen_at = ? WHERE business_id = ? AND reservation_id = ?");
    this.insertDelivery = this.db.prepare("INSERT INTO deliveries (business_id, reservation_id, version_id, payload_hash, received_at, outcome) VALUES (?, ?, ?, ?, ?, ?)");
    this.insertFilteredDelivery = this.db.prepare("INSERT INTO filtered_deliveries (received_at, outcome) VALUES (?, 'filtered_non_target')");
    this.insertConflict = this.db.prepare("INSERT INTO conflicts (business_id, reservation_id, version_id, accepted_payload_hash, conflicting_payload_hash, conflicting_safe_summary_json, received_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
  }

  apply(summary) {
    const now = new Date().toISOString();
    const safeJson = JSON.stringify(summary);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const current = this.selectState.get(summary.businessId, summary.reservationId);
      let outcome;
      if (!current) {
        this.insertState.run(summary.businessId, summary.reservationId, summary.versionId, summary.payloadHash, safeJson, now, now);
        outcome = "inserted";
      } else {
        const versionOrder = compareUint64(summary.versionId, current.version_id);
        if (versionOrder < 0) {
          outcome = "stale";
        } else if (versionOrder === 0 && summary.payloadHash === current.payload_hash) {
          outcome = "duplicate";
        } else if (versionOrder === 0) {
          this.insertConflict.run(
            summary.businessId,
            summary.reservationId,
            summary.versionId,
            current.payload_hash,
            summary.payloadHash,
            safeJson,
            now
          );
          outcome = "conflict";
        } else {
          this.updateState.run(summary.versionId, summary.payloadHash, safeJson, now, summary.businessId, summary.reservationId);
          outcome = "updated";
        }
      }
      this.insertDelivery.run(summary.businessId, summary.reservationId, summary.versionId, summary.payloadHash, now, outcome);
      this.db.exec("COMMIT");
      return outcome;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  recordFiltered() {
    this.insertFilteredDelivery.run(new Date().toISOString());
    return "filtered_non_target";
  }

  getState(businessId, reservationId) {
    return this.selectState.get(String(businessId), String(reservationId)) ?? null;
  }

  getOpenConflicts() {
    return this.db.prepare("SELECT * FROM conflicts WHERE status = 'open' ORDER BY received_at, id").all();
  }

  health() {
    return this.db.prepare("SELECT 1 AS ok").get().ok === 1;
  }

  pruneDeliveriesBefore(cutoffIso) {
    if (Number.isNaN(Date.parse(cutoffIso))) throw new TypeError("A valid ISO cutoff is required.");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const deliveries = this.db.prepare("DELETE FROM deliveries WHERE received_at < ?").run(cutoffIso).changes;
      const filtered = this.db.prepare("DELETE FROM filtered_deliveries WHERE received_at < ?").run(cutoffIso).changes;
      this.db.exec("COMMIT");
      return { deliveries, filtered };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  stats() {
    const stateCount = this.db.prepare("SELECT COUNT(*) AS count FROM reservation_state").get().count;
    const conflictCount = this.db.prepare("SELECT COUNT(*) AS count FROM conflicts WHERE status = 'open'").get().count;
    const outcomes = this.db.prepare("SELECT outcome, COUNT(*) AS count FROM deliveries GROUP BY outcome ORDER BY outcome").all();
    const filteredCount = this.db.prepare("SELECT COUNT(*) AS count FROM filtered_deliveries").get().count;
    const counts = Object.fromEntries(outcomes.map((row) => [row.outcome, row.count]));
    if (filteredCount > 0) counts.filtered_non_target = filteredCount;
    return { stateCount, conflictCount, outcomes: counts };
  }

  close() {
    this.db.close();
  }
}
