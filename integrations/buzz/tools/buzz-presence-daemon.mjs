import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { schnorr } from "../runtime/auth-tool/node_modules/@noble/curves/secp256k1.js";

const HEARTBEAT_MS = 30_000;
const AUTH_TIMEOUT_MS = 25_000;
const RECONNECT_MAX_MS = 30_000;

function fail(message) {
  throw new Error(message);
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || index + 1 >= process.argv.length) {
    fail(`Missing ${name}.`);
  }
  return process.argv[index + 1];
}

const agentId = readArgument("--agent-id");
const statusFile = readArgument("--status-file");
const relayUrlRaw = String(process.env.BUZZ_RELAY_URL ?? "").trim();
const privateKeyHex = String(process.env.BUZZ_PRIVATE_KEY ?? "").trim();
const authTagRaw = String(process.env.BUZZ_AUTH_TAG ?? "").trim();

delete process.env.BUZZ_PRIVATE_KEY;
delete process.env.BUZZ_AUTH_TAG;

if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(agentId)) {
  fail("Agent ID is invalid.");
}
if (!/^wss:\/\/[A-Za-z0-9.-]+(?::\d{2,5})?\/?$/.test(relayUrlRaw)) {
  fail("Buzz relay URL is invalid.");
}
if (!/^[a-f0-9]{64}$/.test(privateKeyHex)) {
  fail("Buzz private key has an invalid shape.");
}

let authTag;
try {
  authTag = JSON.parse(authTagRaw);
} catch {
  fail("Buzz authorization tag is invalid JSON.");
}
if (
  !Array.isArray(authTag) ||
  authTag.length !== 4 ||
  authTag[0] !== "auth" ||
  !/^[a-f0-9]{64}$/.test(String(authTag[1] ?? "")) ||
  String(authTag[2] ?? "") !== "" ||
  !/^[a-f0-9]{128}$/.test(String(authTag[3] ?? ""))
) {
  fail("Buzz authorization tag has an invalid shape.");
}

const relayUrl = new URL(relayUrlRaw).toString();
const privateKey = Buffer.from(privateKeyHex, "hex");
const publicKey = Buffer.from(schnorr.getPublicKey(privateKey)).toString("hex");
let socket = null;
let authenticated = false;
let heartbeatTimer = null;
let authTimer = null;
let reconnectTimer = null;
let reconnectDelayMs = 1_000;
let stopping = false;
let lastAcceptedAt = null;

function writeStatus(state, errorCode = null) {
  const payload = {
    schemaVersion: 1,
    agentId,
    publicKey,
    pid: process.pid,
    state,
    updatedAt: new Date().toISOString(),
    lastAcceptedAt,
    errorCode,
    containsSecrets: false,
  };
  mkdirSync(dirname(statusFile), { recursive: true });
  const temporaryFile = `${statusFile}.${process.pid}.tmp`;
  writeFileSync(temporaryFile, `${JSON.stringify(payload, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  renameSync(temporaryFile, statusFile);
}

function signEvent(kind, content, tags) {
  const created_at = Math.floor(Date.now() / 1000);
  const serialized = JSON.stringify([
    0,
    publicKey,
    created_at,
    kind,
    tags,
    content,
  ]);
  const id = createHash("sha256").update(serialized, "utf8").digest();
  const sig = schnorr.sign(id, privateKey, randomBytes(32));
  return {
    id: Buffer.from(id).toString("hex"),
    pubkey: publicKey,
    created_at,
    kind,
    tags,
    content,
    sig: Buffer.from(sig).toString("hex"),
  };
}

function publishPresence(status) {
  if (!socket || socket.readyState !== WebSocket.OPEN || !authenticated) {
    return;
  }
  // Match Buzz's official ACP harness exactly: the NIP-OA tag belongs on the
  // NIP-42 AUTH event, while live presence itself is a bare kind:20001 event.
  const event = signEvent(20001, status, []);
  socket.send(JSON.stringify(["EVENT", event]));
}

function clearConnectionTimers() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (authTimer) {
    clearTimeout(authTimer);
    authTimer = null;
  }
}

function scheduleReconnect(errorCode) {
  clearConnectionTimers();
  authenticated = false;
  if (stopping || reconnectTimer) {
    return;
  }
  writeStatus("reconnecting", errorCode);
  const delay = reconnectDelayMs;
  reconnectDelayMs = Math.min(reconnectDelayMs * 2, RECONNECT_MAX_MS);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

function connect() {
  if (stopping) {
    return;
  }
  writeStatus("connecting");
  const currentSocket = new WebSocket(relayUrl);
  socket = currentSocket;
  authenticated = false;

  authTimer = setTimeout(() => {
    if (socket === currentSocket) {
      writeStatus("reconnecting", "auth_timeout");
      currentSocket.close();
    }
  }, AUTH_TIMEOUT_MS);

  currentSocket.addEventListener("message", (message) => {
    if (socket !== currentSocket || typeof message.data !== "string") {
      return;
    }
    let frame;
    try {
      frame = JSON.parse(message.data);
    } catch {
      return;
    }
    if (!Array.isArray(frame)) {
      return;
    }

    if (frame[0] === "AUTH" && typeof frame[1] === "string") {
      const authEvent = signEvent(22242, "", [
        ["relay", relayUrl],
        ["challenge", frame[1]],
        authTag,
      ]);
      currentSocket.send(JSON.stringify(["AUTH", authEvent]));
      return;
    }

    if (
      frame[0] === "OK" &&
      typeof frame[1] === "string" &&
      typeof frame[2] === "boolean"
    ) {
      if (!frame[2]) {
        writeStatus("reconnecting", authenticated ? "presence_rejected" : "auth_rejected");
        currentSocket.close();
        return;
      }
      if (!authenticated) {
        authenticated = true;
        reconnectDelayMs = 1_000;
        if (authTimer) {
          clearTimeout(authTimer);
          authTimer = null;
        }
        publishPresence("online");
        heartbeatTimer = setInterval(
          () => publishPresence("online"),
          HEARTBEAT_MS,
        );
        return;
      }
      lastAcceptedAt = new Date().toISOString();
      writeStatus("online");
    }
  });

  currentSocket.addEventListener("close", () => {
    if (socket === currentSocket) {
      socket = null;
      scheduleReconnect("connection_closed");
    }
  });

  currentSocket.addEventListener("error", () => {
    if (socket === currentSocket) {
      writeStatus("reconnecting", "connection_error");
    }
  });
}

function stop() {
  if (stopping) {
    return;
  }
  stopping = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  clearConnectionTimers();
  writeStatus("stopping");
  if (socket && socket.readyState === WebSocket.OPEN && authenticated) {
    publishPresence("offline");
    setTimeout(() => {
      socket?.close();
      process.exit(0);
    }, 250);
  } else {
    socket?.close();
    process.exit(0);
  }
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
process.on("uncaughtException", () => {
  try {
    writeStatus("failed", "uncaught_exception");
  } finally {
    process.exit(1);
  }
});
process.on("unhandledRejection", () => {
  try {
    writeStatus("failed", "unhandled_rejection");
  } finally {
    process.exit(1);
  }
});

writeStatus("starting");
connect();
