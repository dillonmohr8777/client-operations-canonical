import { createHash, randomBytes } from "node:crypto";
import { schnorr } from "../runtime/auth-tool/node_modules/@noble/curves/secp256k1.js";

const relayUrlRaw = String(process.env.BUZZ_RELAY_URL ?? "").trim();
const privateKeyHex = String(process.env.BUZZ_PRIVATE_KEY ?? "").trim();
const expectedRaw = String(process.env.BUZZ_EXPECTED_PUBKEYS ?? "").trim();
delete process.env.BUZZ_PRIVATE_KEY;
delete process.env.BUZZ_EXPECTED_PUBKEYS;

if (!/^wss:\/\/[A-Za-z0-9.-]+(?::\d{2,5})?\/?$/.test(relayUrlRaw)) {
  throw new Error("Buzz relay URL is invalid.");
}
if (!/^[a-f0-9]{64}$/.test(privateKeyHex)) {
  throw new Error("Buzz private key has an invalid shape.");
}
const expected = new Set(
  expectedRaw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => /^[a-f0-9]{64}$/.test(value)),
);
if (expected.size === 0) {
  throw new Error("Expected Buzz presence roster is empty.");
}

const relayUrl = new URL(relayUrlRaw).toString();
const privateKey = Buffer.from(privateKeyHex, "hex");
const publicKey = Buffer.from(schnorr.getPublicKey(privateKey)).toString("hex");
const seen = new Set();
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
  const result = {
    expected: expected.size,
    seen: seen.size,
    allSeen: seen.size === expected.size,
    errorCode,
    containsSecrets: false,
  };
  process.stdout.write(`${JSON.stringify(result)}\n`);
  socket.close();
  setTimeout(() => process.exit(errorCode || !result.allSeen ? 1 : 0), 100);
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
          "presence-observer",
          { kinds: [20001], limit: 0 },
        ]),
      );
    }
    return;
  }

  if (
    frame[0] === "EVENT" &&
    frame[1] === "presence-observer" &&
    frame[2] &&
    typeof frame[2] === "object"
  ) {
    const event = frame[2];
    const author = String(event.pubkey ?? "").toLowerCase();
    if (
      Number(event.kind) === 20001 &&
      String(event.content) === "online" &&
      expected.has(author)
    ) {
      seen.add(author);
      if (seen.size === expected.size) {
        finish();
      }
    }
  }
});

socket.addEventListener("error", () => finish("connection_error"));
socket.addEventListener("close", () => {
  if (!finished) {
    finish("connection_closed");
  }
});

setTimeout(() => finish(seen.size === expected.size ? null : "presence_timeout"), 40_000);
