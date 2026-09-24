import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { processRegistration } from "./calendar-invites-api.mjs";

const EXPECTED_SITE_NAME = "momentum-workshop-pilot";
const EXPECTED_FORM_NAME = "workshop-registration";

export default async function calendarInvitesWebhook(request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed.", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const rawBody = await request.text();
  const signaturePresent = Boolean(
    request.headers.get("x-webhook-signature"),
  );
  const secretPresent = Boolean(process.env.MOMENTUM_FORM_WEBHOOK_SECRET);
  const signatureValid = verifyNetlifySignature(
    request.headers.get("x-webhook-signature"),
    rawBody,
    process.env.MOMENTUM_FORM_WEBHOOK_SECRET,
  );
  console.log(JSON.stringify({
    stage: "signature_check",
    signature_present: signaturePresent,
    secret_present: secretPresent,
    signature_valid: signatureValid,
  }));
  if (!signatureValid) {
    return new Response("Forbidden.", { status: 403 });
  }

  let submission;
  try {
    submission = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON.", { status: 400 });
  }

  if (
    submission.site_name !== EXPECTED_SITE_NAME ||
    submission.form_name !== EXPECTED_FORM_NAME ||
    !submission.data
  ) {
    console.log(JSON.stringify({ stage: "submission_ignored" }));
    return new Response(null, { status: 204 });
  }

  const result = await processRegistration({
    ...submission.data,
    "form-name": submission.form_name,
  });
  console.log(JSON.stringify({
    stage: "submission_processed",
    status: result.status,
  }));

  return Response.json(result, { status: 200 });
}

export function verifyNetlifySignature(token, rawBody, secret) {
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  let header;
  let payload;
  try {
    header = JSON.parse(decodeBase64Url(encodedHeader).toString("utf8"));
    payload = JSON.parse(decodeBase64Url(encodedPayload).toString("utf8"));
  } catch {
    return false;
  }
  if (header.alg !== "HS256" || payload.iss !== "netlify") return false;
  if (
    payload.exp !== undefined &&
    (!Number.isFinite(payload.exp) || payload.exp < Math.floor(Date.now() / 1000))
  ) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  let actualSignature;
  try {
    actualSignature = decodeBase64Url(encodedSignature);
  } catch {
    return false;
  }
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return false;
  }

  const bodyHash = createHash("sha256").update(rawBody).digest("hex");
  return typeof payload.sha256 === "string" &&
    timingSafeEqual(Buffer.from(payload.sha256), Buffer.from(bodyHash));
}

function decodeBase64Url(value) {
  return Buffer.from(value, "base64url");
}
