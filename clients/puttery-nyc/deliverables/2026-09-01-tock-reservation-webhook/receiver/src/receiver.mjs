import { createHash, timingSafeEqual } from "node:crypto";
import { hashPayload, summarizeReservation } from "./tock.mjs";

function send(res, statusCode, outcome) {
  res.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "x-tock-receiver-outcome": outcome
  });
  res.end(statusCode === 204 ? undefined : JSON.stringify({ outcome }));
}

function secureEqual(actual, expected) {
  const left = createHash("sha256").update(String(actual ?? "")).digest();
  const right = createHash("sha256").update(String(expected ?? "")).digest();
  return timingSafeEqual(left, right);
}

async function readBody(req, maxBodyBytes) {
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > maxBodyBytes) {
      const error = new Error("Request body exceeds configured maximum.");
      error.code = "BODY_TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function validateReceiverConfig({ allowedBusinessId, authHeaderName, authHeaderValue, maxBodyBytes = 1_048_576 }) {
  if (!/^[1-9]\d*$/.test(String(allowedBusinessId ?? ""))) throw new Error("TOCK_ALLOWED_BUSINESS_ID must be the verified positive Tock business ID.");
  if (!/^[A-Za-z0-9-]+$/.test(authHeaderName ?? "")) throw new Error("A valid TOCK_AUTH_HEADER_NAME is required.");
  if (String(authHeaderValue ?? "").length < 32 || authHeaderValue === "load_from_secret_manager") {
    throw new Error("TOCK_AUTH_HEADER_VALUE must be a non-placeholder secret of at least 32 characters.");
  }
  if (!Number.isSafeInteger(maxBodyBytes) || maxBodyBytes <= 0) throw new Error("TOCK_MAX_BODY_BYTES must be a positive integer.");
}

export function createReceiver({ allowedBusinessId, authHeaderName, authHeaderValue, maxBodyBytes = 1_048_576, store, logger = console }) {
  validateReceiverConfig({ allowedBusinessId, authHeaderName, authHeaderValue, maxBodyBytes });
  if (!store) throw new Error("A durable reservation store is required.");

  return async function receiver(req, res) {
    if (req.method === "GET" && req.url === "/healthz") {
      try {
        const healthy = store.health();
        send(res, healthy ? 200 : 503, healthy ? "healthy" : "unhealthy");
      } catch {
        send(res, 503, "unhealthy");
      }
      return;
    }
    if (req.method !== "POST" || req.url !== "/webhooks/tock/reservations") {
      send(res, 404, "not_found");
      return;
    }

    const headerValue = req.headers[authHeaderName.toLowerCase()];
    const actual = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (!secureEqual(actual, authHeaderValue)) {
      send(res, 401, "unauthorized");
      return;
    }

    const contentType = String(req.headers["content-type"] ?? "").split(";", 1)[0].trim().toLowerCase();
    if (contentType !== "application/json") {
      send(res, 415, "unsupported_media_type");
      return;
    }

    try {
      const rawBody = await readBody(req, maxBodyBytes);
      const payload = JSON.parse(rawBody.toString("utf8"));
      const summary = summarizeReservation(payload, hashPayload(payload));

      if (summary.businessId !== String(allowedBusinessId)) {
        store.recordFiltered();
        send(res, 204, "filtered_non_target");
        return;
      }

      const outcome = store.apply(summary);
      const reservationHash = createHash("sha256").update(summary.reservationId).digest("hex").slice(0, 16);
      logger.info(JSON.stringify({ source: "tock", businessId: summary.businessId, reservationHash, outcome }));
      send(res, outcome === "conflict" ? 202 : 204, outcome);
    } catch (error) {
      if (error instanceof SyntaxError) {
        send(res, 400, "invalid_json");
        return;
      }
      if (error instanceof TypeError || error.code === "BODY_TOO_LARGE") {
        send(res, error.code === "BODY_TOO_LARGE" ? 413 : 422, "invalid_payload");
        return;
      }
      logger.error(JSON.stringify({ source: "tock", outcome: "store_failure", errorType: error?.name ?? "Error" }));
      send(res, 500, "store_failure");
    }
  };
}
