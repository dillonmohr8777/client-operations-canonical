import { createServer } from "node:http";
import { createReceiver, validateReceiverConfig } from "./receiver.mjs";
import { ReservationStore } from "./store.mjs";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 8787);
const dbPath = process.env.TOCK_DB_PATH ?? ".data/tock-events.sqlite";
const config = {
  allowedBusinessId: process.env.TOCK_ALLOWED_BUSINESS_ID,
  authHeaderName: process.env.TOCK_AUTH_HEADER_NAME,
  authHeaderValue: process.env.TOCK_AUTH_HEADER_VALUE,
  maxBodyBytes: Number(process.env.TOCK_MAX_BODY_BYTES ?? 1_048_576)
};
validateReceiverConfig(config);
if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) throw new Error("PORT must be an integer from 1 through 65535.");
const store = new ReservationStore(dbPath);
const receiver = createReceiver({
  ...config,
  store
});
const server = createServer(receiver);

server.listen(port, host, () => {
  console.info(JSON.stringify({ service: "puttery-nyc-tock-receiver", host, port, status: "listening" }));
});

function shutdown(signal) {
  console.info(JSON.stringify({ service: "puttery-nyc-tock-receiver", signal, status: "stopping" }));
  server.close(() => {
    store.close();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
