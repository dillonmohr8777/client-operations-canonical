FROM node:24-bookworm-slim AS test

WORKDIR /app
COPY package.json ./
COPY src ./src
COPY test ./test
RUN node --test

FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787 \
    TOCK_ALLOWED_BUSINESS_ID=37824 \
    TOCK_DB_PATH=/data/tock-events.sqlite \
    TOCK_AUTH_HEADER_NAME=PutteryWebhookAuth \
    TOCK_MAX_BODY_BYTES=1048576

WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

RUN mkdir -p /data && chown node:node /data

USER node
EXPOSE 8787
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8787/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["node", "src/server.mjs"]
