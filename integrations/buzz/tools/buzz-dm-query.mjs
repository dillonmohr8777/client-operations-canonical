import { createHash, randomBytes } from "node:crypto";
import { schnorr } from "../runtime/auth-tool/node_modules/@noble/curves/secp256k1.js";

const QUERY_TIMEOUT_MS = 25_000;

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

const channelId = readArgument("--channel");
const sinceRaw = readArgument("--since");
const limitRaw = readArgument("--limit");
const relayUrlRaw = String(process.env.BUZZ_RELAY_URL ?? "").trim();
const privateKeyHex = String(process.env.BUZZ_PRIVATE_KEY ?? "").trim();

delete process.env.BUZZ_PRIVATE_KEY;

if (!/^[a-f0-9-]{36}$/.test(channelId)) {
  fail("Buzz DM channel is invalid.");
}
if (!/^\d{1,12}$/.test(sinceRaw)) {
  fail("Buzz DM query start time is invalid.");
}
if (!/^\d{1,3}$/.test(limitRaw)) {
  fail("Buzz DM query limit is invalid.");
}
if (!/^wss:\/\/[A-Za-z0-9.-]+(?::\d{2,5})?\/?$/.test(relayUrlRaw)) {
  fail("Buzz relay URL is invalid.");
}
if (!/^[a-f0-9]{64}$/.test(privateKeyHex)) {
  fail("Buzz private key has an invalid shape.");
}

const since = Number(sinceRaw);
const limit = Math.max(1, Math.min(200, Number(limitRaw)));
const relayUrl = new URL(relayUrlRaw).toString();
const privateKey = Buffer.from(privateKeyHex, "hex");
const publicKey = Buffer.from(schnorr.getPublicKey(privateKey)).toString("hex");
const subscriptionId = `dm-${randomBytes(8).toString("hex")}`;
const events = [];
let authEventId = null;
let subscribed = false;
let finished = false;
const socket = new WebSocket(relayUrl);

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
  const idBytes = createHash("sha256").update(serialized, "utf8").digest();
  const signature = schnorr.sign(idBytes, privateKey, randomBytes(32));
  return {
    id: idBytes.toString("hex"),
    pubkey: publicKey,
    created_at,
    kind,
    tags,
    content,
    sig: Buffer.from(signature).toString("hex"),
  };
}

function finish(errorCode = null) {
  if (finished) {
    return;
  }
  finished = true;
  if (errorCode) {
    process.stderr.write(`${errorCode}\n`);
  } else {
    const normalized = events
      .sort(
        (left, right) =>
          Number(left.created_at ?? 0) - Number(right.created_at ?? 0),
      )
      .map((event) => ({
        id: String(event.id ?? ""),
        pubkey: String(event.pubkey ?? ""),
        created_at: Number(event.created_at ?? 0),
        kind: Number(event.kind ?? 0),
        tags: Array.isArray(event.tags) ? event.tags : [],
        content: String(event.content ?? ""),
      }));
    process.stdout.write(`${JSON.stringify(normalized)}\n`);
  }
  socket.close();
  setTimeout(() => process.exit(errorCode ? 1 : 0), 100);
}

socket.addEventListener("message", (message) => {
  if (typeof message.data !== "string") {
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
    ]);
    authEventId = authEvent.id;
    socket.send(JSON.stringify(["AUTH", authEvent]));
    return;
  }

  if (frame[0] === "OK" && frame[1] === authEventId) {
    if (frame[2] !== true) {
      finish("auth_rejected");
      return;
    }
    if (!subscribed) {
      subscribed = true;
      socket.send(
        JSON.stringify([
          "REQ",
          subscriptionId,
          {
            kinds: [9, 40002, 40008, 45001, 45003],
            "#h": [channelId],
            since,
            limit,
          },
        ]),
      );
    }
    return;
  }

  if (
    frame[0] === "EVENT" &&
    frame[1] === subscriptionId &&
    frame[2] &&
    typeof frame[2] === "object"
  ) {
    events.push(frame[2]);
    return;
  }

  if (frame[0] === "EOSE" && frame[1] === subscriptionId) {
    finish();
    return;
  }

  if (frame[0] === "CLOSED" && frame[1] === subscriptionId) {
    finish("subscription_closed");
  }
});

socket.addEventListener("error", () => finish("connection_error"));
socket.addEventListener("close", () => {
  if (!finished) {
    finish("connection_closed");
  }
});

setTimeout(() => finish("query_timeout"), QUERY_TIMEOUT_MS);
