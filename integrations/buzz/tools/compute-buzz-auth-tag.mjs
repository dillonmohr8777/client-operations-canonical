import { createHash, randomBytes } from "node:crypto";
import { schnorr } from "../runtime/auth-tool/node_modules/@noble/curves/secp256k1.js";

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  // Windows PowerShell may emit a UTF-8 BOM on redirected stdin. JSON.parse
  // does not accept it, even though the remaining payload is valid JSON.
  const payload = JSON.parse(input.replace(/^\uFEFF/, ""));
  const ownerSecretHex = String(payload.ownerSecretHex ?? "");
  const agentPubkeyHex = String(payload.agentPubkeyHex ?? "");
  const conditions = String(payload.conditions ?? "");

  if (!/^[a-f0-9]{64}$/.test(ownerSecretHex) || !/^[a-f0-9]{64}$/.test(agentPubkeyHex)) {
    throw new Error("Buzz owner and agent keys must be 32-byte lowercase hex.");
  }
  if (conditions !== "") {
    throw new Error("This helper currently permits only an unrestricted owner attestation.");
  }

  const ownerSecret = Buffer.from(ownerSecretHex, "hex");
  const ownerPubkeyHex = Buffer.from(schnorr.getPublicKey(ownerSecret)).toString("hex");
  if (ownerPubkeyHex === agentPubkeyHex) {
    throw new Error("Buzz owner and agent identities must differ.");
  }

  const preimage = `nostr:agent-auth:${agentPubkeyHex}:${conditions}`;
  const message = createHash("sha256").update(preimage, "utf8").digest();
  const signature = schnorr.sign(message, ownerSecret, randomBytes(32));
  if (!schnorr.verify(signature, message, Buffer.from(ownerPubkeyHex, "hex"))) {
    throw new Error("Buzz owner attestation did not verify.");
  }

  process.stdout.write(
    JSON.stringify(["auth", ownerPubkeyHex, conditions, Buffer.from(signature).toString("hex")]),
  );
});
